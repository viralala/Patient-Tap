import type { Metadata } from "next";
import { FlaskConical, ShieldCheck, Smartphone, Building2 } from "lucide-react";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { MedVerifyTool } from "@/components/medverify/medverify-tool";

export const metadata: Metadata = {
  title: "MedVerify — check if a medicine is genuine",
  description:
    "Scan the QR code on a medicine strip to check its batch, expiry, recalls and whether the code has been copied. Runs in your browser; images never leave your device.",
  alternates: { canonical: "/verify" },
};

const HOW = [
  {
    icon: Smartphone,
    title: "Read on your device",
    body: "Your camera feed is decoded in the browser. Only the text of the code is sent for checking.",
  },
  {
    icon: ShieldCheck,
    title: "Six checks in under a second",
    body: "Product, batch, recall / NSQ status, expiry match, serial validity and copied-code detection.",
  },
  {
    icon: Building2,
    title: "Built to plug into real data",
    body: "Manufacturers already encode GS1 codes under Schedule H2. A live version connects to their registries.",
  },
];

export default function VerifyPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="relative bg-void pb-24 pt-32 text-white md:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(18,197,139,0.16),transparent_70%)]" />
        <div className="shell relative">
          <header className="no-print max-w-3xl">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              MedVerify · prototype
            </p>
            <h1 className="mt-5 font-sans text-[clamp(2.2rem,5.5vw,4.2rem)] font-bold leading-[1.02] tracking-tight">
              Is your medicine{" "}
              <span className="font-serif font-normal italic text-white/80">the real thing?</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
              Scan the QR code on the strip or box. We&apos;ll check it against the manufacturer
              registry and tell you exactly what&apos;s inside — and what to watch out for.
            </p>
          </header>

          <div
            role="note"
            className="no-print mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-4 text-sm text-amber-100/90"
          >
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p>
              <strong className="font-semibold text-amber-100">Demo registry.</strong> Brands,
              batches and codes here are fictional, so results for real medicines aren&apos;t
              meaningful yet. A &ldquo;genuine&rdquo; result is never a safety guarantee — buy
              from licensed pharmacies and ask your pharmacist if in doubt.
            </p>
          </div>

          <div className="mt-10">
            <MedVerifyTool />
          </div>

          <section aria-labelledby="how-title" className="no-print mt-24">
            <h2 id="how-title" className="font-display text-2xl font-semibold tracking-tight">
              How MedVerify works
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {HOW.map((h) => (
                <li key={h.title} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6">
                  <h.icon className="h-6 w-6 text-signal-soft" strokeWidth={1.7} />
                  <p className="mt-4 font-medium">{h.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{h.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-white/45">
              Found a suspicious medicine? Report it here, and also to your State Drug Controller or
              the{" "}
              <a href="https://cdsco.gov.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                Central Drugs Standard Control Organisation
              </a>
              . Report side effects through the{" "}
              <a href="https://www.ipc.gov.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                Pharmacovigilance Programme of India
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
