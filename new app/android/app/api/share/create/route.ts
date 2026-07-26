// Create a revocable, time-limited share link. We store only ciphertext; the
// decryption key never reaches the server (it rides in the URL #fragment).
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { ciphertext, expiresInHours, label } = (await req.json()) as {
    ciphertext?: string;
    expiresInHours?: number;
    label?: string;
  };
  if (!ciphertext) return new NextResponse("Missing ciphertext", { status: 400 });

  const token = crypto.randomUUID().replace(/-/g, "");
  const expires_at = new Date(Date.now() + (expiresInHours ?? 24) * 3600_000).toISOString();

  const { error } = await supabase.from("share_links").insert({
    token,
    user_id: user.id,
    ciphertext,
    label: label ?? null,
    expires_at,
  });
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ token, expiresAt: expires_at });
}
