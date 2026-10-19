import type { NextRequest } from "next/server";
import { z } from "zod";
import { dbErrorResponse, guardPost, json } from "@/lib/server/guard";
import { isBackendConfigured, rpc } from "@/lib/server/supabase";
import type { Medicine } from "@/lib/medverify/types";

const schema = z.object({ q: z.string().trim().min(2, "Type at least 2 letters.").max(60) });

export async function POST(req: NextRequest) {
  const g = await guardPost(req, schema, { bucket: "search", burst: 30 });
  if (!g.ok) return g.response;
  if (!isBackendConfigured()) return json({ ok: false, error: "Search is offline right now." }, 503);

  const { data, error } = await rpc<Medicine[]>("search_medicines", {
    p_query: g.data.q,
    p_ip_hash: g.ipHash,
  });
  if (error) return dbErrorResponse(error);
  return json({ ok: true, results: data ?? [] });
}
