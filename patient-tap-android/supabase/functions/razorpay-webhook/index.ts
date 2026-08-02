// ============================================================================
// POST /razorpay-webhook  (called by Razorpay, not the app)
//
// The async source of truth for payment state — makes subscriptions correct
// even if the app was killed mid-checkout, a payment settles after a delay,
// or a later refund/failure needs to roll a subscription back. Configure this
// URL + a webhook secret in the Razorpay dashboard (Settings → Webhooks) for
// events: payment.captured, payment.failed, refund.created.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

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

Deno.serve(async (req: Request) => {
  const rawBody = await req.text();
  const signature = req.headers.get("X-Razorpay-Signature") ?? "";

  const expected = await hmacHex(WEBHOOK_SECRET, rawBody);
  if (expected !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  switch (event.event) {
    case "payment.captured": {
      const orderId = event.payload?.payment?.entity?.order_id as string | undefined;
      if (orderId) {
        await admin.from("razorpay_orders").update({ status: "paid" }).eq("order_id", orderId);
      }
      break;
    }

    case "payment.failed": {
      const orderId = event.payload?.payment?.entity?.order_id as string | undefined;
      if (orderId) {
        await admin.from("razorpay_orders").update({ status: "failed" }).eq("order_id", orderId);
      }
      break;
    }

    case "refund.created": {
      const paymentId = event.payload?.refund?.entity?.payment_id as string | undefined;
      if (paymentId) {
        // A refunded payment drops the subscriber back to free.
        await admin
          .from("subscriptions")
          .update({ tier: "free", status: "cancelled", cancel_at_period_end: false })
          .eq("razorpay_subscription_id", paymentId);
      }
      break;
    }

    default:
      // Unhandled event types are logged and otherwise ignored.
      console.log(`[razorpay-webhook] unhandled event: ${event.event}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
