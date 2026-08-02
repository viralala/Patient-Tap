// ============================================================================
// POST /razorpay-verify
//   { razorpay_order_id, razorpay_payment_id, razorpay_signature }
//
// Recomputes HMAC-SHA256(order_id + "|" + payment_id, key_secret) and only
// activates the subscription if it matches what Razorpay signed. This is what
// makes the client-reported "payment succeeded" event trustworthy — the
// razorpay-webhook function is the async source of truth for the same state.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function periodEnd(cycle: string): string {
  const d = new Date();
  if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
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
  const orderId = body.razorpay_order_id as string;
  const paymentId = body.razorpay_payment_id as string;
  const signature = body.razorpay_signature as string;

  if (!orderId || !paymentId || !signature) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const expected = await hmacHex(RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);
  if (expected !== signature) {
    return new Response(JSON.stringify({ ok: false, error: "Signature mismatch" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: order } = await admin
    .from("razorpay_orders")
    .select("user_id,tier,cycle")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!order || order.user_id !== userId) {
    return new Response(JSON.stringify({ ok: false, error: "Order not found" }), {
      status: 404,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  await admin.from("razorpay_orders").update({ status: "paid" }).eq("order_id", orderId);

  await admin.from("subscriptions").upsert({
    user_id: userId,
    tier: order.tier,
    status: "active",
    razorpay_subscription_id: paymentId,
    current_period_end: periodEnd(order.cycle),
    cancel_at_period_end: false,
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
