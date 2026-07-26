// OAuth redirect target. Supabase sends the user back here with ?code=...;
// we exchange it for a session (sets the auth cookies) and bounce to the app.
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error.message)}`);
      }
    }
  }
  return NextResponse.redirect(`${origin}${next}`);
}
