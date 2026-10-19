import { absoluteUrl, site } from "@/lib/site";

// RFC 9116 security.txt — tells researchers how to report a vulnerability.
export const dynamic = "force-static";

export function GET() {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  const body = [
    `Contact: mailto:${site.contact.securityEmail}`,
    `Contact: ${absoluteUrl("/security")}`,
    `Expires: ${expires.toISOString()}`,
    `Preferred-Languages: en, hi`,
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    `Policy: ${absoluteUrl("/security")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
