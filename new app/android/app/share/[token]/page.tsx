// Public emergency-card viewer. Server-side we fetch ONLY the ciphertext
// (service role) and check expiry/revocation. The decryption key is in the URL
// #fragment, which never reaches the server — the client component decrypts it.
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ShareViewer } from "./ShareViewer";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Demo links (and demo builds without a server DB) carry the ciphertext in
  // the fragment too — the client reads it directly.
  const admin = getSupabaseAdmin();
  if (token === "demo" || !admin) {
    return <ShareViewer status="ok" ciphertext={null} />;
  }

  const { data } = await admin
    .from("share_links")
    .select("ciphertext,expires_at,revoked,access_count")
    .eq("token", token)
    .maybeSingle();

  if (!data) return <ShareViewer status="notfound" ciphertext={null} />;
  if (data.revoked) return <ShareViewer status="revoked" ciphertext={null} />;
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return <ShareViewer status="expired" ciphertext={null} />;
  }

  // Best-effort access counter.
  await admin
    .from("share_links")
    .update({ access_count: (data.access_count ?? 0) + 1 })
    .eq("token", token);

  return <ShareViewer status="ok" ciphertext={data.ciphertext} />;
}
