// ============================================================================
// High-level backend API — the ONE module UI components talk to.
//
// DUAL MODE (see lib/config.ts):
//   • Real  — Supabase Auth/DB + Stripe (via /api/* route handlers).
//   • Demo  — self-contained local persistence + simulated auth/billing, so
//             the app is fully usable before any credentials are supplied.
//
// Medical data stays END-TO-END ENCRYPTED here (lib/crypto) before it ever
// leaves the device; the server only ever receives ciphertext.
// Client-only module — never import server.ts from here.
// ============================================================================
import { getSupabaseBrowser } from "./supabase/client";
import { HAS_SUPABASE, HAS_STRIPE, SITE_URL, type Tier, type BillingCycle } from "./config";
import {
  encryptBytes,
  decryptBytes,
  encryptWithKeyB64,
  newShareKeyB64,
} from "./crypto";
import type { PatientProfile, LogEntry, ContactRef } from "./types";

// ---- Shapes ----------------------------------------------------------------
export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
export interface AppSession {
  user: AppUser;
}
export interface SubscriptionInfo {
  tier: Tier;
  status?: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}
export interface CheckoutResult {
  ok: boolean;
  url?: string; // redirect here (real Stripe)
  simulated?: boolean; // demo mode upgraded locally
  message?: string;
}
export interface ShareLink {
  url: string;
  token: string;
  expiresAt: string | null;
}

/** True when the live backend is wired; false → demo mode. */
export const IS_LIVE = HAS_SUPABASE;

// ---- Demo persistence ------------------------------------------------------
const DK = {
  session: "patienttap.demo.session",
  tier: "patienttap.demo.tier",
  backup: "patienttap.demo.backup",
  scans: "patienttap.demo.scans",
  contacts: "patienttap.demo.contacts",
};
const DEMO_USER: AppUser = {
  id: "demo-user",
  email: "demo@patient-tap.app",
  name: "Demo User",
};
const DEMO_AUTH_EVENT = "patienttap-demo-auth";

function ls(): Storage | null {
  return typeof window !== "undefined" ? window.localStorage : null;
}

// ---- Session mapping (real) ------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapUser(u: any): AppUser {
  const meta = u?.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? "",
    name: meta.full_name || meta.name || (u.email ? String(u.email).split("@")[0] : "User"),
    avatarUrl: meta.avatar_url || meta.picture,
  };
}
function mapSession(s: any): AppSession | null {
  if (!s?.user) return null;
  return { user: mapUser(s.user) };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================================================
// AUTH
// ============================================================================

/** Kick off Google sign-in. Real: OAuth redirect. Demo: instant local session. */
export async function signInWithGoogle(): Promise<void> {
  const sb = getSupabaseBrowser();
  if (sb) {
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    });
    return; // browser navigates away
  }
  // Demo mode — simulate a signed-in Google account.
  ls()?.setItem(DK.session, JSON.stringify({ user: DEMO_USER }));
  window.dispatchEvent(new CustomEvent(DEMO_AUTH_EVENT));
}

/** Sign out of the current account. */
export async function signOut(): Promise<void> {
  const sb = getSupabaseBrowser();
  if (sb) {
    await sb.auth.signOut();
    return;
  }
  ls()?.removeItem(DK.session);
  window.dispatchEvent(new CustomEvent(DEMO_AUTH_EVENT));
}

/** Current session or null. */
export async function getSession(): Promise<AppSession | null> {
  const sb = getSupabaseBrowser();
  if (sb) {
    const { data } = await sb.auth.getSession();
    return mapSession(data.session);
  }
  const raw = ls()?.getItem(DK.session);
  return raw ? (JSON.parse(raw) as AppSession) : null;
}

