import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access. The browser never talks to Supabase: every
 * call goes through our API routes, which add validation and rate limiting,
 * and every RPC is additionally gated in the database by WEB_RPC_TOKEN.
 */

let client: SupabaseClient | null = null;

export function isBackendConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.WEB_RPC_TOKEN,
  );
}

export function db(): SupabaseClient {
  if (!isBackendConfigured()) throw new Error("Supabase is not configured");
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      // Fail fast rather than hold a serverless function open.
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8_000) }),
    },
  });
  return client;
}

/** Call a token-gated RPC. */
export function rpc<T = unknown>(fn: string, args: Record<string, unknown>) {
  return db().rpc(fn, { p_token: process.env.WEB_RPC_TOKEN, ...args }) as unknown as Promise<{
    data: T | null;
    error: { message: string; code?: string } | null;
  }>;
}
