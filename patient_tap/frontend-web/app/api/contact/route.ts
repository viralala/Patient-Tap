import type { NextRequest } from "next/server";
import { z } from "zod";
import { dbErrorResponse, guardPost, json } from "@/lib/server/guard";
import { isBackendConfigured, rpc } from "@/lib/server/supabase";
import { CONTACT_TOPICS } from "@/lib/forms";

const schema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(120),
  email: z.email("Enter a valid email address.").max(254),
  topic: z.enum(CONTACT_TOPICS),
  message: z
    .string()
    .trim()
    .min(10, "Your message is a little short. Add a few more details.")
    .max(4000, "Please keep your message under 4,000 characters."),
  consent: z.literal(true, "Please agree to the privacy notice so we can reply."),
});

export async function POST(req: NextRequest) {
  const g = await guardPost(req, schema, { bucket: "contact", burst: 4, minFillMs: 2500 });
  if (!g.ok) return g.response;
  if (!isBackendConfigured()) {
    return json({ ok: false, error: "The contact form is offline. Please email us instead." }, 503);
  }

  const { error } = await rpc("send_contact_message", {
    p_name: g.data.name,
    p_email: g.data.email,
    p_topic: g.data.topic,
    p_message: g.data.message,
    p_ip_hash: g.ipHash,
  });
  if (error) return dbErrorResponse(error);
  return json({ ok: true });
}