/** Subscribe to auth changes. Returns an unsubscribe fn. */
export function onAuthChange(cb: (s: AppSession | null) => void): () => void {
  const sb = getSupabaseBrowser();
  if (sb) {
    const { data } = sb.auth.onAuthStateChange((_e, session) => cb(mapSession(session)));
    return () => data.subscription.unsubscribe();
  }
  const handler = () => {
    const raw = ls()?.getItem(DK.session);
    cb(raw ? (JSON.parse(raw) as AppSession) : null);
  };
  if (typeof window !== "undefined") window.addEventListener(DEMO_AUTH_EVENT, handler);
  return () => {
    if (typeof window !== "undefined") window.removeEventListener(DEMO_AUTH_EVENT, handler);
  };
}

// ============================================================================
// SUBSCRIPTION / BILLING
// ============================================================================

/** Current subscription tier + status for the signed-in user. */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const sb = getSupabaseBrowser();
  if (sb) {
    const { data } = await sb
      .from("subscriptions")
      .select("tier,status,current_period_end,cancel_at_period_end")
      .maybeSingle();
    if (!data) return { tier: "free" };
    return {
      tier: (data.tier as Tier) ?? "free",
      status: data.status ?? undefined,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    };
  }
  const tier = (ls()?.getItem(DK.tier) as Tier | null) || "free";
  return { tier, status: tier === "free" ? undefined : "active" };
}

/**
 * Begin a subscription upgrade. Real: create a Stripe Checkout session and
 * return its URL to redirect to. Demo: upgrade locally and report simulated.
 */
export async function createCheckout(
  tier: Tier,
  cycle: BillingCycle,
): Promise<CheckoutResult> {
  if (HAS_STRIPE && HAS_SUPABASE) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, cycle }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, message: t || "Checkout failed" };
    }
    const { url } = await res.json();
    return { ok: true, url };
  }
  // Demo — simulate a successful upgrade.
  ls()?.setItem(DK.tier, tier);
  return { ok: true, simulated: true, message: `Upgraded to ${tier} (demo)` };
}

/** Open the Stripe billing portal (manage/cancel). Demo: downgrade to free. */
export async function openBillingPortal(): Promise<CheckoutResult> {
  if (HAS_STRIPE && HAS_SUPABASE) {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    if (!res.ok) return { ok: false, message: "Could not open billing portal" };
    const { url } = await res.json();
    return { ok: true, url };
  }
  ls()?.setItem(DK.tier, "free");
  return { ok: true, simulated: true, message: "Subscription cancelled (demo)" };
}

// ============================================================================
// E2E CLOUD BACKUP + SYNC
// ============================================================================

/** Encrypt + back up the whole profile. Server stores ciphertext only. */
export async function saveProfileBackup(profile: PatientProfile): Promise<boolean> {
  const ciphertext = await encryptBytes(JSON.stringify(profile));
  const sb = getSupabaseBrowser();
  if (sb) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return false;
    const { error } = await sb.from("patient_backups").upsert({
      user_id: u.user.id,
      ciphertext,
      patient_public_id: profile.patientId,
      version: 2,
    });
    return !error;
  }
  ls()?.setItem(DK.backup, ciphertext);
  return true;
}

/** Fetch + decrypt the cloud backup → PatientProfile, or null if none. */
export async function restoreProfileBackup(): Promise<PatientProfile | null> {
  const sb = getSupabaseBrowser();
  let ciphertext: string | null = null;
  if (sb) {
    const { data } = await sb.from("patient_backups").select("ciphertext").maybeSingle();
    ciphertext = data?.ciphertext ?? null;
  } else {
    ciphertext = ls()?.getItem(DK.backup) ?? null;
  }
  if (!ciphertext) return null;
  try {
    return JSON.parse(await decryptBytes(ciphertext)) as PatientProfile;
  } catch {
    return null;
  }
}

/** Push one treatment-log entry to the cloud (E2E) for multi-device sync. */
export async function syncLogEntry(
  patientPublicId: string,
  entry: LogEntry,
): Promise<boolean> {
  const sb = getSupabaseBrowser();
  if (sb) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return false;
    const action_ciphertext = await encryptBytes(entry.action);
    const { error } = await sb.from("treatment_log").insert({
      patient_owner_id: u.user.id,
      patient_public_id: patientPublicId,
      responder_id: entry.responderId,
      action_ciphertext,
      occurred_at: new Date(entry.timestamp).toISOString(),
      source: "app",
    });
    return !error;
  }
  return true; // demo: nothing to sync to
}

