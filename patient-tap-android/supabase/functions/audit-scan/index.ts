// ============================================================================
// POST /audit-scan  { patientPublicId, responderId, responderLabel, lat, lng }
//
// Server-side chain-of-custody audit — logs that a profile was scanned. Must
// work for anonymous responders (Responder mode never signs in, PRD §6.1), so
// this writes with the service-role key rather than relying on RLS.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const body = await req.json().catch(() => ({}));

  const patientPublicId = body.patientPublicId as string | undefined;
  if (!patientPublicId) {
    return new Response(JSON.stringify({ error: "patientPublicId required" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { data: owner } = await admin
    .from("patient_backups")
    .select("user_id")
    .eq("patient_public_id", patientPublicId)
    .maybeSingle();

  await admin.from("scan_events").insert({
    patient_owner_id: owner?.user_id ?? null,
    patient_public_id: patientPublicId,
    responder_id: body.responderId ?? null,
    responder_label: body.responderLabel ?? null,
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    user_agent: req.headers.get("User-Agent"),
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
