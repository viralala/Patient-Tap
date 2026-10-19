"use client";

import Link from "next/link";
import { ArrowRight, Droplet, HeartHandshake, ShieldCheck } from "lucide-react";
import { Section, SectionHeader, Em } from "./section";

const CARDS = [
  {
    icon: Droplet,
    tone: "critical",
    title: "Blood donation",
    lead: "Carry your blood group and donor status on your wrist.",
    points: [
      "Find out in 30 seconds whether you're likely eligible to donate.",
      "See who your blood type can give to and receive from.",
      "Find blood banks, stock and donation camps near you on e-RaktKosh.",
    ],
    cta: "Check eligibility",
    href: "/donate#blood",
    glow: "from-critical/25",
  },
  {
    icon: HeartHandshake,
    tone: "royal",
    title: "Organ & tissue donation",
    lead: "A pledge only helps if the right people know about it.",
    points: [
      "India has fewer than one deceased organ donor per million people.",
      "Pledge officially with NOTTO, then record your wish on your band.",
      "We'll help you tell your family — their consent is still sought in India.",
    ],
    cta: "Learn & pledge",
    href: "/donate#organ",
    glow: "from-royal-500/30",
  },
];

export function DonationFeature() {
  return (
    <Section
      id="donate"
      blobs={[
        { color: "#f5333f", size: 460, top: "20%", left: "10%", blur: 140, opacity: 0.3 },
        { color: "#9b5cff", size: 520, top: "30%", left: "70%", blur: 140, opacity: 0.35 },
      ]}
    >
      <SectionHeader
        eyebrow="New · Donation"
        dot="bg-critical"
        align="center"
        title={
          <>
            Your band can save <Em>more than one</Em> life.
          </>
        }
        sub="Blood and organ donor status, carried with your record and shown to responders as information only."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {CARDS.map((c) => (
          <article
            key={c.title}
            className="rv group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-7 md:p-9"
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br ${c.glow} to-transparent blur-2xl transition-transform duration-700 group-hover:scale-125`}
            />
            <div className="relative">
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${c.tone === "critical" ? "bg-critical/15 ring-critical/30" : "bg-royal-500/15 ring-royal-400/30"}`}
              >
                <c.icon
                  className={`h-6 w-6 ${c.tone === "critical" ? "text-critical-soft" : "text-royal-300"}`}
                  strokeWidth={1.8}
                />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-2 text-white/65">{c.lead}</p>
              <ul className="mt-6 space-y-3">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-white/60">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-white/50" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href={c.href}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/[0.06]"
              >
                {c.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="rv mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-white/45">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal-soft" />
        Donor status never affects the care anyone receives. Responders always treat first.
      </p>
    </Section>
  );
}
