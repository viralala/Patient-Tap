"use client";

import Link from "next/link";
import { Parallax } from "@/components/ui/parallax";
import { openConsentSettings } from "@/lib/consent";
import { site } from "@/lib/site";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Compare", href: "/#compare" },
      { label: "Plans", href: "/#plans" },
      { label: "FAQ", href: "/#faq" },
      { label: "Join the waitlist", href: "/#waitlist" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "MedVerify", href: "/verify" },
      { label: "Blood and organ donation", href: "/donate" },
      { label: "Patient mode", href: "/app?role=patient" },
      { label: "Responder mode", href: "/app?role=responder" },
      { label: "Android app", href: site.links.apk },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
      { label: "GitHub", href: site.links.github },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms and conditions", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
      { label: "Medical disclaimer", href: "/disclaimer" },
      { label: "Refunds and cancellation", href: "/refunds" },
      { label: "Shipping and delivery", href: "/shipping" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Open-source licences", href: "/licenses" },
    ],
  },
];

const isExternal = (href: string) => /^https?:\/\//.test(href);
const linkCls = "text-[15px] text-bone/65 transition-colors hover:text-bone";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-canvas pt-16 text-bone">
      <div className="shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="max-w-xs font-serif text-lg leading-snug text-bone/80">
              An encrypted medical record that lives on your wristband, not in a database.
            </p>
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-5 inline-block font-mono text-sm text-bone underline underline-offset-4 hover:text-lemon"
            >
              {site.contact.email}
            </a>
          </div>
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="label text-bone/45">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {isExternal(l.href) ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                        {l.label} <span aria-hidden>↗</span>
                      </a>
                    ) : (
                      <Link href={l.href} className={linkCls}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
                {col.title === "Legal" && (
                  <li>
                    <button type="button" onClick={openConsentSettings} className={linkCls}>
                      Cookie settings
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-bone/10 pt-8 md:grid-cols-2">
          <p className="border-l-4 border-scarlet pl-4 font-serif text-[17px] leading-snug text-bone/80">
            <strong className="font-medium text-bone">In an emergency, call 112</strong> (or 108 for an
            ambulance) first. Patient-Tap is a prototype information tool. It is not a medical device.{" "}
            <Link href="/disclaimer" className="underline underline-offset-4 hover:text-bone">
              Read the disclaimer
            </Link>
          </p>
          <p className="font-mono text-xs leading-relaxed text-bone/50 md:text-right">
            Built by {site.operator.name} for {site.event}:
            <br />
            {site.team.map((m) => m.name).join(", ")}.
          </p>
        </div>
      </div>

      <Parallax speed={-0.06} className="mt-12 select-none overflow-hidden">
        <p aria-hidden className="display whitespace-nowrap text-center text-[17.4vw] leading-[0.8] text-bone">
          Patient-Tap
        </p>
      </Parallax>

      <div className="shell flex flex-col gap-2 py-6 font-mono text-xs text-bone/45 md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}, {site.operator.name}
        </p>
        <p>Made in India. Website data stored in India (Mumbai).</p>
      </div>
    </footer>
  );
}
