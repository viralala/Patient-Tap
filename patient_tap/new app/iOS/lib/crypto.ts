// Real cryptography via the Web Crypto API (SubtleCrypto).
//
// PRD §6.6 F13/F14 + §7 Security:
//   - Profile data is AES-256-GCM encrypted before it is written to the tag.
//   - Tamper / corruption is detected via the GCM auth tag (decrypt throws).
//   - The PIN is never stored in plaintext — we store a salted SHA-256 hash.
//
// Honest demo note: a production system would seal the AES key in the Android
// Keystore and solve responder-side key distribution properly. For a single-app
// demo where the same app plays both patient and responder, we derive one stable
// 256-bit "shared responder key" so any scan can decrypt any tag written here.

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hkdfKey(seed: string): Promise<CryptoKey> {
  // Deterministically derive a 256-bit AES-GCM key from a fixed seed string.
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(seed));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

// Fixed seed → the shared responder key. Constant on purpose (see note above).
const SHARED_KEY_SEED = "patient-tap.v2.shared-responder-key.NTAG215";

let cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey> {
  if (!cachedKey) cachedKey = await hkdfKey(SHARED_KEY_SEED);
  return cachedKey;
}

/** Encrypt a UTF-8 string → base64 of [12-byte IV | ciphertext+tag]. */
export async function encryptBytes(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const ctBytes = new Uint8Array(ct);
  const packed = new Uint8Array(iv.length + ctBytes.length);
  packed.set(iv, 0);
  packed.set(ctBytes, iv.length);
  return toB64(packed);
}

/** Decrypt base64 of [IV | ciphertext+tag] → UTF-8 string. Throws on tamper. */
export async function decryptBytes(b64: string): Promise<string> {
  const key = await getKey();
  const packed = fromB64(b64);
  const iv = packed.slice(0, 12);
  const ct = packed.slice(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

/**
 * Encrypted byte cost of a plaintext, WITHOUT actually encrypting.
 * AES-GCM: ciphertext == plaintext length, + 16-byte tag, + 12-byte IV.
 * Used for the live 504-byte budget meter (F4.4).
 */
export function encryptedSize(plaintext: string): number {
  return enc.encode(plaintext).length + 16 /* tag */ + 12 /* IV */;
}

// ---- PIN hashing (F0.4 / §7: never store the PIN in plaintext) ----

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = enc.encode(salt + ":" + pin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toB64(new Uint8Array(digest));
}

export function newSalt(): string {
  return toB64(crypto.getRandomValues(new Uint8Array(16)));
}
