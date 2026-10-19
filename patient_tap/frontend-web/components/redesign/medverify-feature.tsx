"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarX,
  Copy,
  FileWarning,
  PackageSearch,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import { Section, SectionHeader, Em } from "./section";
import { QrCode } from "@/components/medverify/qr-code";
import { DEMO_PACKS } from "@/lib/medverify/types";

const CHECKS = [
  { icon: PackageSearch, title: "Is the product registered?", body: "The GTIN on the pack is matched against the manufacturer registry." },
  { icon: FileWarning, title: "Was this batch ever made?", body: "Batch numbers the manufacturer never issued are a classic counterfeit tell." },
  { icon: ShieldAlert, title: "Recalled or Not of Standard Quality?", body: "Flagged batches are stopped before you swallow them." },
  { icon: CalendarX, title: "Does the expiry match?", body: "Relabelled expiry dates don't survive a registry check." },
  { icon: Copy, title: "Has this code been copied?", body: "Each pack has a unique serial. One scanned hundreds of times is a clone." },
  { icon: BadgeCheck, title: "What exactly is it?", body: "Composition, uses, side effects, warnings and interactions, in plain language." },
];

const genuine = DEMO_PACKS[0];

export function MedVerifyFeature() {
  return (
    <Section
      id="medverify"
      blobs={[
        { color: "#12c58b", size: 520, top: "10%", left: "62%", blur: 140, opacity: 0.35 },
        { color: "#3b6dff", size: 520, top: "40%", left: "76%", blur: 140, opacity: 0.35 },
      ]}
    >
      <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionHeader
            eyebrow="New · MedVerify"
            dot="bg-signal"
            title={
              <>
                Is that strip <Em>real?</Em> Point your camera and know.
              </>
            }
            sub={
              <>
                India now requires a QR code on its top drug brands, and the rule is expanding to
                antibiotics, vaccines and cancer drugs. MedVerify reads that code in your browser —
                no app, no upload — and checks it in six ways.
              </>
            }
          />

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {CHECKS.map((c) => (
              <li key={c.title} className="rv flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-signal/10 ring-1 ring-signal/20">
                  <c.icon className="h-4 w-4 text-signal-soft" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-white">{c.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-white/50">{c.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="rv mt-10 flex flex-wrap gap-3">
            <Link
              href="/verify"
              data-cursor="scan"
              className="group inline-flex items-center gap-2 rounded-full bg-white py-3.5 pl-6 pr-3.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
            >
              Try MedVerify
              <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/verify#demo-packs"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/60"
            >
              See the demo packs
            </Link>
          </div>
        </div>

        {/* scanner mock */}
        <div className="rv relative mx-auto w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[#0e0e12] p-5 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
              <span className="flex items-center gap-1.5">
                <ScanLine className="h-3.5 w-3.5 text-signal-soft" /> MedVerify
              </span>
              <span>Camera · on-device</span>
            </div>

            {/* the "pack" under the camera */}
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#e9edf7] to-[#cfd6e8] p-5 text-neutral-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold leading-tight">Pyrexa 650</p>
                  <p className="text-xs text-neutral-600">Paracetamol Tablets IP 650 mg</p>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[10px] text-neutral-700">
                    <dt>B.No.</dt>
                    <dd>PX26A04</dd>
                    <dt>Mfg.</dt>
                    <dd>04/2026</dd>
                    <dt>Exp.</dt>
                    <dd>03/2029</dd>
                  </dl>
                </div>
                <QrCode value={genuine.code} size={104} label="Demo medicine QR code" />
              </div>
              <span className="mt-3 inline-block rounded bg-neutral-900/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                Demo pack · fictional brand
              </span>
              {/* sweep */}
              <span
                aria-hidden
                className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-signal shadow-[0_0_18px_4px_rgba(18,197,139,0.55)] [--sweep:170px]"
              />
            </div>

            {/* the verdict */}
            <div className="mt-4 rounded-2xl border border-signal/30 bg-signal/[0.08] p-4">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-signal-soft" />
                <p className="font-display text-lg font-semibold text-white">Genuine</p>
                <span className="ml-auto font-mono text-[10px] text-white/40">0.4 s</span>
              </div>
              <p className="mt-1.5 text-sm text-white/60">
                Product, batch and serial match the manufacturer record. Expires Mar 2029.
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-x-10 -bottom-6 -z-10 h-24 rounded-[50%] bg-signal/20 blur-3xl" />
        </div>
      </div>
    </Section>
  );
}
