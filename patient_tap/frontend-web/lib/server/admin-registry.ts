import "server-only";
import type { BloodType, ContactRef, MedEntry } from "@/lib/models";

/**
 * Patient registry shown in /admin: the second-year cohort enrolled through the
 * campus programme. Records are built from a fixed seed, so every load shows
 * the same people, tags and history; only "last seen" times move with the clock.
 */

export const COHORT = {
  institution: "VIT Pune",
  department: "Computer Engineering",
  year: "Second Year (SY)",
  academicYear: "2026–27",
} as const;

export type TagStatus = "Verified" | "Pending";
export type Plan = "Free" | "Premium" | "Family";

export interface AdminPatient {
  patientId: string;
  name: string;
  gender: "M" | "F";
  dob: string; // ISO date
  age: number;
  prn: string;
  roll: string;
  division: string;
  batch: string;
  bloodType: BloodType;
  allergies: string[];
  conditions: string[];
  medications: MedEntry[];
  dnr: boolean;
  bloodDonor: boolean;
  organDonor: boolean;
  emergencyContacts: ContactRef[];
  tag: {
    uid: string;
    type: "NTAG215";
    status: TagStatus;
    writtenAt: string;
    verifiedAt: string | null;
    payloadBytes: number;
  };
  plan: Plan;
  device: string;
  appVersion: string;
  enrolledAt: string;
  lastSyncAt: string;
  lastScanAt: string | null;
  lastScanBy: string | null;
  scans30d: number;
  completeness: number;
}

export interface ActivityEvent {
  at: string;
  patientId: string;
  name: string;
  kind: "scan" | "verify" | "update" | "sync";
  detail: string;
}

/* -------------------------------------------------------------------------- */
/* Deterministic randomness                                                   */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const pick = <T,>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;
const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
function weighted<T>(r: Rng, xs: readonly (readonly [T, number])[]): T {
  const total = xs.reduce((s, [, w]) => s + w, 0);
  let n = r() * total;
  for (const [v, w] of xs) if ((n -= w) < 0) return v;
  return xs[xs.length - 1]![0];
}

/* -------------------------------------------------------------------------- */
/* Source lists                                                               */
/* -------------------------------------------------------------------------- */

const MALE = [
  "Aarav", "Aditya", "Arjun", "Atharva", "Aniket", "Omkar", "Pranav", "Rohan", "Sahil", "Siddharth",
  "Soham", "Tejas", "Varun", "Vedant", "Yash", "Harsh", "Kunal", "Mihir", "Nikhil", "Parth",
  "Rishi", "Sarthak", "Shreyas", "Tanmay", "Chinmay", "Aryan", "Devansh", "Ishaan", "Kartik", "Manas",
  "Neel", "Prathamesh", "Raghav", "Saurabh", "Abhishek", "Ojas", "Rudra", "Viraj",
] as const;

const FEMALE = [
  "Aditi", "Ananya", "Anushka", "Gauri", "Isha", "Janhavi", "Kavya", "Mrunal", "Neha", "Pooja",
  "Prachi", "Riya", "Sakshi", "Sanika", "Shruti", "Siya", "Tanvi", "Vaishnavi", "Diya", "Ishita",
  "Khushi", "Mitali", "Nidhi", "Payal", "Rutuja", "Samruddhi", "Shravani", "Snehal", "Aishwarya", "Bhakti",
  "Dhanashree", "Esha", "Krutika", "Manasi", "Radhika", "Swara",
] as const;

const SURNAMES = [
  "Kulkarni", "Deshpande", "Joshi", "Patil", "Pawar", "Jadhav", "Shinde", "Gaikwad", "Bhosale", "Deshmukh",
  "Kale", "Chavan", "More", "Salunkhe", "Wagh", "Mane", "Karande", "Phadke", "Gokhale", "Apte",
  "Sathe", "Bapat", "Khandekar", "Naik", "Mehta", "Shah", "Agarwal", "Gupta", "Sharma", "Verma",
  "Iyer", "Nair", "Reddy", "Rao", "Menon", "Bansal", "Jain", "Kapoor", "Malhotra", "Chaudhari",
  "Thakur", "Sonawane", "Wankhede", "Bhide", "Ranade", "Dixit", "Mishra", "Pandey", "Tiwari", "Saxena",
] as const;

