// Refreshes the Supabase auth session on every request so Server Components /
// Route Handlers see a valid token. No-op in demo mode (no Supabase configured).
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { HAS_SUPABASE, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!HAS_SUPABASE) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session so cookies refresh. Ignore errors (offline etc.).
  await supabase.auth.getUser().catch(() => {});
  return response;
}

export const config = {
  // Run on everything except static assets and the Stripe webhook (raw body).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
