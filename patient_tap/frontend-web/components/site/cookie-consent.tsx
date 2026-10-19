"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
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
      <div className="relative rounded-[22px] border border-white/12 bg-[#121216]/95 p-5 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {forcedOpen && (
          <button
            type="button"
            onClick={() => setForcedOpen(false)}
            aria-label="Close cookie settings"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.07]">
            <Cookie className="h-4 w-4 text-royal-300" />
          </span>
          <p id="consent-title" className="font-medium">
            Your privacy comes first
          </p>
        </div>
        <p id="consent-body" className="mt-3 text-sm leading-relaxed text-white/60">
          We use only the storage this site needs to work — no ads, no trackers, no selling
          data. With your OK we may count visits with cookieless, privacy-friendly analytics.{" "}
          <Link href="/cookies" className="text-royal-300 underline underline-offset-2">
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

        <div className="mt-5 flex flex-wrap gap-2">
          {details ? (
            <button
              type="button"
              onClick={() => choose(analytics)}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
            >
              Save choices
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => choose(false)}
                className="flex-1 rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/50"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => choose(true)}
                className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
              >
                Accept all
              </button>
            </>
          )}
        </div>
        {!details && (
          <button
            type="button"
            onClick={() => setDetails(true)}
            className="mt-3 w-full text-center text-xs text-white/45 underline-offset-2 hover:text-white hover:underline"
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
        "flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3",
        disabled ? "opacity-70" : "cursor-pointer",
      )}
    >
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{body}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-[#5E7DEE]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </label>
  );
}
