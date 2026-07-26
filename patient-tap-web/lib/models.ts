/**
 * Patient-Tap data models — TypeScript parallel of the Flutter `lib/models`.
 *
 * Shapes intentionally mirror the protobuf wire schema (and the Flutter
 * `toMap`/`fromMap`) so the backend/crypto teammate can round-trip the exact
 * same objects the app screens produce. Keep field names stable.
 */

/* -------------------------------------------------------------------------- */
/* Blood type                                                                 */
/* -------------------------------------------------------------------------- */

export const BLOOD_TYPES = [
  "Unknown",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

/* -------------------------------------------------------------------------- */
/* Leaf records                                                               */
/* -------------------------------------------------------------------------- */

/** A single medication row. Maps to the `MedEntry` protobuf message. */
export interface MedEntry {
  name: string; // e.g. "Metformin"
  dose: string; // e.g. "500mg"
  frequency: string; // e.g. "2x daily"
}

/** Compact one-line summary, e.g. "Metformin · 500mg · 2x daily". */
export function medSummary(m: MedEntry): string {
  return [m.name, m.dose, m.frequency].map((s) => s.trim()).filter(Boolean).join("  ·  ");
}

/** An emergency contact. Maps to the `ContactRef` protobuf message. */
export interface ContactRef {
  name: string; // e.g. "Priya Mehta"
  phone: string; // e.g. "+91 98765 43210"
  relation: string; // e.g. "Spouse" (optional)
}

/** A GPS fix attached to an outgoing emergency alert. */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt?: Date;
}

export function geoPretty(g: GeoLocation): string {
  return `${g.latitude.toFixed(5)}, ${g.longitude.toFixed(5)}`;
}

/** A single append-only treatment-log entry. Maps to `LogEntry`. */
export interface LogEntry {
  timestamp: Date; // auto-filled at capture time
  responderId: string; // e.g. "PARAMEDIC-4471"
  action: string; // e.g. "Administered 10mg morphine IV"
}

/* -------------------------------------------------------------------------- */
/* Patient profile (top-level record on the tag)                              */
/* -------------------------------------------------------------------------- */

export interface PatientProfile {
  patientId: string; // e.g. "PT-0007"
  name: string;
  bloodType: BloodType;
  allergies: string[];
  medications: MedEntry[];
  dnr: boolean; // Do-Not-Resuscitate flag (life-safety)
  emergencyContacts: ContactRef[];
  treatmentLog: LogEntry[]; // append-only chain of custody
  updatedAt?: Date;
}

export function hasAllergies(p: PatientProfile): boolean {
  return p.allergies.some((a) => a.trim().length > 0);
}

/** True when the responder UI must use high-visibility warning treatment. */
export function isCritical(p: PatientProfile): boolean {
  return p.dnr || hasAllergies(p);
}

export function emptyProfile(): PatientProfile {
  return {
    patientId: "",
    name: "",
    bloodType: "Unknown",
    allergies: [],
    medications: [],
    dnr: false,
    emergencyContacts: [],
    treatmentLog: [],
  };
}

/* -------------------------------------------------------------------------- */
/* (de)serialization — parity with Flutter toMap/fromMap                      */
/* -------------------------------------------------------------------------- */

type Json = Record<string, unknown>;

export function profileToMap(p: PatientProfile): Json {
  return {
    patientId: p.patientId,
    name: p.name,
    bloodType: p.bloodType,
    allergies: p.allergies,
    medications: p.medications.map((m) => ({ ...m })),
    dnr: p.dnr,
    emergencyContacts: p.emergencyContacts.map((c) => ({ ...c })),
    treatmentLog: p.treatmentLog.map((l) => ({
      timestamp: l.timestamp.toISOString(),
      responderId: l.responderId,
      action: l.action,
    })),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  };
}

export function profileFromMap(map: Json): PatientProfile {
  const bt = (map.bloodType as BloodType) ?? "Unknown";
  return {
    patientId: (map.patientId as string) ?? "",
    name: (map.name as string) ?? "",
    bloodType: BLOOD_TYPES.includes(bt) ? bt : "Unknown",
    allergies: ((map.allergies as string[]) ?? []).map(String),
    medications: ((map.medications as MedEntry[]) ?? []).map((m) => ({
      name: m.name ?? "",
      dose: m.dose ?? "",
      frequency: m.frequency ?? "",
    })),
    dnr: Boolean(map.dnr),
    emergencyContacts: ((map.emergencyContacts as ContactRef[]) ?? []).map((c) => ({
      name: c.name ?? "",
      phone: c.phone ?? "",
      relation: c.relation ?? "",
    })),
    treatmentLog: ((map.treatmentLog as Json[]) ?? []).map((l) => ({
      timestamp: new Date((l.timestamp as string) ?? Date.now()),
      responderId: (l.responderId as string) ?? "",
      action: (l.action as string) ?? "",
    })),
    updatedAt: map.updatedAt ? new Date(map.updatedAt as string) : undefined,
  };
}
