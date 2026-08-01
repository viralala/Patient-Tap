// Document auto-fill (F2).
//
// On Android-native this is Google ML Kit Text Recognition running fully
// on-device. There is no offline OCR engine in a browser, so on web we:
//   1) let the user pick a real image/PDF (we show it),
//   2) stand in for the ML Kit step with representative extracted text
//      (or text the user can paste/edit),
//   3) run the *real* field parser below over that text.
//
// The parser is scoped to labelled fields (PRD §6.2 honest-scoping note) — it
// does not attempt to understand arbitrary free-text reports.

import { MedEntry } from "./types";

export interface ParsedFields {
  name?: string;
  bloodType?: string;
  allergies: string[];
  medications: MedEntry[];
  dnrFlag?: boolean;
  // fields we could not confidently extract are simply left absent (F2.5)
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function cleanList(raw: string): string[] {
  return raw
    .split(/[,;/]|\band\b/gi)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 1 && s.length < 40);
}

export function parseFieldsFromText(text: string): ParsedFields {
  const out: ParsedFields = { allergies: [], medications: [] };
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;

    // Name
    let m = l.match(/^(?:patient\s*name|name)\s*[:\-]\s*(.+)$/i);
    if (m && !out.name) out.name = m[1].trim();

    // Blood group / type
    m = l.match(/blood\s*(?:group|type)\s*[:\-]\s*([ABO][+\-]?B?[+\-]?)/i);
    if (m) {
      const bt = m[1].toUpperCase().replace(/\s/g, "");
      if (BLOOD_TYPES.includes(bt)) out.bloodType = bt;
    }

    // Allergies
    m = l.match(/(?:allerg(?:y|ies|ic\s*to))\s*[:\-]\s*(.+)$/i);
    if (m) {
      const items = cleanList(m[1]);
      if (!/^(none|nil|nka|no known)/i.test(m[1])) out.allergies.push(...items);
    }

    // DNR
    if (/\bDNR\b|do[-\s]?not[-\s]?resuscitate/i.test(l)) {
      if (/\b(yes|positive|confirmed|active)\b/i.test(l)) out.dnrFlag = true;
    }

    // Medication: "Rx:", "Medication:", or "Drug 500mg twice daily"
    m = l.match(/(?:rx|medication|drug|tab|prescribed)\s*[:\-]?\s*(.+)$/i);
    if (m) {
      const med = parseMedLine(m[1]);
      if (med) out.medications.push(med);
    }
  }

  // De-dupe allergies
  out.allergies = Array.from(new Set(out.allergies.map((a) => a.trim()))).filter(Boolean);
  return out;
}

function parseMedLine(raw: string): MedEntry | null {
  const doseMatch = raw.match(/(\d+\s?(?:mg|mcg|ml|g|iu|units?))/i);
  const freqMatch = raw.match(
    /(once|twice|thrice|\d+\s*(?:x|times))\s*(?:a\s*|per\s*)?(?:day|daily|week|weekly|night|morning|bd|od|tds)?/i
  );
  // Name = leading words before the dose token.
  let name = raw;
  if (doseMatch) name = raw.slice(0, doseMatch.index).trim();
  name = name.replace(/[:\-]+$/, "").trim();
  if (!name || name.length < 2) return null;
  return {
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    dose: doseMatch ? doseMatch[1].replace(/\s/g, "") : "",
    frequency: freqMatch ? normalizeFreq(freqMatch[0]) : "",
  };
}

function normalizeFreq(f: string): string {
  const s = f.toLowerCase();
  if (/twice|2\s*(x|times)|bd/.test(s)) return "Twice daily";
  if (/thrice|3\s*(x|times)|tds/.test(s)) return "Three times daily";
  if (/once|1\s*(x|time)|od|daily/.test(s)) return "Once daily";
  if (/night/.test(s)) return "Once at night";
  if (/morning/.test(s)) return "Once in the morning";
  return f.trim();
}

// Two clean sample documents for the demo "scan" (PRD §13 mitigation).
export const SAMPLE_DOCS: { label: string; text: string }[] = [
  {
    label: "Discharge summary",
    text: `CITY GENERAL HOSPITAL — DISCHARGE SUMMARY
Patient Name: Aarav Mehta
Blood Group: O+
Allergic to: Penicillin, Sulfa drugs
DNR: No
Rx: Metformin 500mg twice daily
Medication: Atorvastatin 20mg once at night
Follow-up in 2 weeks.`,
  },
  {
    label: "Prescription slip",
    text: `Dr. S. Rao, MBBS MD
Name: Rohan Kapoor
Blood Type: B+
Allergy: Aspirin
Rx: Amlodipine 5mg once daily
Drug: Losartan 50mg once daily`,
  },
];