const FATHER = [
  "Rajesh", "Sanjay", "Sunil", "Anil", "Prakash", "Vijay", "Mahesh", "Ramesh", "Sandeep", "Nitin",
  "Ajay", "Milind", "Sachin", "Deepak", "Manoj", "Uday", "Prashant", "Shrikant",
] as const;
const MOTHER = [
  "Sunita", "Anita", "Vandana", "Manisha", "Smita", "Archana", "Swati", "Meena", "Kavita", "Shubhangi",
  "Rekha", "Seema", "Ujwala", "Madhuri", "Jyoti", "Sangeeta",
] as const;

const BLOOD: readonly (readonly [BloodType, number])[] = [
  ["O+", 36], ["B+", 31], ["A+", 21], ["AB+", 7], ["O-", 2], ["B-", 1.5], ["A-", 1], ["AB-", 0.5],
];

const ALLERGIES = [
  "Penicillin", "Sulfa drugs", "Ibuprofen", "Peanuts", "Dust mites", "Pollen", "Shellfish", "Lactose",
  "Latex", "Egg", "Aspirin",
] as const;

/** Conditions with the medication that usually goes with them. */
const CONDITIONS: readonly { name: string; med: MedEntry; female?: boolean; weight: number }[] = [
  { name: "Asthma (mild, intermittent)", med: { name: "Salbutamol inhaler", dose: "100mcg", frequency: "as needed" }, weight: 5 },
  { name: "Allergic rhinitis", med: { name: "Cetirizine", dose: "10mg", frequency: "as needed" }, weight: 5 },
  { name: "Migraine", med: { name: "Sumatriptan", dose: "50mg", frequency: "as needed" }, weight: 3 },
  { name: "Hypothyroidism", med: { name: "Levothyroxine", dose: "50mcg", frequency: "once daily" }, weight: 2 },
  { name: "Iron-deficiency anaemia", med: { name: "Ferrous ascorbate", dose: "100mg", frequency: "once daily" }, weight: 2 },
  { name: "PCOS", med: { name: "Metformin", dose: "500mg", frequency: "2x daily" }, female: true, weight: 2 },
  { name: "Type 1 diabetes", med: { name: "Insulin glargine", dose: "12 units", frequency: "nightly" }, weight: 1 },
  { name: "Epilepsy (controlled)", med: { name: "Levetiracetam", dose: "500mg", frequency: "2x daily" }, weight: 0.6 },
  { name: "G6PD deficiency", med: { name: "", dose: "", frequency: "" }, weight: 0.6 },
];

const DEVICES = [
  "Redmi Note 13", "Samsung Galaxy M34", "OnePlus Nord CE 3", "Realme 12 Pro", "iQOO Z9", "Samsung Galaxy A35",
  "Poco X6", "Motorola Edge 50", "Vivo T3", "Pixel 8a", "Nothing Phone (2a)", "OnePlus 12R",
] as const;

const SCANNERS = [
  "Self-check", "Self-check", "Self-check", "Campus health centre", "Campus health centre",
  "Event first-aid desk", "Hostel warden", "Sports dept. physio",
] as const;

/* -------------------------------------------------------------------------- */
/* Builder                                                                    */
/* -------------------------------------------------------------------------- */

const SEED = 0x5ea2026;
const COUNT = 72;
const DAY = 86_400_000;

const hex = (r: Rng) => int(r, 0, 255).toString(16).toUpperCase().padStart(2, "0");
const iso = (ms: number) => new Date(ms).toISOString();

function phone(r: Rng) {
  // Shown masked, the way the registry stores contact numbers for staff.
  return `+91 ${pick(r, ["98", "97", "96", "93", "90", "88", "70", "77"])}••• ••${int(r, 100, 999)}`;
}

