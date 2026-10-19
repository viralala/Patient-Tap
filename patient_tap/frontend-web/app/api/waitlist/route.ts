import type { NextRequest } from "next/server";
import { z } from "zod";
import { dbErrorResponse, guardPost, json } from "@/lib/server/guard";
import { isBackendConfigured, rpc } from "@/lib/server/supabase";
import { CONSENT_VERSION, WAITLIST_INTERESTS } from "@/lib/forms";

const schema = z.object({
  email: z.email("Enter a valid email address.").max(254),
  name: z.string().trim().max(120).optional().default(""),
  interest: z.enum(WAITLIST_INTERESTS).default("patient"),
  consent: z.literal(true, "Please agree to the privacy notice to join."),
  adult: z.literal(true, "You must be 18 or older, or ask a parent or guardian to sign up for you."),
});

export async function POST(req: NextRequest) {
  const g = await guardPost(req, schema, { bucket: "waitlist", burst: 5, minFillMs: 1200 });
  if (!g.ok) return g.response;
  if (!isBackendConfigured()) return json({ ok: false, error: "Sign-ups are not open yet." }, 503);

  const { error } = await rpc("join_waitlist", {
    p_email: g.data.email,
    p_name: g.data.name,
    p_interest: g.data.interest,
    p_consent_version: CONSENT_VERSION,
    p_ip_hash: g.ipHash,
  });
  if (error) return dbErrorResponse(error);
  return json({ ok: true });
}
