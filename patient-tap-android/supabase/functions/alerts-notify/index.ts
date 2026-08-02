// ============================================================================
// POST /alerts-notify  { patientPublicId, patientName, message, lat, lng }
//
// Notify a patient's emergency contacts via email (Resend) and/or SMS
// (Twilio). Contacts live server-side in `emergency_contacts` (opt-in).
// Resolves the patient either from the signed-in user (patient checking
// "send a test alert") or from patientPublicId (an anonymous responder's
// scan) — this endpoint must work for BOTH, since Responder mode never signs in.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ALERT_FROM_EMAIL = Deno.env.get("ALERT_FROM_EMAIL");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Contact {
  name: string | null;
  phone: string | null;
  email: string | null;
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!RESEND_API_KEY || !ALERT_FROM_EMAIL) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: ALERT_FROM_EMAIL, to, subject, text }),
  });
  return res.ok;
}

async function sendSms(to: string, body: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) return false;
  const params = new URLSearchParams({ To: to, From: TWILIO_FROM_NUMBER, Body: body });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const body = await req.json().catch(() => ({}));
  const patientPublicId = body.patientPublicId as string | undefined;
  const patientName = body.patientName as string | undefined;
  const message = body.message as string | undefined;
  const lat = body.lat as number | undefined;
  const lng = body.lng as number | undefined;

  // Resolve whose contacts to alert — signed-in patient, or anonymous scan.
  let ownerId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data } = await userClient.auth.getUser();
    ownerId = data.user?.id ?? null;
  }
  if (!ownerId && patientPublicId) {
    const { data } = await admin
      .from("patient_backups")
      .select("user_id")
      .eq("patient_public_id", patientPublicId)
      .maybeSingle();
    ownerId = data?.user_id ?? null;
  }
  if (!ownerId) {
    return new Response(JSON.stringify({ ok: false, error: "Patient not found" }), {
      status: 404,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { data: contacts } = await admin
    .from("emergency_contacts")
    .select("name,phone,email")
    .eq("user_id", ownerId);

  const list = (contacts ?? []) as Contact[];
  const mapUrl = lat != null && lng != null ? ` Location: https://maps.google.com/?q=${lat},${lng}` : "";
  const text = (message || `Emergency alert for ${patientName || "a Patient-Tap user"}.`) + mapUrl;
  const subject = `🚨 Patient-Tap emergency alert${patientName ? ` — ${patientName}` : ""}`;

  let sent = 0;
  for (const c of list) {
    const emailOk = c.email ? await sendEmail(c.email, subject, text) : false;
    const smsOk = c.phone ? await sendSms(c.phone, text) : false;
    if (emailOk || smsOk) sent++;
  }

  const configured = Boolean(RESEND_API_KEY || TWILIO_ACCOUNT_SID);

  return new Response(
    JSON.stringify({
      ok: true,
      sent,
      contacts: list.length,
      simulated: !configured,
      message: configured
        ? `Alerted ${sent}/${list.length} contact(s)`
        : "No email/SMS provider configured — simulated",
    }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
