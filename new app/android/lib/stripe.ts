// Server-only Stripe helpers. Never import from a client component.
import Stripe from "stripe";
import type { Tier } from "./config";

let cached: Stripe | null = null;

/** Shared Stripe instance, or null when STRIPE_SECRET_KEY is absent. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

/** Map a Stripe price id back to our internal tier (webhook fallback). */
export function tierFromPriceId(priceId?: string | null): Tier {
  if (!priceId) return "free";
  const map: Record<string, Tier> = {};
  const put = (id: string | undefined, t: Tier) => {
    if (id) map[id] = t;
  };
  put(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY, "pro");
  put(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY, "pro");
  put(process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINIC_MONTHLY, "clinic");
  put(process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINIC_YEARLY, "clinic");
  return map[priceId] || "pro";
}
