// Open the Stripe Billing Portal so the user can manage / cancel.
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/config";

export async function POST() {
  const stripe = getStripe();
  if (!stripe) return new NextResponse("Stripe not configured", { status: 503 });

  const supabase = await getSupabaseServer();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const admin = getSupabaseAdmin();
  const { data: sub } = admin
    ? await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const customerId = sub?.stripe_customer_id;
  if (!customerId) return new NextResponse("No billing account yet", { status: 400 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${SITE_URL}/`,
  });
  return NextResponse.json({ url: portal.url });
}
