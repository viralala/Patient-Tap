// Central backend configuration + feature flags.
// Safe to import from both client and server. Reading only NEXT_PUBLIC_* here
// (plus deciding demo-vs-real) so nothing secret leaks to the browser.
//
// DUAL MODE: when the Supabase/Stripe env vars are missing the app runs in a
// self-contained DEMO mode (local persistence, simulated auth/billing). The
// moment real keys are present it flips to the live backend automatically.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3010");

// ---- Supabase --------------------------------------------------------------
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
/** True when a real Supabase project is configured. */
export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ---- Stripe ----------------------------------------------------------------
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
/** True when Stripe is configured (publishable key present). */
export const HAS_STRIPE = Boolean(STRIPE_PUBLISHABLE_KEY);

// ---- Subscription tiers ----------------------------------------------------
export type Tier = "free" | "pro" | "clinic";
export type BillingCycle = "monthly" | "yearly";

export interface TierMeta {
  key: Tier;
  label: string; // internal-ish name
  displayName: string; // marketing name (matches the web pricing page)
  blurb: string;
  monthlyInr: number;
  yearlyInr: number; // ~10% off 12 months
  features: string[];
}

export const TIERS: Record<Tier, TierMeta> = {
  free: {
    key: "free",
    label: "Free",
    displayName: "Freemium",
    blurb: "Your medical card, on-device and encrypted.",
    monthlyInr: 0,
    yearlyInr: 0,
    features: [
      "Encrypted on-device profile",
      "Write to NFC tag",
      "Responder scan & decrypt",
      "Local medication reminders",
    ],
  },
  pro: {
    key: "pro",
    label: "Pro",
    displayName: "Premium",
    blurb: "Cloud backup, sync & emergency alerts.",
    monthlyInr: 999,
    yearlyInr: 10789, // 999 × 12 × 0.9
    features: [
      "Everything in Freemium",
      "E2E-encrypted cloud backup & multi-device sync",
      "Emergency-contact alerts on scan",
      "Secure shareable emergency link",
      "Access / chain-of-custody audit log",
    ],
  },
  clinic: {
    key: "clinic",
    label: "Clinic",
    displayName: "B2B / Clinic",
    blurb: "For hospitals, clinics & responder teams.",
    monthlyInr: 1999,
    yearlyInr: 21589, // 1999 × 12 × 0.9
    features: [
      "Everything in Premium",
      "Verified responder accounts",
      "Team audit dashboard",
      "Bulk NTAG215 provisioning",
      "Priority support & SLA",
    ],
  },
};

export const TIER_ORDER: Tier[] = ["free", "pro", "clinic"];

/** Stripe price id for a paid tier + billing cycle (from NEXT_PUBLIC_* env). */
export function priceIdFor(tier: Tier, cycle: BillingCycle): string {
  const map: Record<string, string | undefined> = {
    "pro:monthly": process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    "pro:yearly": process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    "clinic:monthly": process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINIC_MONTHLY,
    "clinic:yearly": process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINIC_YEARLY,
  };
  return map[`${tier}:${cycle}`] || "";
}

/** Rank tiers so we can tell "is X an upgrade over Y". */
export function tierRank(t: Tier): number {
  return TIER_ORDER.indexOf(t);
}
