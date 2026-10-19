"use client";

import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeader, Em } from "./section";

// Every figure links to its source. Keep it that way.
const STATS = [
  {
    value: "1 in 10",
    label: "medical products in low- and middle-income countries is substandard or falsified.",
    source: "WHO, 2017",
    href: "https://www.who.int/news/item/28-11-2017-1-in-10-medical-products-in-developing-countries-is-substandard-or-falsified",
    tone: "text-critical-soft",
  },
  {
    value: "300",
    label: "top drug brands in India must now carry a scannable QR code — and the rule is expanding to vaccines, antimicrobials and cancer drugs.",
    source: "Drugs Rules, Schedule H2 (2023; expanded June 2026)",
    href: "https://www.downtoearth.org.in/health/how-qr-codes-on-antibiotics-can-strengthen-indias-fight-against-amr",
    tone: "text-signal-soft",
  },
  {
    value: "< 1",
    label: "deceased organ donor per million people in India, against 48 in Spain.",
    source: "NOTTO annual report, 2024",
    href: "https://www.tribuneindia.com/news/delhi/deceased-organ-donation-alarmingly-low-in-country-notto-report",
    tone: "text-royal-300",
  },
  {
    value: "0",
    label: "bars of signal needed to read a Patient-Tap band — in a basement, a lift, a train or a disaster zone.",
    source: "How NFC works: the tag is powered by the reader",
    href: "/#how",
    tone: "text-white",
  },
];

export function Impact() {
  return (
    <Section
      id="impact"
      blobs={[
        { color: "#ff5cc4", size: 480, top: "0%", left: "70%", blur: 130, opacity: 0.35 },
        { color: "#3b6dff", size: 520, top: "30%", left: "-6%", blur: 130, opacity: 0.35 },
      ]}
    >
      <SectionHeader
        eyebrow="Why it matters"
        dot="bg-critical"
        title={
          <>
            In an emergency, <Em>what you can&apos;t say</Em> can hurt you.
          </>
        }
        sub="Unconscious patients can't list their allergies. Patients can't tell a fake strip from a real one. Families don't know their loved one wanted to donate. Patient-Tap closes those gaps — offline, in seconds."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <a
            key={s.value}
            href={s.href}
            {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="rv group flex flex-col justify-between rounded-[22px] border border-white/10 bg-white/[0.03] p-6 transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.05]"
          >
            <div>
              <p className={`font-display text-5xl font-semibold tracking-tight ${s.tone}`}>{s.value}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">{s.label}</p>
            </div>
            <p className="mt-6 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35 transition-colors group-hover:text-white/70">
              {s.source}
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </a>
        ))}
      </div>
    </Section>
  );
}