function buildPatients(now: number): AdminPatient[] {
  const r = mulberry32(SEED);
  const used = new Set<string>();
  const out: AdminPatient[] = [];

  // Enrolment opened at the start of term; the tag drive ran through Sept–Oct.
  const termStart = Date.UTC(2026, 7, 4, 4, 30);
  const enrolWindow = Date.UTC(2026, 9, 16) - termStart;

  for (let i = 0; i < COUNT; i++) {
    const gender = r() < 0.58 ? "M" : "F";
    let name = "";
    let first = "";
    let last = "";
    do {
      first = pick(r, gender === "M" ? MALE : FEMALE);
      last = pick(r, SURNAMES);
      name = `${first} ${last}`;
    } while (used.has(name));
    used.add(name);

    const born = Date.UTC(2005, 5, 1) + int(r, 0, 540) * DAY;
    const age = Math.floor((now - born) / (365.25 * DAY));

    const division = pick(r, ["A", "B", "C"]);
    const batch = `${division}${int(r, 1, 3)}`;

    const allergies: string[] = [];
    if (r() < 0.27) {
      allergies.push(pick(r, ALLERGIES));
      if (r() < 0.25) {
        const extra = pick(r, ALLERGIES);
        if (!allergies.includes(extra)) allergies.push(extra);
      }
    }

    const conditions: string[] = [];
    const medications: MedEntry[] = [];
    if (r() < 0.24) {
      const pool = CONDITIONS.filter((c) => !c.female || gender === "F");
      const c = weighted(r, pool.map((x) => [x, x.weight] as const));
      conditions.push(c.name);
      if (c.med.name) medications.push(c.med);
    }
    if (r() < 0.12) medications.push({ name: "Vitamin D3", dose: "60,000 IU", frequency: "weekly" });

    const contacts: ContactRef[] = [
      r() < 0.6
        ? { name: `${pick(r, FATHER)} ${last}`, phone: phone(r), relation: "Father" }
        : { name: `${pick(r, MOTHER)} ${last}`, phone: phone(r), relation: "Mother" },
    ];
    if (r() < 0.55) {
      const rel = contacts[0]!.relation === "Father" ? "Mother" : "Father";
      contacts.push({ name: `${pick(r, rel === "Father" ? FATHER : MOTHER)} ${last}`, phone: phone(r), relation: rel });
    }

    const enrolledAt = termStart + Math.floor(r() * enrolWindow);
    const writtenAt = Math.min(enrolledAt + int(r, 1, 9) * DAY + int(r, 0, 8) * 3_600_000, now - 2 * DAY);
    const pending = i % 23 === 17; // a few tags still waiting on their first verify tap
    const verifiedAt = pending ? null : writtenAt + int(r, 2, 180) * 60_000;

    const scans30d = pending ? 0 : weighted(r, [[0, 2], [1, 4], [2, 5], [3, 4], [5, 2], [8, 1], [12, 0.5]]);
    const since = Math.max(verifiedAt ?? now, now - 26 * DAY);
    const lastScanAt = scans30d > 0 ? Math.round(since + Math.pow(r(), 0.6) * (now - 20 * 60_000 - since)) : null;

    const filled = [allergies.length || 1, conditions.length || 1, contacts.length, r() < 0.8 ? 1 : 0, r() < 0.9 ? 1 : 0];
    const completeness = Math.min(100, 60 + filled.reduce((a, b) => a + b, 0) * 6 + int(r, 0, 6));

    out.push({
      patientId: `PT-${(24071 + i * 37 + int(r, 0, 30)).toString().padStart(6, "0")}`,
      name,
      gender,
      dob: iso(born).slice(0, 10),
      age,
      prn: `1224${int(r, 1000, 9999)}`,
      roll: "",
      division,
      batch,
      bloodType: weighted(r, BLOOD),
      allergies,
      conditions,
      medications,
      dnr: false,
      bloodDonor: age >= 18 && r() < 0.34,
      organDonor: r() < 0.16,
      emergencyContacts: contacts,
      tag: {
        uid: `04:${hex(r)}:${hex(r)}:${hex(r)}:${hex(r)}:${hex(r)}:${hex(r)}`,
        type: "NTAG215",
        status: pending ? "Pending" : "Verified",
        writtenAt: iso(writtenAt),
        verifiedAt: verifiedAt ? iso(verifiedAt) : null,
        payloadBytes: int(r, 212, 468),
      },
      plan: weighted(r, [["Free", 70], ["Premium", 22], ["Family", 8]] as const),
      device: pick(r, DEVICES),
      appVersion: weighted(r, [["1.4.2", 62], ["1.4.1", 26], ["1.3.8", 12]] as const),
      enrolledAt: iso(enrolledAt),
      lastSyncAt: iso(now - Math.round(Math.pow(r(), 2.2) * 60 * 24 * 16 + 5) * 60_000),
      lastScanAt: lastScanAt ? iso(lastScanAt) : null,
      lastScanBy: lastScanAt ? pick(r, SCANNERS) : null,
      scans30d,
      completeness,
    });
  }

  // Roll numbers follow surname order inside each division, as on the class list.
  for (const div of ["A", "B", "C"]) {
    out
      .filter((p) => p.division === div)
      .sort((a, b) => a.name.split(" ")[1]!.localeCompare(b.name.split(" ")[1]!) || a.name.localeCompare(b.name))
      .forEach((p, n) => (p.roll = `SY${div}-${String(n + 1).padStart(2, "0")}`));
  }

  return out.sort((a, b) => a.roll.localeCompare(b.roll));
}

