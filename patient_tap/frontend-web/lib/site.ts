/**
 * Single source of truth for brand, legal and contact details. Legal pages,
 * metadata, JSON-LD, the footer and security.txt all read from here, so a
 * change of domain or contact address is a one-line edit.
 */

function resolveSiteUrl(): string {
  // 1. Explicit override (set this to the custom domain in Vercel).
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  // 2. Vercel's production domain (the custom domain once one is attached).
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;
  // 3. Local development.
  return "http://localhost:3000";
}

export const site = {
  name: "Patient-Tap",
  shortName: "Patient-Tap",
  tagline: "Your medical record, sealed. Read in one tap.",
  description:
    "Patient-Tap puts an encrypted emergency medical record on an NFC wristband that any responder's phone can read in seconds, with no network. Plus MedVerify: scan a medicine pack to check whether it is genuine.",
  url: resolveSiteUrl(),
  locale: "en_IN",
  themeColor: "#0a0a0b",

  /** Who operates the service. Shown in every legal page. */
  operator: {
    name: "Team Vishwakarma gng",
    descriptor: "an independent student team building Patient-Tap for CODEAMBLE 2026",
    country: "India",
    jurisdiction: "Pune, Maharashtra, India",
  },

  contact: {
    email: "hello@patient-tap.shop",
    privacyEmail: "privacy@patient-tap.shop",
    securityEmail: "security@patient-tap.shop",
    /** Grievance Officer under the IT Rules 2021 / DPDP Act 2023. */
    grievanceOfficer: {
      name: "Viral Dhoka",
      email: "grievance@patient-tap.shop",
      responseTime: "within 7 days of receipt; resolved within 30 days",
    },
  },

  links: {
    github: "https://github.com/viralala/Patient-Tap",
    /** Where the Android APK is published. */
    apk: "https://github.com/viralala/Patient-Tap/releases/latest",
  },

  /** Add a `role` to any member to show it under their name. */
  team: [
    { name: "Viral Dhoka", role: "" },
    { name: "Tanaya Thorat", role: "" },
    { name: "Samarth Dhage", role: "" },
    { name: "Vyanktesh Yeole", role: "" },
  ],

  event: "CODEAMBLE 2026",

  /** Date the legal documents were last revised (ISO). */
  legalUpdated: "2026-10-19",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatLegalDate(iso: string = site.legalUpdated): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
