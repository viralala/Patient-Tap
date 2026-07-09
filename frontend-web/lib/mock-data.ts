import type { GeoLocation, PatientProfile } from "./models";

/**
 * Hard-coded sample data — the web parallel of Flutter `lib/services/mock_data.dart`.
 * Display-only content so the UI runs end-to-end before the real backend lands.
 */

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000);

/** The record a Responder "reads" off a scanned tag in the demo (critical). */
export function scannedPatient(): PatientProfile {
  return {
    patientId: "PT-0007",
    name: "Arjun Mehta",
    bloodType: "O-",
    dnr: true, // critical -> drives the warning-red responder UI
    allergies: ["Penicillin", "Peanuts", "Latex"],
    medications: [
      { name: "Metformin", dose: "500mg", frequency: "2x daily" },
      { name: "Atorvastatin", dose: "20mg", frequency: "Nightly" },
      { name: "Warfarin", dose: "5mg", frequency: "Daily" },
    ],
    emergencyContacts: [
      { name: "Priya Mehta", phone: "+91 98765 43210", relation: "Spouse" },
      { name: "Dr. Rao", phone: "+91 90123 45678", relation: "Physician" },
    ],
    treatmentLog: [
      {
        timestamp: minutesAgo(42),
        responderId: "PARAMEDIC-4471",
        action: "Administered 10mg morphine IV for pain management.",
      },
      {
        timestamp: minutesAgo(30),
        responderId: "PARAMEDIC-4471",
        action: "Applied pressure dressing to left forearm laceration.",
      },
      {
        timestamp: minutesAgo(12),
        responderId: "ER-NURSE-208",
        action: "Vitals recorded: BP 118/76, HR 92, SpO2 97%.",
      },
    ],
    updatedAt: hoursAgo(6),
  };
}

/** The app owner's fully-populated record (Patient mode first-launch demo). */
export function demoPatientOwner(): PatientProfile {
  return {
    patientId: "PT-1042",
    name: "Alex Harmozi",
    bloodType: "A+",
    dnr: false,
    allergies: ["Sulfa drugs", "Shellfish"],
    medications: [
      { name: "Lisinopril", dose: "10mg", frequency: "Daily" },
      { name: "Aspirin", dose: "81mg", frequency: "Daily" },
    ],
    emergencyContacts: [
      { name: "Jordan Harmozi", phone: "+91 99887 66554", relation: "Sibling" },
    ],
    treatmentLog: [],
    updatedAt: hoursAgo(27),
  };
}

/** A blank-ish starter for a brand-new Patient beginning onboarding. */
export function newPatientDraft(): PatientProfile {
  return {
    patientId: `PT-${Date.now() % 10000}`,
    name: "",
    bloodType: "Unknown",
    allergies: [],
    medications: [],
    dnr: false,
    emergencyContacts: [],
    treatmentLog: [],
  };
}

/** Mock GPS fix used when an alert is fired opportunistically (Surat, GJ). */
export function demoLocation(): GeoLocation {
  return {
    latitude: 21.17024,
    longitude: 72.83106,
    accuracyMeters: 8.5,
    capturedAt: new Date(),
  };
}
