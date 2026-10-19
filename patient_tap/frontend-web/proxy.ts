import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request strict Content-Security-Policy.
 *
 * A fresh nonce is minted for every page view; Next.js reads it from the
 * request's CSP header and stamps it on its own scripts, and `strict-dynamic`
 * lets those trusted scripts load their chunks. Any script without the nonce
 * — an injected <script>, an inline handler — is refused by the browser.
 *
 * The static headers (HSTS, frame options, permissions policy...) live in
 * next.config.mjs so they also cover assets and API routes.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  // Vercel's preview-deployment feedback toolbar loads from vercel.live.
  const isPreview = process.env.VERCEL_ENV === "preview";
  const vercelLive = isPreview ? " https://vercel.live" : "";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
    // Inline style attributes drive the motion system (GSAP, gradients).
    `style-src 'self' 'unsafe-inline'${vercelLive}`,
    `img-src 'self' blob: data:${vercelLive}`,
    `font-src 'self' data:${vercelLive}`,
    `media-src 'self' blob: mediastream:`,
    `connect-src 'self'${isDev ? " ws: wss:" : ""}${vercelLive}${isPreview ? " wss://ws-us3.pusher.com" : ""}`,
    `worker-src 'self' blob:`,
    `frame-src 'self'${vercelLive}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `manifest-src 'self'`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: API routes return JSON, static assets need no CSP.
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|twitter-image|robots.txt|sitemap.xml|manifest.webmanifest|.well-known).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
