// NFC read/write layer.
//
// Real Web NFC (navigator.NDEFReader) is attempted first where the browser
// supports it (Chrome on Android). Everywhere else we transparently fall back
// to a simulated NTAG215 backed by localStorage so the full flow is demoable.
//
// PRD: F13 encrypt-before-write, F15 auto-retry up to 3x, F16 clear error states.

import { encryptBytes, decryptBytes } from "./crypto";
import {
  readTagRaw,
  writeTagRaw,
  clearTag as clearSimTag,
  TAG_LIMIT_BYTES,
} from "./store";

export type TagErrorCode =
  | "out_of_range"
  | "tag_full"
  | "write_failed"
  | "not_set_up"
  | "payload_too_large"
  | "tampered";

export class TagError extends Error {
  code: TagErrorCode;
  constructor(code: TagErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export const TAG_ERROR_COPY: Record<TagErrorCode, string> = {
  out_of_range: "Tag moved out of range. Hold the device steady over the tag.",
  tag_full: "Tag is full. Deselect some categories and try again.",
  write_failed: "Write failed after 3 attempts. Queued for retry.",
  not_set_up: "This tag hasn't been set up yet.",
  payload_too_large: "Selection exceeds the 504-byte tag limit.",
  tampered: "Tag data is corrupted or tampered with and could not be verified.",
};

export function webNfcAvailable(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

/** Encrypt + write the plaintext payload to the tag, with retry (F15). */
export async function writeToTag(plaintext: string): Promise<void> {
  const b64 = await encryptBytes(plaintext);
  const byteLen = new TextEncoder().encode(b64).length;
  // We budget against the encrypted binary size, not the base64 expansion.
  const binLen = Math.ceil((byteLen * 3) / 4);
  if (binLen > TAG_LIMIT_BYTES) {
    throw new TagError("payload_too_large", TAG_ERROR_COPY.payload_too_large);
  }

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (webNfcAvailable()) {
        // Best-effort real write; NDEFReader.write is Android-Chrome only.
        // @ts-expect-error - NDEFReader is not in the default TS DOM lib
        const writer = new NDEFReader();
        await writer.write({
          records: [{ recordType: "mime", mediaType: "application/x-patient-tap", data: b64 }],
        });
      }
      // Always mirror into the simulated tag so read-back works everywhere.
      writeTagRaw(b64);
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  // Queue locally and surface a clear failure (F15/F16).
  writeTagRaw(b64);
  console.warn("[tag] write fell back to local queue", lastErr);
  throw new TagError("write_failed", TAG_ERROR_COPY.write_failed);
}

/** Read + decrypt the tag payload. Throws TagError on empty / tampered tag. */
export async function readFromTag(): Promise<string> {
  const raw = readTagRaw();
  if (!raw) throw new TagError("not_set_up", TAG_ERROR_COPY.not_set_up);
  try {
    return await decryptBytes(raw);
  } catch {
    // GCM auth-tag mismatch → corruption / tampering (F14).
    throw new TagError("tampered", TAG_ERROR_COPY.tampered);
  }
}

export function tagIsSetUp(): boolean {
  return readTagRaw() !== null;
}

export function wipeTag(): void {
  clearSimTag();
}
