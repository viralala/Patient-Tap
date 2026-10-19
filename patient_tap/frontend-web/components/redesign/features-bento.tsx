"use client";

import {
  Nfc,
  Lock,
  ScanLine,
  FileScan,
  Pill,
  Fingerprint,
  BellRing,
  MapPin,
  Link2,
  ScrollText,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { Section, SectionHeader, Em } from "./section";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Nfc,
    title: "Offline NFC record",
    body: "Allergies, medicines, conditions, blood group, DNR and contacts on a battery-free NTAG215 band.",
    span: "lg:col-span-2",
    accent: "from-[#3f74ff]/25",
  },
  {
    icon: Lock,
    title: "AES-256-GCM sealed",
    body: "Authenticated encryption: a tampered tag fails verification instead of showing wrong data.",
    accent: "from-[#9b5cff]/25",
  },
  {
    icon: ScanLine,
    title: "MedVerify",
    body: "Scan a medicine pack's QR to check batch, expiry, recalls and copied codes.",
    accent: "from-[#12c58b]/25",
    badge: "New",
  },
  {
    icon: FileScan,
    title: "Prescription auto-fill",
    body: "Point the camera at a prescription or ID and on-device OCR fills the profile. Nothing uploaded.",
    accent: "from-[#37e0f0]/20",
  },
  {
    icon: Pill,
    title: "Drug-conflict checker",
    body: "Flags a medicine that clashes with an allergy or another drug before it reaches the tag.",
    span: "lg:col-span-2",
    accent: "from-[#ff5cc4]/20",
  },
  {
    icon: Fingerprint,
    title: "Biometric lock",
    body: "Fingerprint or face unlock guards the app; the band itself stays readable in an emergency.",
    accent: "from-[#3f74ff]/20",
  },
  {
    icon: BellRing,
    title: "Medicine reminders",
    body: "Local, offline reminders so doses aren't missed.",
    accent: "from-[#9b5cff]/20",
  },
  {
    icon: MapPin,
    title: "SOS alerts with location",
    body: "A scan can text your emergency contacts where you are, as soon as there's signal.",
    accent: "from-[#f5333f]/20",
  },
  {
    icon: ScrollText,
    title: "Chain-of-custody log",
    body: "Every treatment a responder records is written back to the band and timestamped.",
    accent: "from-[#37e0f0]/20",
  },
  {
    icon: Link2,
    title: "Expiring share links",
    body: "Send a doctor a link to your record that you can revoke.",
    accent: "from-[#57ffb0]/15",
  },
  {
    icon: HeartHandshake,
    title: "Donor status",
    body: "Show you're a blood donor or a pledged organ donor, with your blood group.",
    span: "lg:col-span-2",
    accent: "from-[#ff5cc4]/20",
    badge: "New",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    body: "No central medical database, data in India, DPDP-ready consent and deletion.",
    span: "lg:col-span-2",
    accent: "from-[#12c58b]/20",
  },
];

export function FeaturesBento() {
  return (
    <Section
      id="features"
      blobs={[
        { color: "#9b5cff", size: 560, top: "10%", left: "40%", blur: 140, opacity: 0.35 },
        { color: "#37e0f0", size: 420, top: "60%", left: "80%", blur: 130, opacity: 0.3 },
      ]}
    >
      <SectionHeader
        eyebrow="Everything in the app"
        title={
          <>
            One band. <Em>A dozen ways</Em> it has your back.
          </>
        }
        sub="Features marked New are live on the web today; the rest already run in the native Android app. The core record needs no account, no network and no setup."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={cn(
              "rv group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-6 transition-colors duration-500 hover:border-white/25",
              f.span,
            )}
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100",
                f.accent,
              )}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                  <f.icon className="h-5 w-5 text-white" strokeWidth={1.7} />
                </span>
                {f.badge && (
                  <span className="rounded-full bg-signal/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal-soft">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.body}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
