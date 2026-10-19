"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Section, SectionHeader, Em } from "./section";
import { cn } from "@/lib/utils";

export const FAQS: { q: string; a: React.ReactNode; text: string }[] = [
  {
    q: "Does it need the internet or a charged battery?",
    text: "No. The NFC chip has no battery — it is powered by the phone that reads it, and the record is decrypted on that phone, so it works in basements, lifts, trains and disaster zones. Internet is only used for optional extras like family SMS alerts and cloud backup.",
    a: (
      <>
        No. The NFC chip has no battery — it&apos;s powered by the phone that reads it — and the
        record is decrypted on that phone, so it works in basements, lifts, trains and disaster
        zones. Internet is only used for optional extras like family SMS alerts and cloud backup.
      </>
    ),
  },
  {
    q: "Who can read my wristband?",
    text: "Anyone with the Patient-Tap responder app — by design, because a paramedic must be able to read it when you can't speak. A generic NFC reader sees only encrypted bytes. You choose exactly what goes on the band.",
    a: (
      <>
        Anyone with the Patient-Tap responder app — by design, because a paramedic must be able to
        read it when you can&apos;t speak. A generic NFC reader sees only encrypted bytes. You
        choose exactly what goes on the band.
      </>
    ),
  },
  {
    q: "What if I lose the band?",
    text: "Your record is still on your phone. Write it to a new band in seconds and stop using the old one. A lost band holds only what you chose to share with responders, encrypted.",
    a: (
      <>
        Your record is still on your phone. Write it to a new band in seconds and stop using the
        old one. A lost band holds only what you chose to share with responders, encrypted.
      </>
    ),
  },
  {
    q: "Which phones work?",
    text: "Any Android phone with NFC (most phones sold in India) can read and write bands with the Patient-Tap app. Recent iPhones can read NFC tags; an iPhone app is on our roadmap.",
    a: (
      <>
        Any Android phone with NFC — most phones sold in India — can read and write bands with the
        Patient-Tap app. Recent iPhones can read NFC tags; an iPhone app is on our{" "}
        <Link href="/#roadmap" className="underline underline-offset-2">roadmap</Link>.
      </>
    ),
  },
  {
    q: "How does MedVerify know if a medicine is fake?",
    text: "It reads the QR code that India now requires on top drug brands, then checks the product code, batch number, expiry and the pack's unique serial against a manufacturer registry. A serial that has been scanned hundreds of times is flagged as a likely copied code. Today MedVerify uses a demonstration registry of fictional brands; a live version would connect to manufacturer and regulator data.",
    a: (
      <>
        It reads the QR code India now requires on top drug brands, then checks the product code,
        batch, expiry and the pack&apos;s unique serial against a manufacturer registry. A serial
        scanned hundreds of times is flagged as a likely copied code. Today it uses a{" "}
        <strong>demonstration registry</strong> of fictional brands — a live version would connect
        to manufacturer and regulator data. <Link href="/verify" className="underline underline-offset-2">Try it</Link>.
      </>
    ),
  },
  {
    q: "Is a DNR flag on the band legally binding?",
    text: "No. It records your wish, but in India a valid advance medical directive must follow the procedure set by the Supreme Court (Common Cause v. Union of India, 2018, modified in 2023). Make a formal directive if you want it to be binding.",
    a: (
      <>
        No. It records your wish, but in India a valid advance medical directive must follow the
        procedure set by the Supreme Court (<em>Common Cause v. Union of India</em>, 2018, modified
        in 2023). See our <Link href="/disclaimer" className="underline underline-offset-2">medical disclaimer</Link>.
      </>
    ),
  },
  {
    q: "Is Patient-Tap a medical device?",
    text: "No. It is an information tool and a hackathon prototype. It does not diagnose or treat anything and doesn't replace doctors or emergency services. In an emergency, call 112.",
    a: (
      <>
        No. It&apos;s an information tool and a hackathon prototype. It doesn&apos;t diagnose or
        treat anything and doesn&apos;t replace doctors or emergency services.{" "}
        <strong>In an emergency, call 112.</strong>
      </>
    ),
  },
  {
    q: "What happens to my data?",
    text: "Your medical record lives on your band and phone, not in our database. If you opt into cloud backup it is encrypted before it leaves your phone and stored in India. We never sell data or show ads, and you can ask us to delete anything we hold.",
    a: (
      <>
        Your medical record lives on your band and phone, not in our database. Opt-in cloud backups
        are encrypted before they leave your phone and stored in India. We never sell data or show
        ads, and you can ask us to delete anything we hold. Read the{" "}
        <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.
      </>
    ),
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.text },
    })),
  };
  return (
    <Section id="faq">
      {/* Data block, never executed — so it needs no CSP nonce. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <SectionHeader
          eyebrow="FAQ"
          title={
            <>
              Questions, <Em>answered.</Em>
            </>
          }
          sub={
            <>
              Anything else? <Link href="/contact" className="underline underline-offset-2 hover:text-white">Ask us</Link>.
            </>
          }
        />
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rv">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-medium text-white"
                  >
                    {f.q}
                    <Plus
                      className={cn(
                        "h-5 w-5 shrink-0 text-white/50 transition-transform duration-300",
                        isOpen && "rotate-45 text-white",
                      )}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-500 ease-smooth",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-white/60">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
