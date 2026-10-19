"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Download, PhoneCall } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { LogoMark } from "@/components/brand/logo";
import { Magnetic } from "@/components/ui/magnetic";
import { openConsentSettings } from "@/lib/consent";
import { site } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COLS = [
  {
    title: "Product",
    links: [
      { label: "The wristband", href: "/#card" },
      { label: "How it works", href: "/#how" },
      { label: "Security", href: "/#security" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Roadmap", href: "/#roadmap" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "MedVerify — check a medicine", href: "/verify" },
      { label: "Blood & organ donation", href: "/donate" },
      { label: "Patient mode", href: "/app?role=patient" },
      { label: "Responder mode", href: "/app?role=responder" },
      { label: "Download for Android", href: site.links.apk },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Team", href: "/#team" },
      { label: "Contact", href: "/contact" },
      { label: "Report a vulnerability", href: "/security" },
      { label: "GitHub", href: site.links.github },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
      { label: "Medical disclaimer", href: "/disclaimer" },
      { label: "Refunds & cancellation", href: "/refunds" },
      { label: "Shipping & delivery", href: "/shipping" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Open-source licences", href: "/licenses" },
    ],
  },
];

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function SiteFooter({ cta = true }: { cta?: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".f-reveal", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      className={`on-ink relative overflow-hidden bg-void text-white ${cta ? "pt-28 md:pt-40" : "pt-16"}`}
    >
      <Iridescence
        animate={false}
        blobs={[
          { color: "#9b5cff", size: 620, top: "-8%", left: "42%", blur: 130, opacity: cta ? 0.5 : 0.25 },
          { color: "#3b6dff", size: 520, top: "20%", left: "-8%", blur: 130, opacity: cta ? 0.45 : 0.2 },
          { color: "#ff5cc4", size: 520, top: "24%", left: "78%", blur: 130, opacity: cta ? 0.45 : 0.2 },
        ]}
      />
      <div className="grain absolute inset-0 opacity-30" />

      <div className="shell relative z-10">
        {cta && (
          <div className="mx-auto max-w-3xl text-center">
            <p className="f-reveal flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              Ready when you are
            </p>
            <h2 className="f-reveal mt-6 font-sans text-[clamp(2.6rem,6.5vw,5.5rem)] font-bold uppercase leading-[0.98] tracking-[-0.02em]">
              Put the record{" "}
              <span className="font-serif font-normal normal-case italic text-white/80">
                on the wrist.
              </span>
            </h2>
            <div className="f-reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic strength={0.3}>
                <Link
                  href="/app"
                  data-cursor="open"
                  className="group inline-flex items-center gap-2 rounded-full bg-white py-3.5 pl-7 pr-3.5 text-sm font-medium text-neutral-900 transition-transform duration-300 hover:scale-[1.03]"
                >
                  Launch the app
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Magnetic>
              <a
                href={site.links.apk}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60"
              >
                <Download className="h-4 w-4" /> Get the Android app
              </a>
            </div>
          </div>
        )}

        <div
          className={`f-reveal grid gap-10 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] ${cta ? "mt-24" : ""}`}
        >
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="font-sans text-[15px] font-semibold tracking-tight text-white">
                Patient<span className="text-royal-400">·</span>Tap
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              An encrypted medical record that lives on the wristband — not in a database.
              Readable by any phone, with zero network dependency.
            </p>
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-5 inline-block text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              {site.contact.email}
            </a>
          </div>
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {isExternal(l.href) ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
                {col.title === "Legal" && (
                  <li>
                    <button
                      type="button"
                      onClick={openConsentSettings}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      Cookie settings
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* life-safety notice */}
        <div className="mt-14 flex items-start gap-3 rounded-2xl border border-critical/25 bg-critical/[0.07] p-4 text-sm text-white/70">
          <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-critical-soft" />
          <p>
            <strong className="font-semibold text-white">In an emergency, call 112</strong> (or 108
            for an ambulance) first. Patient-Tap is a prototype information tool — it is not a
            medical device and does not replace professional medical care.{" "}
            <Link href="/disclaimer" className="underline underline-offset-2 hover:text-white">
              Read the disclaimer
            </Link>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 py-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}, by {site.operator.name}. Built for {site.event}.
          </p>
          <p>Made in India · Website data stored in India (Mumbai)</p>
        </div>
      </div>
    </footer>
  );
}
