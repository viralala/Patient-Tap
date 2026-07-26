// Server-side Supabase clients for Route Handlers (app/api/*, app/auth/*).
// - getSupabaseServer(): user-scoped, reads/writes the auth cookie (RLS applies)
// - getSupabaseAdmin(): service-role, bypasses RLS (webhooks, audit, share reads)
//
// Never import this file from a client component.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { HAS_SUPABASE, SUPABASE_URL, SUPABASE_ANON_KEY } from "../config";

/** User-scoped client bound to the request cookies. Null in demo mode. */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!HAS_SUPABASE) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (read-only cookies) — safe to ignore;
          // middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Service-role admin client. Server-only. Bypasses RLS — use with care. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
