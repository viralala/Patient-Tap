// Notify a patient's emergency contacts via email (Resend) and/or SMS (Twilio).
// Contacts live server-side in `emergency_contacts` (opt-in). Resolves the
// patient either from the signed-in user or from patientPublicId (responder).
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

interface Contact {
  name: string | null;
  phone: string | null;
  email: string | null;
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!key || !from) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  return res.ok;
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return false;
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  return res.ok;
}

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return new NextResponse("Not configured", { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    patientPublicId?: string;
    patientName?: string;
    message?: string;
    lat?: number;
    lng?: number;
  };

  // Resolve whose contacts to alert.
  let ownerId: string | null = null;
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    ownerId = user?.id ?? null;
  }
  if (!ownerId && body.patientPublicId) {
    const { data } = await admin
      .from("patient_backups")
      .select("user_id")
      .eq("patient_public_id", body.patientPublicId)
      .maybeSingle();
    ownerId = data?.user_id ?? null;
  }
  if (!ownerId) return new NextResponse("Patient not found", { status: 404 });

  const { data: contacts } = await admin
    .from("emergency_contacts")
    .select("name,phone,email")
    .eq("user_id", ownerId);

  const list = (contacts ?? []) as Contact[];
  const mapUrl =
    body.lat != null && body.lng != null
      ? ` Location: https://maps.google.com/?q=${body.lat},${body.lng}`
      : "";
  const text =
    (body.message || `Emergency alert for ${body.patientName || "a Patient-Tap user"}.`) + mapUrl;
  const subject = `🚨 Patient-Tap emergency alert${body.patientName ? ` — ${body.patientName}` : ""}`;

  let sent = 0;
  for (const c of list) {
    const email = c.email ? await sendEmail(c.email, subject, text) : false;
    const sms = c.phone ? await sendSms(c.phone, text) : false;
    if (email || sms) sent++;
  }

  const configured = Boolean(process.env.RESEND_API_KEY || process.env.TWILIO_ACCOUNT_SID);
  return NextResponse.json({
    ok: true,
    sent,
    contacts: list.length,
    simulated: !configured,
    message: configured ? `Alerted ${sent}/${list.length} contact(s)` : "No email/SMS provider configured — simulated",
  });
}
