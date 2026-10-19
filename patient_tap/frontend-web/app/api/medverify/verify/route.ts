import type { NextRequest } from "next/server";
import { z } from "zod";
import { dbErrorResponse, guardPost, json } from "@/lib/server/guard";
import { isBackendConfigured, rpc } from "@/lib/server/supabase";
import { isValidGtin, normaliseGtin, parsePackCode } from "@/lib/medverify/gs1";
import type { VerifyResult } from "@/lib/medverify/types";

// Either the raw scanned text, or the fields typed in by hand.
const schema = z.union([
  z.object({ code: z.string().trim().min(1).max(512) }),
  z.object({
    gtin: z.string().trim().min(8).max(14),
    batch: z.string().trim().max(20).optional(),
    serial: z.string().trim().max(20).optional(),
    expiry: z.iso.date().optional(),
  }),
]);

export async function POST(req: NextRequest) {
  const g = await guardPost(req, schema, { bucket: "verify", burst: 30 });
  if (!g.ok) return g.response;
  if (!isBackendConfigured()) return json({ ok: false, error: "Verification is offline right now." }, 503);

  const pack =
    "code" in g.data
      ? parsePackCode(g.data.code)
      : {
          gtin: normaliseGtin(g.data.gtin),
          batch: g.data.batch?.toUpperCase() || undefined,
          serial: g.data.serial?.toUpperCase() || undefined,
          expiry: g.data.expiry,
        };

  if (!pack?.gtin) {
    return json(
      { ok: false, error: "That doesn't look like a medicine pack code. Try the QR or barcode on the strip or box." },
      422,
    );
  }

  // A broken check digit means the code was mistyped, damaged — or forged.
  if (!isValidGtin(pack.gtin)) {
    const result: VerifyResult = {
      verdict: "invalid",
      reasons: ["The product code fails its GS1 check digit. It was mistyped, damaged or forged."],
      medicine: null,
      batch: null,
      unit: null,
      parsed: pack,
    };
    return json({ ok: true, result });
  }

  const { data, error } = await rpc<Omit<VerifyResult, "parsed">>("verify_medicine", {
    p_gtin: pack.gtin,
    p_batch: pack.batch ?? null,
    p_serial: pack.serial ?? null,
    p_expiry: pack.expiry ?? null,
    p_ip_hash: g.ipHash,
  });
  if (error || !data) return dbErrorResponse(error);

  const result: VerifyResult = { ...data, parsed: pack };
  return json({ ok: true, result });
}
