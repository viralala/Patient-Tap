"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_KEY, OPEN_CONSENT_EVENT } from "./consent-keys";

export { CONSENT_KEY, OPEN_CONSENT_EVENT };

/**
 * Cookie / storage consent.
 *
 * The site itself sets no cookies and runs no trackers. The only optional
 * category is "analytics" (privacy-friendly, cookieless page counts), which
 * stays OFF until the visitor opts in. Anything added later that isn't
 * strictly necessary must check `consent.analytics` (or a new category)
 * before it runs.
 */


export interface ConsentState {
  necessary: true;
  analytics: boolean;
  decidedAt: string;
  version: 1;
}

const listeners = new Set<() => void>();
let cached: ConsentState | null | undefined;

function read(): ConsentState | null {
  if (cached !== undefined) return cached;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as ConsentState) : null;
    cached = parsed && parsed.version === 1 ? parsed : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function saveConsent(analytics: boolean) {
  const next: ConsentState = {
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString(),
    version: 1,
  };
  cached = next;
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): the choice holds for this visit only.
  }
  listeners.forEach((l) => l());
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** `undefined` during SSR, `null` before the visitor has chosen. */
export function useConsent(): ConsentState | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}
