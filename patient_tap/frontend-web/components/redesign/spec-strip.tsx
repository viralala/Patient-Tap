"use client";

import { Marquee } from "@/components/ui/marquee";

const SPECS = [
  "AES-256-GCM",
  "NTAG215 · 504 bytes",
  "Zero network",
  "No battery",
  "< 2 s tap-to-read",
  "Schedule H2 QR verification",
  "Data hosted in India",
  "DPDP Act 2023 ready",
  "Open source",
  "Android · Web",
];

export function SpecStrip() {
  return (
    <div className="relative border-y border-white/[0.07] bg-void py-5 text-white" aria-label="Key specifications">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />
      <Marquee slow>
        {SPECS.map((s) => (
          <span key={s} className="flex items-center gap-6 pr-6 font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">
            {s}
            <span className="h-1 w-1 rounded-full bg-royal-400" aria-hidden />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