// ============================================================================
// EMERGENCY CONTACTS (server-side, opt-in — needed to actually send alerts)
// ============================================================================

/** Replace the user's server-side emergency contacts (for alerting). */
export async function saveEmergencyContacts(contacts: ContactRef[]): Promise<boolean> {
  const sb = getSupabaseBrowser();
  if (sb) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return false;
    await sb.from("emergency_contacts").delete().eq("user_id", u.user.id);
    if (contacts.length) {
      const { error } = await sb.from("emergency_contacts").insert(
        contacts.map((c) => ({ user_id: u.user!.id, name: c.name, phone: c.phone })),
      );
      return !error;
    }
    return true;
  }
  ls()?.setItem(DK.contacts, JSON.stringify(contacts));
  return true;
}

// ============================================================================
// AUDIT — record a scan/access event (works even for anonymous responders)
// ============================================================================
export interface ScanEventInput {
  patientPublicId: string;
  responderId?: string;
  responderLabel?: string;
  lat?: number;
  lng?: number;
}

/** Log that a profile was scanned/accessed. Server audit (chain-of-custody). */
export async function logScanEvent(ev: ScanEventInput): Promise<boolean> {
  if (HAS_SUPABASE) {
    try {
      const res = await fetch("/api/audit/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  // Demo — keep a local access history.
  const raw = ls()?.getItem(DK.scans);
  const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
  arr.unshift({ ...ev, created_at: new Date().toISOString() });
  ls()?.setItem(DK.scans, JSON.stringify(arr.slice(0, 50)));
  return true;
}

// ============================================================================
// ALERTS — notify emergency contacts (SMS/email via /api/alerts/notify)
// ============================================================================
export interface AlertInput {
  patientPublicId: string;
  patientName?: string;
  message: string;
  lat?: number;
  lng?: number;
}

/** Notify the patient's emergency contacts. Demo: simulated success. */
export async function notifyEmergencyContacts(
  input: AlertInput,
): Promise<{ ok: boolean; sent?: number; simulated?: boolean; message?: string }> {
  if (HAS_SUPABASE) {
    try {
      const res = await fetch("/api/alerts/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) return { ok: false, message: await res.text() };
      return await res.json();
    } catch (e) {
      return { ok: false, message: String(e) };
    }
  }
  return { ok: true, simulated: true, sent: 0, message: "Alert simulated (demo)" };
}

// ============================================================================
// SECURE SHARE LINK — revocable, time-limited, E2E (key rides in #fragment)
// ============================================================================

/**
 * Create a share link for a projected emergency card. A fresh random key
 * encrypts the payload; that key lives ONLY in the URL fragment. Real mode
 * stores ciphertext server-side (token). Demo embeds ciphertext in the
 * fragment too, so the link is fully self-contained.
 */
export async function createShareLink(
  card: Record<string, unknown>,
  opts: { expiresInHours?: number; label?: string } = {},
): Promise<ShareLink | null> {
  const keyB64 = newShareKeyB64();
  const ciphertext = await encryptWithKeyB64(JSON.stringify(card), keyB64);
  const expiresInHours = opts.expiresInHours ?? 24;
  const expiresAt = new Date(Date.now() + expiresInHours * 3600_000).toISOString();

  if (HAS_SUPABASE) {
    const res = await fetch("/api/share/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ciphertext, expiresInHours, label: opts.label }),
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return {
      token,
      url: `${SITE_URL}/share/${token}#k=${encodeURIComponent(keyB64)}`,
      expiresAt,
    };
  }

  // Demo — fully self-contained link (ciphertext + key both in the fragment).
  const token = "demo";
  const frag = `#k=${encodeURIComponent(keyB64)}&d=${encodeURIComponent(ciphertext)}`;
  return { token, url: `${SITE_URL}/share/${token}${frag}`, expiresAt };
}
