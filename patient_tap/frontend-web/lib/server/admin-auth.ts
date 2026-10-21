import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Owner-only access to /admin.
 *
 * There is exactly one account, configured through two environment variables:
 *   ADMIN_PASSWORD_HASH   `scrypt:<salt>:<hash>` (base64url), from `npm run admin:hash`
 *   ADMIN_SESSION_SECRET  32+ random characters used to sign the session cookie
 *
 * If either is missing the admin area stays locked for everyone. The session is
 * a signed, HttpOnly cookie with an expiry; rotating the secret signs everyone out.
 */

export const ADMIN_COOKIE = "pt_admin";
const SESSION_HOURS = 8;

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function adminConfigured(): boolean {
  return Boolean(secret() && process.env.ADMIN_PASSWORD_HASH?.startsWith("scrypt:"));
}

export function verifyAdminPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  if (expected.length < 16) return false;
  const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** A fresh session token: `<base64url payload>.<signature>`. */
export function createSessionToken(): { token: string; maxAge: number } {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is not set");
  const maxAge = SESSION_HOURS * 3600;
  const payload = Buffer.from(JSON.stringify({ sub: "owner", exp: Date.now() + maxAge * 1000 })).toString(
    "base64url",
  );
  return { token: `${payload}.${sign(payload, key)}`, maxAge };
}

function validToken(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return sub === "owner" && typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/** True when the current request carries a valid owner session. */
export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  return validToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};
