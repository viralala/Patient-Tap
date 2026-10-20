"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OPEN_CONSENT_EVENT, saveConsent, useConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";

/**
 * Consent banner. Shown until the visitor chooses; re-opened from
 * "Cookie settings" in the footer. Rejecting is exactly as easy as accepting.
 */
export function CookieConsent() {
  const consent = useConsent();
  const [forcedOpen, setForcedOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const open = () => {
      setForcedOpen(true);
      setDetails(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  useEffect(() => {
    if (consent) setAnalytics(consent.analytics);
  }, [consent]);

  // SSR / not yet hydrated, or already decided and not re-opened.
  if (consent === undefined || (consent !== null && !forcedOpen)) return null;

  const choose = (allowAnalytics: boolean) => {
    saveConsent(allowAnalytics);
    setForcedOpen(false);
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      className="fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[400px]"
    >
      <div className="relative rounded-[18px] border border-bone/20 bg-canvas p-5 text-bone shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
        {forcedOpen && (
          <button
            type="button"
            onClick={() => setForcedOpen(false)}
            aria-label="Close cookie settings"
            className="label absolute right-4 top-4 text-bone/55 transition-colors hover:text-bone"
          >
            Close ×
          </button>
        )}

        <p id="consent-title" className="font-serif text-2xl leading-tight">
          Cookies
        </p>
        <p id="consent-body" className="mt-2 text-sm leading-relaxed text-bone/65">
          We use only the storage this site needs to work. No ads, no trackers, no selling data.
          With your OK we may count visits with cookieless analytics.{" "}
          <Link href="/cookies" className="text-bone underline underline-offset-2">
            Cookie policy
          </Link>
        </p>

        {details && (
          <div className="mt-4 space-y-2.5">
            <ConsentRow
              title="Strictly necessary"
              body="Remembers this choice and keeps forms secure. Always on."
              checked
              disabled
            />
            <ConsentRow
              title="Analytics"
              body="Anonymous, cookieless page counts so we know what's useful."
              checked={analytics}
              onChange={setAnalytics}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {details ? (
            <button type="button" onClick={() => choose(analytics)} className="btn btn-solid flex-1 justify-center">
              <span>Save choices</span>
            </button>
          ) : (
            <>
              <button type="button" onClick={() => choose(false)} className="btn btn-line flex-1 justify-center">
                <span>Essential only</span>
              </button>
              <button type="button" onClick={() => choose(true)} className="btn btn-solid flex-1 justify-center">
                <span>Accept all</span>
              </button>
            </>
          )}
        </div>
        {!details && (
          <button
            type="button"
            onClick={() => setDetails(true)}
            className="label mt-4 w-full text-center text-bone/55 underline-offset-2 hover:text-bone hover:underline"
          >
            Choose what to allow
          </button>
        )}
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  body,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-4 rounded-btn border border-bone/15 p-3",
        disabled ? "opacity-70" : "cursor-pointer",
      )}
    >
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-bone/55">{body}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-[#FFE927]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </label>
  );
}
