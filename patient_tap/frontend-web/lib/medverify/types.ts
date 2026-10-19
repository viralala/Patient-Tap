import type { PackCode } from "./gs1";

export type Verdict =
  | "genuine"
  | "expired"
  | "alert"
  | "cloned"
  | "suspicious"
  | "unknown"
  | "invalid";

export interface Medicine {
  gtin: string;
  brandName: string;
  genericName: string;
  composition: string;
  dosageForm: string;
  packSize: string | null;
  manufacturer: string;
  mfgLicence: string | null;
  rxRequired: boolean;
  drugClass: string | null;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  interactions: string[];
  storage: string | null;
  isDemo: boolean;
}

export interface VerifyResult {
  verdict: Verdict;
  reasons: string[];
  medicine: Medicine | null;
  batch: { batchNo: string; mfgDate: string; expiryDate: string; status: string } | null;
  unit: { scanCount: number; firstScannedAt: string | null } | null;
  parsed: Partial<PackCode>;
}

export const VERDICT_META: Record<
  Verdict,
  { label: string; tone: "safe" | "warn" | "danger" | "neutral"; advice: string }
> = {
  genuine: {
    label: "Genuine",
    tone: "safe",
    advice: "This pack matches the manufacturer's record. Still check that the seal is intact.",
  },
  expired: {
    label: "Expired",
    tone: "danger",
    advice: "Do not use this medicine. Return it to the pharmacy.",
  },
  alert: {
    label: "Batch flagged",
    tone: "danger",
    advice: "Do not use this batch. Return it to the pharmacy and consider reporting it.",
  },
  cloned: {
    label: "Possible copied code",
    tone: "danger",
    advice: "The code is real but has been used far too often. Fake packs may be carrying a copy of it.",
  },
  suspicious: {
    label: "Suspicious",
    tone: "warn",
    advice: "Something doesn't match the manufacturer's record. Don't use it until a pharmacist confirms it.",
  },
  unknown: {
    label: "Not in registry",
    tone: "neutral",
    advice: "We can't verify this product. It may simply not be listed yet, so treat it with caution.",
  },
  invalid: {
    label: "Invalid code",
    tone: "danger",
    advice: "The code itself is broken. Rescan it; if it still fails, the label may be forged.",
  },
};

/**
 * Demo packs seeded in the registry (supabase/migrations/…_medverify_demo_seed.sql).
 * All brands, codes and batches are fictional.
 */
export const DEMO_PACKS = [
  {
    id: "genuine",
    title: "Genuine pack",
    brand: "Pyrexa 650",
    expect: "genuine" as Verdict,
    code: "(01)00400000000015(17)290331(10)PX26A04(21)PTGEN0001",
  },
  {
    id: "nsq",
    title: "Flagged batch (NSQ)",
    brand: "Amoxa 500",
    expect: "alert" as Verdict,
    code: "(01)00400000000022(17)270630(10)AMX2507(21)PTNSQ0001",
  },
  {
    id: "cloned",
    title: "Cloned code",
    brand: "Statora 10",
    expect: "cloned" as Verdict,
    code: "(01)00400000000046(17)280131(10)ST2602(21)PTCLN0001",
  },
  {
    id: "fake",
    title: "Counterfeit batch",
    brand: "Azitra 500",
    expect: "suspicious" as Verdict,
    code: "(01)00400000000053(17)280430(10)AZ9931(21)PTFAKE0001",
  },
  {
    id: "expired",
    title: "Expired pack",
    brand: "Glucora 500",
    expect: "expired" as Verdict,
    code: "(01)00400000000039(17)251031(10)GL2311(21)PTEXP0001",
  },
  {
    id: "unknown",
    title: "Unregistered product",
    brand: "Unknown",
    expect: "unknown" as Verdict,
    code: "(01)00400000000091(17)281231(10)ZZ0001(21)PTUNK0001",
  },
] as const;
