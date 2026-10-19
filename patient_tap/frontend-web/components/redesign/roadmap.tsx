"use client";

import {
  Nfc,
  ScanLine,
  HeartHandshake,
  IdCard,
  Ambulance,
  Languages,
  Users,
  Syringe,
  School,
  Compass,
  ShieldPlus,
  Watch,
  Apple,
  Building2,
} from "lucide-react";
import { Section, SectionHeader, Em } from "./section";
import { cn } from "@/lib/utils";

type Status = "live" | "beta" | "next" | "later";

const STATUS: Record<Status, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-signal/15 text-signal-soft" },
  beta: { label: "Prototype", cls: "bg-royal-500/20 text-royal-200" },
  next: { label: "Next", cls: "bg-amber-400/15 text-amber-200" },
  later: { label: "Planned", cls: "bg-white/10 text-white/60" },
};

const ITEMS: { icon: typeof Nfc; title: string; body: string; status: Status }[] = [
  { icon: Nfc, title: "Encrypted NFC record", body: "Android app: read, write, OCR auto-fill, conflict checks, biometric lock.", status: "live" },
  { icon: ScanLine, title: "MedVerify", body: "Scan a pack's QR to verify batch, expiry, recalls and cloned codes.", status: "beta" },
  { icon: HeartHandshake, title: "Donor status", body: "Blood and organ donor details on the band, with eligibility tools.", status: "beta" },
  { icon: IdCard, title: "ABHA linking", body: "Connect your Ayushman Bharat Health Account so records can follow you.", status: "next" },
  { icon: Ambulance, title: "One-tap 108 & nearest hospital", body: "Responder view shows the closest emergency department and calls an ambulance.", status: "next" },
  { icon: Languages, title: "Read in any language", body: "Responders see the record in Hindi, Marathi, Tamil, Bengali and more.", status: "next" },
  { icon: Users, title: "Family & caregiver mode", body: "Manage the bands of children and elderly parents from one account.", status: "next" },
  { icon: Syringe, title: "Vaccination card", body: "Immunisation history on the band, with due-date reminders.", status: "later" },
  { icon: Compass, title: "Lost-person mode", body: "For dementia or autism: a finder taps the band and reaches a guardian instantly.", status: "later" },
  { icon: ShieldPlus, title: "Insurance card", body: "Policy number and cashless helpline, right where the hospital needs them.", status: "later" },
  { icon: School, title: "Schools, events & employers", body: "Bulk bands and a dashboard for marathons, campuses and factories.", status: "later" },
  { icon: Building2, title: "Verified pharmacy network", body: "Manufacturers and pharmacies feed MedVerify with live batch data.", status: "later" },
  { icon: Watch, title: "Wear OS responder app", body: "Scan a band from a paramedic's watch, hands-free.", status: "later" },
  { icon: Apple, title: "iPhone app", body: "Read-only NFC on iPhone, within Apple's platform limits.", status: "later" },
];

export function Roadmap() {
  return (
    <Section
      id="roadmap"
      blobs={[
        { color: "#9b5cff", size: 520, top: "0%", left: "60%", blur: 140, opacity: 0.3 },
        { color: "#37e0f0", size: 420, top: "60%", left: "5%", blur: 140, opacity: 0.25 },
      ]}
    >
      <SectionHeader
        eyebrow="Roadmap"
        title={
          <>
            Where we&apos;re <Em>headed next.</Em>
          </>
        }
        sub="Built in the open. What's live, what you can try today, and what's coming."
      />
      <div className="rv mt-8 flex flex-wrap gap-2">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <span key={s} className={cn("rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider", STATUS[s].cls)}>
            {STATUS[s].label}
          </span>
        ))}
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <li
            key={it.title}
            className="rv flex gap-4 rounded-[20px] border border-white/10 bg-white/[0.025] p-5 transition-colors duration-500 hover:border-white/25"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
              <it.icon className="h-5 w-5 text-white/85" strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{it.title}</span>
                <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider", STATUS[it.status].cls)}>
                  {STATUS[it.status].label}
                </span>
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-white/55">{it.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
