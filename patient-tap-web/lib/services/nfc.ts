import { encryptProfile } from "./crypto";
import { scannedPatient } from "@/lib/mock-data";

/**
 * STUB NFC hardware layer — web parallel of Flutter `nfc_service.dart`.
 *
 * TODO(nfc/hardware): replace with the real implementation:
 *   - Web NFC (NDEFReader) session / native bridge on mobile
 *   - NTAG215 read/write (504 usable bytes)
 */

/** Usable capacity of an NTAG215 in bytes (matches the real hardware target). */
export const TAG_CAPACITY_BYTES = 504;

const SCAN_LATENCY = 1400;
const WRITE_LATENCY = 1600;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Why a write to the tag failed — drives specific copy on the write screen. */
export type TagWriteError = "moved" | "full" | "unknown";

export function tagWriteErrorMessage(e: TagWriteError): string {
  switch (e) {
    case "moved":
      return "Tag moved — hold the phone steady on the wristband and try again.";
    case "full":
      return "Tag full — trim old treatment-log entries to free space.";
    default:
      return "Write failed — try again.";
  }
}

export interface TagWriteResult {
  ok: boolean;
  error: TagWriteError | null;
}

/**
 * Write bytes to the tag. Randomly fails ~20% of the time so the UI error
 * states can be exercised during development.
 */
export async function writeToTag(bytes: Uint8Array): Promise<TagWriteResult> {
  // TODO(nfc/hardware): real NDEF write to the NTAG215.
  await sleep(WRITE_LATENCY);

  if (bytes.length > TAG_CAPACITY_BYTES) {
    return { ok: false, error: "full" };
  }
  if (Math.random() < 0.2) {
    return { ok: false, error: "moved" };
  }
  return { ok: true, error: null };
}

/**
 * Read raw bytes from a tag. Returns null if no tag was present / the read was
 * aborted. The mock returns a freshly-"encrypted" demo patient so the responder
 * flow has something to decrypt (~10% "no tag" to exercise the empty state).
 */
export async function readFromTag(): Promise<Uint8Array | null> {
  // TODO(nfc/hardware): real NDEF read from the tag.
  await sleep(SCAN_LATENCY);
  if (Math.random() < 0.1) return null;
  return encryptProfile(scannedPatient());
}
