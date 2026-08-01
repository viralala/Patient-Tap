import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font — no runtime Google requests,
// which keeps the offline-first promise intact.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Patient-Tap — Android",
  description: "Edge-Medical Sovereignty System — offline-first NFC emergency medical identity (Android build).",
};

export const viewport: Viewport = {
  themeColor: "#0c0f0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Font variables live on <html> so :root design tokens can reference them.
    <html lang="en" className={`${manrope.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
