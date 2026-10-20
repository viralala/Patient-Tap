/** Constants shared by the forms (client) and the API routes (server). */

/** Bump whenever the privacy notice shown at sign-up changes materially. */
export const CONSENT_VERSION = "2026-10-19";

export const WAITLIST_INTERESTS = [
  "patient",
  "family",
  "responder",
  "institution",
  "pharmacy",
  "other",
] as const;
export type WaitlistInterest = (typeof WAITLIST_INTERESTS)[number];

export const WAITLIST_INTEREST_LABELS: Record<WaitlistInterest, string> = {
  patient: "For myself",
  family: "For my family",
  responder: "I'm a first responder / clinician",
  institution: "School, event or employer",
  pharmacy: "Pharmacy or manufacturer (MedVerify)",
  other: "Something else",
};

export const CONTACT_TOPICS = [
  "general",
  "partnership",
  "press",
  "order",
  "data_request",
  "grievance",
  "security",
  "other",
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_TOPIC_LABELS: Record<ContactTopic, string> = {
  general: "General question",
  partnership: "Partnership / pilot",
  press: "Press & media",
  order: "Wristband pre-order",
  data_request: "My data: access, correction or erasure",
  grievance: "Grievance (to the Grievance Officer)",
  security: "Security issue",
  other: "Something else",
};

export const REPORT_REASONS = [
  "suspected_fake",
  "damaged_packaging",
  "overcharged",
  "expired_sold",
  "side_effect",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  suspected_fake: "I think it's fake",
  damaged_packaging: "Packaging looks tampered or damaged",
  overcharged: "Charged above the MRP",
  expired_sold: "I was sold an expired medicine",
  side_effect: "Unexpected side effect",
  other: "Something else",
};

/** POST JSON to one of our API routes; returns a uniform result. */
export async function postJson<T = Record<string, unknown>>(
  url: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string } & T;
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "You seem to be offline. Check your connection and try again." };
  }
}
