import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Cursor } from "@/components/ui/cursor";
import { CookieConsent } from "@/components/site/cookie-consent";
import { ConsentedAnalytics } from "@/components/site/consented-analytics";
import { absoluteUrl, site } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Elegant serif used for lowercase italic emphasis words inside headlines.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — your medical record, sealed. Read in one tap.`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.operator.name }],
  creator: site.operator.name,
  keywords: [
    "NFC medical ID",
    "emergency medical record",
    "medical wristband India",
    "fake medicine check",
    "verify medicine QR code",
    "counterfeit drugs India",
    "blood donor",
    "organ donor pledge",
    "AES-256-GCM",
    "first responder",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    title: `${site.name} — your medical record, sealed. Read in one tap.`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — your medical record, sealed. Read in one tap.`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
  category: "health",
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#org"),
      name: site.name,
      url: site.url,
      logo: absoluteUrl("/icon.svg"),
      email: site.contact.email,
      sameAs: [site.links.github],
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: site.url,
      name: site.name,
      publisher: { "@id": absoluteUrl("/#org") },
      inLanguage: "en-IN",
    },
    {
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "HealthApplication",
      operatingSystem: "Android, Web",
      description: site.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      publisher: { "@id": absoluteUrl("/#org") },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the request's nonce (set in proxy.ts) also opts pages into the
  // per-request rendering that a nonce-based CSP requires.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en-IN"
      className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable}`}
    >
      <body className="bg-void">
        <a
          href="#main"
          className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          nonce={nonce}
          // JSON.stringify output with `<` escaped can't break out of the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Cursor />
        <SmoothScroll>{children}</SmoothScroll>
        <CookieConsent />
        <ConsentedAnalytics />
      </body>
    </html>
  );
}
