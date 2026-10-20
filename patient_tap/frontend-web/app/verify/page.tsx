import type { Metadata } from "next";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { MedVerifyTool } from "@/components/medverify/medverify-tool";
import { PageHeader } from "@/components/site/page-header";

export const metadata: Metadata = {
  title: "MedVerify: check if a medicine is genuine",
  description:
    "Scan the QR code on a medicine strip to check its batch, expiry, recalls and whether the code has been copied. It runs in your browser and images never leave your device.",
  alternates: { canonical: "/verify" },
};

const HOW = [
  {
    title: "Read on your device",
    body: "The camera feed is decoded in your browser. Only the text of the code is sent for checking.",
  },
  {
    title: "Six checks",
    body: "Product, batch, recall or NSQ status, expiry match, serial validity and copied-code detection.",
  },
  {
    title: "Built for real data",
    body: "Manufacturers already encode GS1 codes under Schedule H2. A live version connects to their registries.",
  },
];

export default function VerifyPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="bg-canvas pb-28 pt-32 text-bone md:pt-40">
        <div className="shell">
          <PageHeader label="MedVerify, prototype" title="Is this medicine genuine?" className="no-print">
            Scan the QR code on the strip or box. MedVerify checks it against the manufacturer
            registry and tells you what is inside and what to watch out for.
          </PageHeader>

          <p
            role="note"
            className="no-print mt-8 max-w-3xl border-l-4 border-lemon pl-4 text-[15px] leading-relaxed text-bone/75"
          >
            <strong className="font-medium text-bone">Demo registry.</strong> Brands, batches and codes
            here are fictional, so results for real medicines are not meaningful yet. A
            &ldquo;genuine&rdquo; result is never a safety guarantee. Buy from licensed pharmacies and
            ask your pharmacist if in doubt.
          </p>

          <div className="mt-10">
            <MedVerifyTool />
          </div>

          <section aria-labelledby="how-title" className="no-print mt-28">
            <h2 id="how-title" className="display text-[clamp(2.5rem,6vw,5rem)]">
              How it works
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {HOW.map((h, i) => (
                <li key={h.title} className="rounded-[18px] border border-bone/15 p-7">
                  <p className="label text-bone/50">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-8 font-serif text-2xl leading-tight">{h.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-bone/65">{h.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-3xl font-mono text-xs leading-relaxed text-bone/50">
              Found a suspicious medicine? Report it here, and also to your State Drug Controller or
              the{" "}
              <a href="https://cdsco.gov.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-bone">
                Central Drugs Standard Control Organisation
              </a>
              . Report side effects through the{" "}
              <a href="https://www.ipc.gov.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-bone">
                Pharmacovigilance Programme of India
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
