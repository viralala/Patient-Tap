// Conflict checker (F10) — the core differentiator (PRD §10).
// Checks a proposed treatment against known allergies and recent doses on the tag.

import { PatientProfile } from "./types";

export interface ConflictResult {
  level: "danger" | "warning" | "ok";
  title: string;
  detail: string;
}

// Minimal cross-sensitivity / class map for a credible demo. Not exhaustive.
const DRUG_CLASS: Record<string, string[]> = {
  penicillin: ["amoxicillin", "ampicillin", "augmentin", "penicillin", "flucloxacillin"],
  sulfa: ["sulfamethoxazole", "co-trimoxazole", "bactrim", "sulfa"],
  nsaid: ["ibuprofen", "aspirin", "naproxen", "diclofenac", "ketorolac"],
  opioid: ["morphine", "fentanyl", "codeine", "tramadol", "oxycodone"],
};

const RECENT_DOSE_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

/** Returns true if `drug` belongs to the same class as an allergy token. */
function crossReacts(drug: string, allergy: string): boolean {
  const d = norm(drug);
  const a = norm(allergy);
  if (!d || !a) return false;
  if (d.includes(a) || a.includes(d)) return true;
  for (const members of Object.values(DRUG_CLASS)) {
    const hasA = members.some((m) => a.includes(norm(m)) || norm(m).includes(a));
    const hasD = members.some((m) => d.includes(norm(m)) || norm(m).includes(d));
    if (hasA && hasD) return true;
  }
  return false;
}

/**
 * Check a proposed medication administration against the profile.
 * `drugName` is what the responder is about to give.
 */
export function checkConflict(
  profile: PatientProfile,
  drugName: string,
  now: number = Date.now()
): ConflictResult {
  const drug = drugName.trim();
  if (!drug) return { level: "ok", title: "", detail: "" };

  // 1) Allergy / cross-reactivity — highest severity.
  for (const allergy of profile.allergies) {
    if (crossReacts(drug, allergy)) {
      return {
        level: "danger",
        title: `Allergy conflict: ${drug}`,
        detail: `Patient is allergic to ${allergy}. ${drug} may cross-react. Do not administer without override.`,
      };
    }
  }

  // 2) Recent duplicate dose — overdose risk.
  const recent = profile.treatmentLog
    .filter((e) => now - e.timestamp < RECENT_DOSE_WINDOW_MS)
    .find((e) => norm(e.action).includes(norm(drug)));
  if (recent) {
    const mins = Math.round((now - recent.timestamp) / 60000);
    return {
      level: "warning",
      title: `Recent dose on record: ${drug}`,
      detail: `A dose containing ${drug} was logged ${mins} min ago. Confirm before re-dosing to avoid overdose.`,
    };
  }

  // 3) Interaction with an active regimen medication.
  const onMed = profile.medications.find((m) => crossReacts(drug, m.name));
  if (onMed) {
    return {
      level: "warning",
      title: `Interaction check: ${drug}`,
      detail: `Patient is on ${onMed.name} (${onMed.dose}). Review for interaction before administering.`,
    };
  }

  return {
    level: "ok",
    title: "No conflicts detected",
    detail: `${drug} does not clash with recorded allergies, recent doses, or current medications.`,
  };
}
