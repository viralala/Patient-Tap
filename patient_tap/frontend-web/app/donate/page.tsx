import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Droplet, HeartHandshake, Nfc, Users, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { CompatibilityExplorer, EligibilityCheck } from "@/components/donate/blood-tools";

export const metadata: Metadata = {
  title: "Blood & organ donation",
  description:
    "Check whether you can donate blood, see blood-type compatibility, find blood banks on e-RaktKosh, and pledge organ donation through NOTTO.",
  alternates: { canonical: "/donate" },
};

const LINKS = {
  eraktkosh: "https://eraktkosh.mohfw.gov.in",
  nottoPledge: "https://notto.abdm.gov.in",
  notto: "https://notto.mohfw.gov.in",
};

const ORGANS = ["Kidneys", "Liver", "Heart", "Lungs", "Pancreas", "Intestine"];
const TISSUES = ["Corneas", "Skin", "Bone", "Heart valves"];

const PLEDGE_STEPS = [
  {
    icon: HeartHandshake,
    title: "Pledge with NOTTO",
    body: "Register on the national portal with Aadhaar OTP and choose which organs and tissues to donate. It takes a few minutes and is free.",
    href: LINKS.nottoPledge,
    cta: "Open NOTTO pledge portal",
  },
  {
    icon: Users,
    title: "Tell your family",
    body: "In India, doctors still ask the family for consent at the time of death. A family that knows your wish can honour it.",
  },
  {
    icon: Nfc,
    title: "Add it to your band",
    body: "Record your pledge in Patient-Tap so it travels with your medical record — shown to responders as information only.",
    href: "/app?role=patient&screen=edit",
    cta: "Try it in the demo",
  },
];

export default function DonatePage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="relative bg-void pb-24 pt-32 text-white md:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(245,51,63,0.16),transparent_70%)]" />
        <div className="shell relative">
          <header className="max-w-3xl">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-critical" />
              Donation
            </p>
            <h1 className="mt-5 font-sans text-[clamp(2.2rem,5.5vw,4.2rem)] font-bold leading-[1.02] tracking-tight">
              Give blood. Pledge organs.{" "}
              <span className="font-serif font-normal italic text-white/80">Make it known.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
              Tools to check whether you can donate, understand blood types, and make sure your
              donation wishes are known.
            </p>
          </header>

          {/* blood */}
          <section id="blood" aria-labelledby="blood-title" className="mt-16 scroll-mt-28">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-critical/15 ring-1 ring-critical/30">
                <Droplet className="h-5 w-5 text-critical-soft" />
              </span>
              <h2 id="blood-title" className="font-display text-3xl font-semibold tracking-tight">
                Blood donation
              </h2>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <EligibilityCheck />
              <CompatibilityExplorer />
            </div>
            <a
              href={LINKS.eraktkosh}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/30"
            >
              <span>
                <span className="block font-medium">Find blood, blood banks and donation camps</span>
                <span className="mt-0.5 block text-sm text-white/50">
                  e-RaktKosh — the Government of India&apos;s live blood-stock network
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/50" />
            </a>
          </section>

          {/* organ */}
          <section id="organ" aria-labelledby="organ-title" className="mt-24 scroll-mt-28">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-royal-500/15 ring-1 ring-royal-400/30">
                <HeartHandshake className="h-5 w-5 text-royal-300" />
              </span>
              <h2 id="organ-title" className="font-display text-3xl font-semibold tracking-tight">
                Organ &amp; tissue donation
              </h2>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <p className="font-display text-5xl font-semibold text-royal-300">&lt; 1</p>
                <p className="mt-2 text-white/70">
                  deceased organ donor per million people in India — against 48 per million in
                  Spain. Thousands of patients wait for an organ every year.
                </p>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-white/40">
                  What one donor can give
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ORGANS.map((o) => (
                    <span key={o} className="rounded-full bg-royal-500/15 px-3 py-1 text-sm text-royal-200">
                      {o}
                    </span>
                  ))}
                  {TISSUES.map((o) => (
                    <span key={o} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-white/65">
                      {o}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-relaxed text-white/55">
                  Deceased donation happens only after brain-stem death is certified by a board of
                  doctors under the Transplantation of Human Organs and Tissues Act, 1994. Corneas
                  and some tissues can also be donated after the heart stops.
                </p>
                <a
                  href={LINKS.notto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
                >
                  Learn more at NOTTO <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <ol className="space-y-4">
                {PLEDGE_STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                      <s.icon className="h-5 w-5 text-royal-300" strokeWidth={1.7} />
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-royal-500 font-mono text-[10px]">
                        {i + 1}
                      </span>
                    </span>
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">{s.body}</p>
                      {s.href &&
                        (s.href.startsWith("http") ? (
                          <a href={s.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-royal-300 underline-offset-4 hover:underline">
                            {s.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <Link href={s.href} className="mt-3 inline-flex items-center gap-1 text-sm text-royal-300 underline-offset-4 hover:underline">
                            {s.cta} →
                          </Link>
                        ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <div className="mt-16 flex max-w-3xl items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal-soft" />
            <p>
              Donor status on Patient-Tap is <strong className="text-white">information only</strong>.
              It is not a legal registration, and it never changes the care anyone receives:
              responders always treat first. See the{" "}
              <Link href="/disclaimer" className="underline underline-offset-2 hover:text-white">
                medical disclaimer
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
