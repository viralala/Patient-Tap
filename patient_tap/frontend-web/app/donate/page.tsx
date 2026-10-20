import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { PageHeader } from "@/components/site/page-header";
import { CompatibilityExplorer, EligibilityCheck } from "@/components/donate/blood-tools";

export const metadata: Metadata = {
  title: "Blood and organ donation",
  description:
    "Check whether you can donate blood, see blood-type compatibility, find blood banks on e-RaktKosh, and pledge organ donation through NOTTO.",
  alternates: { canonical: "/donate" },
};

const LINKS = {
  eraktkosh: "https://eraktkosh.mohfw.gov.in",
  nottoPledge: "https://notto.abdm.gov.in",
  notto: "https://notto.mohfw.gov.in",
  nottoReport:
    "https://www.tribuneindia.com/news/delhi/deceased-organ-donation-alarmingly-low-in-country-notto-report",
};

const ORGANS = ["Kidneys", "Liver", "Heart", "Lungs", "Pancreas", "Intestine"];
const TISSUES = ["Corneas", "Skin", "Bone", "Heart valves"];

const PLEDGE_STEPS = [
  {
    title: "Pledge with NOTTO",
    body: "Register on the national portal with Aadhaar OTP and choose which organs and tissues to donate. It is free and takes a few minutes.",
    href: LINKS.nottoPledge,
    cta: "Open the NOTTO pledge portal",
  },
  {
    title: "Tell your family",
    body: "In India, doctors still ask the family for consent at the time of death. A family that knows your wish can honour it.",
  },
  {
    title: "Add it to your band",
    body: "Record your pledge in Patient-Tap so it travels with your medical record. Responders see it as information only.",
    href: "/app?role=patient&screen=edit",
    cta: "Try it in the web app",
  },
];

const linkCls = "label inline-flex items-center gap-2 text-bone underline-offset-4 hover:underline";

export default function DonatePage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="bg-canvas pb-28 pt-32 text-bone md:pt-40">
        <div className="shell">
          <PageHeader label="Donation" title="Give blood. Pledge organs.">
            Check whether you can donate, see which blood types match, and make sure the people
            around you know your wishes.
          </PageHeader>

          <section id="blood" aria-labelledby="blood-title" className="mt-24 scroll-mt-24">
            <h2 id="blood-title" className="display text-[clamp(2.5rem,6vw,5rem)]">
              Blood
            </h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <EligibilityCheck />
              <CompatibilityExplorer />
            </div>
            <a
              href={LINKS.eraktkosh}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-between gap-6 rounded-[18px] bg-scarlet p-6 transition-colors hover:bg-[#c41a1a] md:p-8"
            >
              <span>
                <span className="block font-serif text-2xl leading-tight">
                  Find blood, blood banks and donation camps
                </span>
                <span className="label mt-2 block text-bone/75">
                  e-RaktKosh, the Government of India blood-stock network
                </span>
              </span>
              <span aria-hidden className="font-mono text-2xl">
                ↗
              </span>
            </a>
          </section>

          <section id="organ" aria-labelledby="organ-title" className="mt-28 scroll-mt-24">
            <h2 id="organ-title" className="display text-[clamp(2.5rem,6vw,5rem)]">
              Organs and tissue
            </h2>

            <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col rounded-[18px] bg-plum p-7 md:p-9">
                <p className="display text-[6rem] leading-none">&lt; 1</p>
                <p className="mt-4 font-serif text-xl leading-snug">
                  deceased organ donor per million people in India, against 48 per million in Spain.
                </p>
                <a href={LINKS.nottoReport} target="_blank" rel="noopener noreferrer" className={`${linkCls} mt-3 text-bone/75`}>
                  NOTTO annual report, 2024 <span aria-hidden>↗</span>
                </a>

                <p className="label mt-10 text-bone/70">What one donor can give</p>
                <p className="mt-3 font-mono text-[13.5px] leading-relaxed">
                  {ORGANS.join(", ")}.
                  <br />
                  <span className="text-bone/70">Tissue: {TISSUES.join(", ")}.</span>
                </p>
                <p className="mt-6 text-[15px] leading-relaxed text-bone/80">
                  Deceased donation happens only after brain-stem death is certified by a board of
                  doctors under the Transplantation of Human Organs and Tissues Act, 1994. Corneas and
                  some tissues can also be donated after the heart stops.
                </p>
                <a href={LINKS.notto} target="_blank" rel="noopener noreferrer" className={`${linkCls} mt-auto pt-8`}>
                  Learn more at NOTTO <span aria-hidden>↗</span>
                </a>
              </div>

              <ol className="border-t border-bone/15">
                {PLEDGE_STEPS.map((s, i) => (
                  <li key={s.title} className="grid gap-3 border-b border-bone/15 py-7 sm:grid-cols-[3.5rem_1fr]">
                    <p className="label text-bone/50">{String(i + 1).padStart(2, "0")}</p>
                    <div>
                      <h3 className="font-serif text-2xl leading-tight">{s.title}</h3>
                      <p className="mt-2 text-[16px] leading-relaxed text-bone/65">{s.body}</p>
                      {s.href &&
                        (s.href.startsWith("http") ? (
                          <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${linkCls} mt-4`}>
                            {s.cta} <span aria-hidden>↗</span>
                          </a>
                        ) : (
                          <Link href={s.href} className={`${linkCls} mt-4`}>
                            {s.cta} <span aria-hidden>→</span>
                          </Link>
                        ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <p className="mt-16 max-w-3xl border-l-4 border-bone/40 pl-4 font-serif text-lg leading-snug text-bone/75">
            Donor status on Patient-Tap is <strong className="font-medium text-bone">information only</strong>.
            It is not a legal registration, and it never changes the care anyone receives. Responders
            always treat first. See the{" "}
            <Link href="/disclaimer" className="underline underline-offset-4 hover:text-bone">
              medical disclaimer
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
