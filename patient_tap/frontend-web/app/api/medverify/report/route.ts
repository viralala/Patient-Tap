import type { NextRequest } from "next/server";
import { z } from "zod";
import { dbErrorResponse, guardPost, json } from "@/lib/server/guard";
import { isBackendConfigured, rpc } from "@/lib/server/supabase";
import { REPORT_REASONS } from "@/lib/forms";

const schema = z.object({
  gtin: z.string().regex(/^\d{14}$/).optional(),
  batch: z.string().trim().max(20).optional(),
  serial: z.string().trim().max(20).optional(),
  code: z.string().max(512).optional(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(2000, "Please keep details under 2,000 characters.").optional(),
  city: z.string().trim().max(80).optional(),
});

export async function POST(req: NextRequest) {
  const g = await guardPost(req, schema, { bucket: "report", burst: 5, minFillMs: 1500 });
  if (!g.ok) return g.response;
  if (!isBackendConfigured()) return json({ ok: false, error: "Reporting is offline right now." }, 503);

  const { error } = await rpc("report_medicine", {
    p_gtin: g.data.gtin ?? null,
    p_batch: g.data.batch ?? null,
    p_serial: g.data.serial ?? null,
    p_raw_code: g.data.code ?? null,
    p_reason: g.data.reason,
    p_details: g.data.details ?? null,
    p_city: g.data.city ?? null,
    p_ip_hash: g.ipHash,
  });
  if (error) return dbErrorResponse(error);
  return json({ ok: true });
}
