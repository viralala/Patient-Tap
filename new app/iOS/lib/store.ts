// Local persistence + compact serialization for the tag payload.
// No server, no network — everything lives in localStorage (PRD §7 offline-first).

import { encryptedSize } from "./crypto";
import {
  PatientProfile,
  WriteSelection,
  emptyProfile,
} from "./types";

const K_PROFILE = "patienttap.profile";
const K_AUTH = "patienttap.auth"; // { salt, hash } — PIN never stored plaintext
const K_TAG = "patienttap.tag"; // simulated NTAG215 contents (base64 IV|ct)
const K_ONBOARDED = "patienttap.onboarded";

export const TAG_LIMIT_BYTES = 504; // NTAG215 user memory — hard ceiling (PRD §7)

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---- Profile ----
export function loadProfile(): PatientProfile {
  if (typeof window === "undefined") return emptyProfile();
  return safeParse<PatientProfile>(localStorage.getItem(K_PROFILE), emptyProfile());
}

export function saveProfile(p: PatientProfile): void {
  localStorage.setItem(K_PROFILE, JSON.stringify(p));
}

// ---- Auth (PIN) ----
export interface AuthRecord {
  salt: string;
  hash: string;
}
export function loadAuth(): AuthRecord | null {
  if (typeof window === "undefined") return null;
  return safeParse<AuthRecord | null>(localStorage.getItem(K_AUTH), null);
}
export function saveAuth(rec: AuthRecord): void {
  localStorage.setItem(K_AUTH, JSON.stringify(rec));
}
export function hasPin(): boolean {
  return loadAuth() !== null;
}

// ---- Onboarding flag ----
export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(K_ONBOARDED) === "1";
}
export function setOnboarded(): void {
  localStorage.setItem(K_ONBOARDED, "1");
}

// ---- Simulated tag storage (stands in for the physical NTAG215) ----
export function readTagRaw(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(K_TAG);
}
export function writeTagRaw(b64: string): void {
  localStorage.setItem(K_TAG, b64);
}
export function clearTag(): void {
  localStorage.removeItem(K_TAG);
}

/**
 * Compact projection of a profile down to only the selected categories.
 * Short keys keep the JSON small so more fits inside 504 bytes.
 */
export function projectForWrite(
  p: PatientProfile,
  sel: WriteSelection
): Record<string, unknown> {
  const out: Record<string, unknown> = { v: 2 };
  if (sel.basic) {
    out.id = p.patientId;
    out.n = p.name;
    out.bt = p.bloodType;
  }
  if (sel.allergies) out.a = p.allergies;
  if (sel.medications)
    out.m = p.medications.map((m) => [m.name, m.dose, m.frequency]);
  if (sel.dnr) out.dnr = p.dnrFlag ? 1 : 0;
  if (sel.contacts) out.c = p.emergencyContacts.map((c) => [c.name, c.phone]);
  if (sel.log)
    out.l = p.treatmentLog.map((e) => [e.timestamp, e.responderId, e.action]);
  return out;
}

export function serializeForWrite(
  p: PatientProfile,
  sel: WriteSelection
): string {
  return JSON.stringify(projectForWrite(p, sel));
}

/** Live encrypted-payload size for the current selection (F4.4 budget meter). */
export function estimateWriteSize(
  p: PatientProfile,
  sel: WriteSelection
): number {
  return encryptedSize(serializeForWrite(p, sel));
}

/** Rebuild a partial PatientProfile from a decrypted tag payload. */
export function deserializeFromTag(json: string): PatientProfile {
  const o = safeParse<Record<string, any>>(json, {});
  const p = emptyProfile();
  if (o.id) p.patientId = o.id;
  if (o.n !== undefined) p.name = o.n;
  if (o.bt !== undefined) p.bloodType = o.bt;
  if (Array.isArray(o.a)) p.allergies = o.a;
  if (Array.isArray(o.m))
    p.medications = o.m.map((x: any[]) => ({
      name: x[0] ?? "",
      dose: x[1] ?? "",
      frequency: x[2] ?? "",
    }));
  if (o.dnr !== undefined) p.dnrFlag = o.dnr === 1 || o.dnr === true;
  if (Array.isArray(o.c))
    p.emergencyContacts = o.c.map((x: any[]) => ({
      name: x[0] ?? "",
      phone: x[1] ?? "",
    }));
  if (Array.isArray(o.l))
    p.treatmentLog = o.l.map((x: any[]) => ({
      timestamp: x[0] ?? Date.now(),
      responderId: x[1] ?? "",
      action: x[2] ?? "",
    }));
  return p;
}
