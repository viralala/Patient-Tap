import {
  profileFromMap,
  profileToMap,
  type LogEntry,
  type PatientProfile,
} from "@/lib/models";

/**
 * STUB crypto layer — web parallel of Flutter `crypto_service.dart`.
 *
 * TODO(backend/crypto): replace the bodies with the real implementation:
 *   - protobuf serialization of PatientProfile
 *   - AES-256-GCM encrypt/decrypt (key from device/keystore)
 * The exported signatures are the integration contract. Keep them stable and
 * the screens will not need to change.
 */

const LATENCY = 350;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Outcome of a decrypt attempt.
 *
 * The real crypto layer uses AES-256-GCM; a failed GCM auth tag means the bytes
 * were tampered with (or corrupted). We surface that explicitly instead of a
 * bare null so the responder UI can show a distinct "tampered" error.
 */
export interface DecryptResult {
  profile: PatientProfile | null;
  tampered: boolean;
}

export const decryptOk = (r: DecryptResult): boolean =>
  r.profile !== null && !r.tampered;

/** Serialize + "encrypt" a profile into tag-ready bytes. */
export async function encryptProfile(profile: PatientProfile): Promise<Uint8Array> {
  // TODO(backend/crypto): protobuf + AES-256-GCM -> (nonce ‖ ct ‖ tag).
  await sleep(LATENCY);
  const json = JSON.stringify(profileToMap(profile));
  return new TextEncoder().encode(json);
}

/** Decrypt + deserialize tag bytes back into a profile. */
export async function decryptProfile(bytes: Uint8Array): Promise<DecryptResult> {
  // TODO(backend/crypto): AES-256-GCM open; a bad auth tag -> tampered.
  await sleep(LATENCY);
  try {
    const map = JSON.parse(new TextDecoder().decode(bytes));
    return { profile: profileFromMap(map), tampered: false };
  } catch {
    return { profile: null, tampered: true };
  }
}

/**
 * Append a new LogEntry to an already-encrypted blob and return the new blob.
 * Real impl decrypts, appends to the protobuf repeated field, re-encrypts.
 */
export async function appendLogEntry(
  existingBytes: Uint8Array,
  entry: LogEntry,
): Promise<Uint8Array> {
  // TODO(backend/crypto): decrypt -> append -> re-encrypt in place.
  await sleep(LATENCY);
  const decoded = await decryptProfile(existingBytes);
  if (!decoded.profile) return existingBytes;
  const updated: PatientProfile = {
    ...decoded.profile,
    treatmentLog: [...decoded.profile.treatmentLog, entry],
    updatedAt: new Date(),
  };
  return encryptProfile(updated);
}

/**
 * Byte length a profile would occupy on the tag once "encrypted".
 * Mock estimate (JSON UTF-8 length); real impl returns ciphertext length.
 * Used by the storage gauge and the "tag full" guard.
 */
export function estimateEncodedBytes(profile: PatientProfile): number {
  return new TextEncoder().encode(JSON.stringify(profileToMap(profile))).length;
}
