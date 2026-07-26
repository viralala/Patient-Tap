// Browser-side Supabase client (singleton). Returns null in DEMO mode so
// callers can branch to local behaviour. Used only inside client components.
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HAS_SUPABASE, SUPABASE_URL, SUPABASE_ANON_KEY } from "../config";

let cached: SupabaseClient | null = null;

/** Live Supabase browser client, or null when no project is configured. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!HAS_SUPABASE) return null;
  if (typeof window === "undefined") return null;
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}
