// ============================================================================
// POST /razorpay-order  { tier: "pro"|"clinic", cycle: "monthly"|"yearly" }
//
// Creates a Razorpay order for an authenticated user. The price is looked up
// HERE, server-side, from the same table the app displays (kTiers in
// lib/config/app_config.dart) — a tampered client cannot buy Premium for ₹1.
// Returns {orderId, amount, currency, keyId} for the native checkout sheet.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mirrors kTiers in lib/config/app_config.dart — the source of truth for price.
const PRICES_INR: Record<string, Record<string, number>> = {
  pro: { monthly: 999, yearly: 10789 },
  clinic: { monthly: 1999, yearly: 21589 },
};

async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data } = await userClient.auth.getUser();
  return data.user?.id ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const userId = await getUserId(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Not signed in" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const tier = body.tier as string;
  const cycle = body.cycle as string;

  const priceInr = PRICES_INR[tier]?.[cycle];
  if (!priceInr) {
    return new Response(JSON.stringify({ error: "Unknown tier/cycle" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const amountPaise = priceInr * 100;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Razorpay Orders API — Basic auth with key_id:key_secret.
  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `pt_${userId.slice(0, 8)}_${Date.now()}`,
      notes: { tier, cycle, user_id: userId },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ error: `Razorpay: ${text}` }), {
      status: 502,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const order = await res.json();

  await admin.from("razorpay_orders").insert({
    order_id: order.id,
    user_id: userId,
    tier,
    cycle,
    amount: amountPaise,
    status: "created",
  });

  return new Response(
    JSON.stringify({
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