function buildActivity(patients: AdminPatient[], now: number): ActivityEvent[] {
  const r = mulberry32(SEED ^ 0x9e37);
  const events: ActivityEvent[] = [];
  for (const p of patients) {
    if (p.lastScanAt) {
      events.push({ at: p.lastScanAt, patientId: p.patientId, name: p.name, kind: "scan", detail: `Tag read · ${p.lastScanBy}` });
    }
    if (p.tag.verifiedAt && now - Date.parse(p.tag.verifiedAt) < 14 * DAY) {
      events.push({ at: p.tag.verifiedAt, patientId: p.patientId, name: p.name, kind: "verify", detail: `Tag ${p.tag.uid} verified` });
    }
    if (r() < 0.35) {
      const at = iso(now - int(r, 30, 60 * 24 * 10) * 60_000);
      const what = pick(r, ["Emergency contact edited", "Allergies updated", "Medication list updated", "Donor status changed", "Profile re-sealed to tag"]);
      events.push({ at, patientId: p.patientId, name: p.name, kind: "update", detail: what });
    }
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
}

/** Tag reads per day for the last 30 days, oldest first; sums to the patients' 30-day total. */
function buildDailyScans(patients: AdminPatient[], now: number): { day: string; count: number }[] {
  const r = mulberry32(SEED ^ 0x51ed);
  const today = Math.floor(now / DAY) * DAY;
  const total = patients.reduce((s, p) => s + p.scans30d, 0);
  const weights = Array.from({ length: 30 }, (_, i) => {
    const dow = new Date(today - (29 - i) * DAY).getUTCDay();
    return (dow === 0 ? 0.35 : dow === 6 ? 0.6 : 1) * (0.7 + r() * 0.6) * (1 + i / 40);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((w) => Math.floor((w / sum) * total));
  for (let left = total - counts.reduce((a, b) => a + b, 0), i = 29; left > 0; left--, i = (i + 29) % 30) counts[i]!++;
  return counts.map((count, i) => ({ day: iso(today - (29 - i) * DAY).slice(0, 10), count }));
}

export function getRegistry() {
  // Round to the minute so a page and its data agree within one render.
  const now = Math.floor(Date.now() / 60_000) * 60_000;
  const patients = buildPatients(now);
  return {
    cohort: COHORT,
    generatedAt: iso(now),
    patients,
    activity: buildActivity(patients, now),
    dailyScans: buildDailyScans(patients, now),
  };
}

export type Registry = ReturnType<typeof getRegistry>;
