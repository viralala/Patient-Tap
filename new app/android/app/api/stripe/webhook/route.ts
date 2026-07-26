// Stripe webhook — the source of truth for subscription state. Writes to the
// `subscriptions` table with the service role (bypasses RLS). Configure the
// endpoint URL + signing secret in the Stripe dashboard (see BACKEND_SETUP.md).
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getStripe, tierFromPriceId } from "@/lib/stripe";
import type { Tier } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) return new NextResponse("Not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text(); // raw body required for signature check

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (e) {
    return new NextResponse(`Webhook signature error: ${String(e)}`, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return new NextResponse("No admin client", { status: 503 });

  async function upsertFromSubscription(sub: Stripe.Subscription, forceFree = false) {
    const userId = sub.metadata?.user_id;
    if (!userId) return;
    const priceId = sub.items.data[0]?.price?.id;
    const tier: Tier = forceFree
      ? "free"
      : ((sub.metadata?.tier as Tier) || tierFromPriceId(priceId));
    // `current_period_end` field name has drifted across API versions — read defensively.
    const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
    await admin!.from("subscriptions").upsert({
      user_id: userId,
      tier,
      status: forceFree ? "canceled" : sub.status,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      stripe_subscription_id: sub.id,
      price_id: priceId,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string);
        if (!sub.metadata?.user_id && s.metadata?.user_id) {
          sub.metadata = { ...sub.metadata, ...s.metadata };
        }
        await upsertFromSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await upsertFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      await upsertFromSubscription(event.data.object as Stripe.Subscription, true);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
