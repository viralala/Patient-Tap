"use client";

import Link from "next/link";
import { Check, Minus, X, Nfc, Smartphone, Cloud, Lock, ArrowRight } from "lucide-react";
import { Section, SectionHeader, Em } from "./section";
import { cn } from "@/lib/utils";

type Mark = "yes" | "no" | "partial";

const ROWS: { label: string; values: [Mark, Mark, Mark, Mark] }[] = [
  { label: "Readable when the patient can't speak", values: ["yes", "partial", "partial", "partial"] },
  { label: "Works with no network", values: ["yes", "yes", "yes", "no"] },
  { label: "Works if the patient's phone is dead or locked", values: ["yes", "yes", "partial", "yes"] },
  { label: "Encrypted & tamper-evident", values: ["yes", "no", "no", "partial"] },
  { label: "Updated in seconds, by the patient", values: ["yes", "no", "yes", "no"] },
  { label: "Logs who treated the patient", values: ["yes", "no", "no", "yes"] },
  { label: "No central database to breach", values: ["yes", "yes", "yes", "no"] },
];
const COLS = ["Patient-Tap", "Paper card", "Phone medical ID", "Hospital records"];

function MarkIcon({ m }: { m: Mark }) {
  if (m === "yes") return <Check className="mx-auto h-4 w-4 text-signal-soft" aria-label="Yes" />;
  if (m === "partial") return <Minus className="mx-auto h-4 w-4 text-amber-300" aria-label="Partly" />;
  return <X className="mx-auto h-4 w-4 text-white/25" aria-label="No" />;
}

const LAYERS = [
  {
    icon: Nfc,
    title: "On the band",
    body: "504 bytes of AES-256-GCM ciphertext. A generic NFC reader sees only scrambled bytes, and any modification fails verification.",
  },
  {
    icon: Smartphone,
    title: "On the phone",
    body: "Decrypted in memory, shown, then gone. The app itself is behind biometric lock.",
  },
  {
    icon: Cloud,
    title: "In the cloud (optional)",
    body: "Backups are encrypted before they leave the phone, stored in India behind row-level security.",
  },
];

export function SecurityFeature() {
  return (
    <Section
      id="security"
      blobs={[
        { color: "#3b6dff", size: 560, top: "0%", left: "20%", blur: 140, opacity: 0.35 },
        { color: "#12c58b", size: 420, top: "60%", left: "75%", blur: 140, opacity: 0.25 },
      ]}
    >
      <div className="grid gap-14 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <SectionHeader
            eyebrow="Security & privacy"
            dot="bg-signal"
            title={
              <>
                No database of medical records. <Em>Nothing to breach.</Em>
              </>
            }
            sub="Health data is the most valuable data there is to steal. So we designed Patient-Tap to never collect it centrally in the first place."
          />
          <ol className="mt-10 space-y-4">
            {LAYERS.map((l, i) => (
              <li key={l.title} className="rv flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                  <l.icon className="h-5 w-5 text-royal-300" strokeWidth={1.7} />
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-royal-500 font-mono text-[10px]">
                    {i + 1}
                  </span>
                </span>
                <span>
                  <span className="block font-medium">{l.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/55">{l.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/security"
            className="rv mt-8 inline-flex items-center gap-2 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            <Lock className="h-4 w-4" /> Read the full security overview <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rv overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">How Patient-Tap compares with other ways of carrying medical information</caption>
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-normal text-white/40">
                    <span className="sr-only">Capability</span>
                  </th>
                  {COLS.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={cn(
                        "p-4 text-center text-xs font-medium",
                        i === 0 ? "bg-royal-500/10 text-white" : "text-white/55",
                      )}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label} className="border-b border-white/[0.06] last:border-0">
                    <th scope="row" className="p-4 text-left font-normal text-white/75">
                      {r.label}
                    </th>
                    {r.values.map((v, i) => (
                      <td key={i} className={cn("p-4", i === 0 && "bg-royal-500/10")}>
                        <MarkIcon m={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-white/10 p-4 text-xs leading-relaxed text-white/40">
            &ldquo;Phone medical ID&rdquo; means lock-screen emergency info. Many phones can show
            it while locked, but not if the battery is dead. Hospital records need network access
            and staff log-ins, stay in each hospital&apos;s own system, and can only be found once the
            patient is identified.
          </p>
        </div>
      </div>
    </Section>
  );
}
