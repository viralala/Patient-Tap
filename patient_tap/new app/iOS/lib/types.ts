// Data schema — mirrors the protobuf draft in PRD §11.
// Kept as plain TS interfaces; serialized compactly for the tag (see store.ts).

export interface MedEntry {
  name: string;
  dose: string;
  frequency: string;
  reminderTime?: string; // "HH:MM" local; optional, not necessarily written to tag
  reminderEnabled?: boolean;
}

export interface ContactRef {
  name: string;
  phone: string;
}

export interface LogEntry {
  timestamp: number;
  responderId: string;
  action: string; // e.g. "Administered Adrenaline 0.5mg IM"
}

export interface PatientProfile {
  patientId: string;
  name: string;
  bloodType: string;
  allergies: string[];
  medications: MedEntry[];
  dnrFlag: boolean;
  emergencyContacts: ContactRef[]; // up to 3
  treatmentLog: LogEntry[];
}

// F4.2 — categories the user can selectively include in a tag write.
export type WriteCategory =
  | "basic"
  | "allergies"
  | "medications"
  | "dnr"
  | "contacts"
  | "log";

export interface WriteSelection {
  basic: boolean;
  allergies: boolean;
  medications: boolean;
  dnr: boolean;
  contacts: boolean;
  log: boolean;
}

export const ALL_SELECTED: WriteSelection = {
  basic: true,
  allergies: true,
  medications: true,
  dnr: true,
  contacts: true,
  log: true,
};

export const WRITE_CATEGORY_META: {
  key: WriteCategory;
  label: string;
  hint: string;
}[] = [
  { key: "basic", label: "Basic info", hint: "Name, blood type, patient ID" },
  { key: "allergies", label: "Allergies", hint: "Critical — read first by responders" },
  { key: "medications", label: "Medications", hint: "Name, dose, frequency" },
  { key: "dnr", label: "DNR status", hint: "Do-not-resuscitate flag" },
  { key: "contacts", label: "Emergency contacts", hint: "Up to 3 people" },
  { key: "log", label: "Treatment log", hint: "Field chain-of-custody history" },
];

export function emptyProfile(): PatientProfile {
  return {
    patientId: "PT-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    name: "",
    bloodType: "",
    allergies: [],
    medications: [],
    dnrFlag: false,
    emergencyContacts: [],
    treatmentLog: [],
  };
}

// A ready-made demo profile so the app is never empty on first run of Responder mode etc.
export function demoProfile(): PatientProfile {
  return {
    patientId: "PT-9F3A2C",
    name: "Aarav Mehta",
    bloodType: "O+",
    allergies: ["Penicillin", "Sulfa drugs"],
    medications: [
      { name: "Metformin", dose: "500mg", frequency: "Twice daily", reminderTime: "09:00", reminderEnabled: true },
      { name: "Atorvastatin", dose: "20mg", frequency: "Once at night", reminderTime: "21:00", reminderEnabled: true },
    ],
    dnrFlag: false,
    emergencyContacts: [
      { name: "Priya Mehta", phone: "+91 98200 11223" },
      { name: "Dr. Rao (GP)", phone: "+91 98450 66778" },
    ],
    treatmentLog: [],
  };
}
