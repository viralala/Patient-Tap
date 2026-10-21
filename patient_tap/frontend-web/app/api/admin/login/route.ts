import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardPost, json } from "@/lib/server/guard";
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/server/admin-auth";

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  // Five attempts a minute per IP, then a short wait on every failure.
  const guard = await guardPost(req, schema, { bucket: "admin-login", burst: 5, maxBytes: 1024 });
  if (!guard.ok) return guard.response;

  if (!adminConfigured()) {
    return json({ ok: false, error: "The admin area is not set up on this deployment." }, 503);
  }

  if (!verifyAdminPassword(guard.data.password)) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ ok: false, error: "That password is not right." }, 401);
  }

  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(ADMIN_COOKIE, token, { ...sessionCookieOptions, maxAge });
  return res;
}
