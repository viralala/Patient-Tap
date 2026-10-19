import "server-only";
import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { site } from "@/lib/site";

/**
 * Shared defences for every public POST endpoint:
 *   1. same-origin check (blocks cross-site form posts / CSRF),
 *   2. JSON-only, size-capped bodies,
 *   3. schema validation (zod) — unknown keys are dropped,
 *   4. a per-instance burst limiter in front of the database's own limiter,
 *   5. bot traps: an invisible honeypot field and a minimum fill time.
 */

export function json(body: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export function clientIp(req: NextRequest): string {
  // Vercel overwrites x-forwarded-for at the edge, so the first hop is trustworthy there.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Salted, truncated SHA-256 of the IP. The raw IP is never stored or logged. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "patient-tap-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// ---------------------------------------------------------------------------
// Burst limiter (best effort — each serverless instance keeps its own window;
// the database enforces the authoritative per-IP and global limits).
// ---------------------------------------------------------------------------

const hits = new Map<string, number[]>();

function burstLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return recent.length > limit;
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  // Browsers always send Origin on cross-site POSTs; same-origin fetches may omit it.
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host && o.host === host) return true;
    return o.host === new URL(site.url).host;
  } catch {
    return false;
  }
}

type GuardOk<T> = { ok: true; data: T; ipHash: string };
type GuardFail = { ok: false; response: NextResponse };

export async function guardPost<S extends z.ZodType>(
  req: NextRequest,
  schema: S,
  opts: { bucket: string; burst?: number; maxBytes?: number; minFillMs?: number },
): Promise<GuardOk<z.infer<S>> | GuardFail> {
  const fail = (status: number, error: string): GuardFail => ({
    ok: false,
    response: json({ ok: false, error }, status),
  });

  if (!sameOrigin(req)) return fail(403, "Cross-site requests are not allowed.");

  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    return fail(415, "Send JSON.");
  }

  const ip = clientIp(req);
  const ipHash = hashIp(ip);
  if (burstLimited(`${opts.bucket}:${ipHash}`, opts.burst ?? 10, 60_000)) {
    return fail(429, "Too many requests. Please wait a minute and try again.");
  }

  const maxBytes = opts.maxBytes ?? 8_192;
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return fail(413, "Request too large.");

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return fail(400, "Could not read the request.");
  }
  if (raw.length > maxBytes) return fail(413, "Request too large.");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "Malformed JSON.");
  }

  // Bot traps — answer "success" so bots learn nothing.
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.website === "string" && b.website.trim() !== "") {
      return { ok: false, response: json({ ok: true }) };
    }
    if (opts.minFillMs && typeof b.elapsedMs === "number" && b.elapsedMs < opts.minFillMs) {
      return { ok: false, response: json({ ok: true }) };
    }
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(422, first?.message ?? "Please check the form and try again.");
  }

  return { ok: true, data: parsed.data, ipHash };
}

/** Map database errors to safe, user-facing responses. Never leak internals. */
export function dbErrorResponse(error: { message?: string; code?: string } | null) {
  const msg = error?.message ?? "";
  if (msg.includes("rate_limited")) {
    return json({ ok: false, error: "Too many requests. Please try again later." }, 429);
  }
  console.error("[api] database error", error?.code ?? "unknown");
  return json({ ok: false, error: "Something went wrong on our side. Please try again." }, 502);
}
