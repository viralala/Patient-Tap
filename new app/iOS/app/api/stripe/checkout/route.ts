// Create a Stripe Checkout session for a subscription upgrade.
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { priceIdFor, SITE_URL, type Tier, type BillingCycle } from "@/lib/config";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return new NextResponse("Stripe not configured", { status: 503 });

  const supabase = await getSupabaseServer();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { tier, cycle } = (await req.json()) as { tier: Tier; cycle: BillingCycle };
  const price = priceIdFor(tier, cycle);
  if (!price) return new NextResponse("Unknown price for that tier/cycle", { status: 400 });

  // Reuse an existing Stripe customer if we have one, else create + remember it.
  const admin = getSupabaseAdmin();
  let customerId: string | undefined;
  if (admin) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    customerId = sub?.stripe_customer_id ?? undefined;
  }
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await admin?.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/?billing=success`,
    cancel_url: `${SITE_URL}/?billing=cancel`,
    metadata: { user_id: user.id, tier },
    subscription_data: { metadata: { user_id: user.id, tier } },
  });

  return NextResponse.json({ url: session.url });
}
