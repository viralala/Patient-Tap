"use client";

import { Analytics } from "@vercel/analytics/next";
import { useConsent } from "@/lib/consent";

/**
 * Vercel Web Analytics — cookieless and aggregate — loads only after the
 * visitor opts in to "Analytics". Page URLs are stripped of query strings
 * so nothing typed into a form (or a scanned code) can reach the dashboard.
 */
export function ConsentedAnalytics() {
  const consent = useConsent();
  if (!consent?.analytics) return null;
  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        url.search = "";
        url.hash = "";
        return { ...event, url: url.toString() };
      }}
    />
  );
}
