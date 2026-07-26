// Record a scan/access event (chain-of-custody). Called even for anonymous
// responders, so it uses the service role. Best-effort — never blocks a scan.
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return new NextResponse("Not configured", { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    patientPublicId?: string;
    responderId?: string;
    responderLabel?: string;
    lat?: number;
    lng?: number;
  };

  // Try to attribute the scan to the profile's owner (for their audit view).
  let ownerId: string | null = null;
  if (body.patientPublicId) {
    const { data } = await admin
      .from("patient_backups")
      .select("user_id")
      .eq("patient_public_id", body.patientPublicId)
      .maybeSingle();
    ownerId = data?.user_id ?? null;
  }

  const { error } = await admin.from("scan_events").insert({
    patient_owner_id: ownerId,
    patient_public_id: body.patientPublicId ?? null,
    responder_id: body.responderId ?? null,
    responder_label: body.responderLabel ?? null,
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    user_agent: req.headers.get("user-agent"),
  });
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ ok: true });
}
