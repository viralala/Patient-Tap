"use client";

import { useState } from "react";
import Link from "next/link";

const linkCls = "underline underline-offset-4 hover:text-bone";

const FAQS: { q: string; a: React.ReactNode; text: string }[] = [
  {
    q: "Does it need the internet or a charged battery?",
    text: "No. The NFC chip has no battery. It is powered by the phone that reads it, and the record is decrypted on that phone, so it works in basements, lifts, trains and disaster zones. The internet is only used for optional extras such as family SMS alerts and cloud backup.",
    a: (
      <>
        No. The NFC chip has no battery. It is powered by the phone that reads it, and the record is
        decrypted on that phone, so it works in basements, lifts, trains and disaster zones. The
        internet is only used for optional extras such as family SMS alerts and cloud backup.
      </>
    ),
  },
  {
    q: "Who can read my wristband?",
    text: "Anyone with the Patient-Tap responder app. That is deliberate, because a paramedic must be able to read it when you can't speak. A generic NFC reader sees only encrypted bytes. You choose exactly what goes on the band.",
    a: (
      <>
        Anyone with the Patient-Tap responder app. That is deliberate, because a paramedic must be
        able to read it when you can&apos;t speak. A generic NFC reader sees only encrypted bytes.
        You choose exactly what goes on the band.
      </>
    ),
  },
  {
    q: "What if I lose the band?",
    text: "Your record is still on your phone. Write it to a new band in seconds and stop using the old one. A lost band holds only what you chose to share with responders, encrypted.",
    a: (
      <>
        Your record is still on your phone. Write it to a new band in seconds and stop using the old
        one. A lost band holds only what you chose to share with responders, encrypted.
      </>
    ),
  },
  {
    q: "Which phones work?",
    text: "Any Android phone with NFC, which covers most phones sold in India, can read and write bands with the Patient-Tap app. Recent iPhones can read NFC tags, and an iPhone app is planned.",
    a: (
      <>
        Any Android phone with NFC, which covers most phones sold in India, can read and write bands
        with the Patient-Tap app. Recent iPhones can read NFC tags, and an iPhone app is planned.
      </>
    ),
  },
  {
    q: "How does MedVerify know if a medicine is fake?",
    text: "It reads the QR code that India now requires on top drug brands, then checks the product code, batch number, expiry and the pack's unique serial against a manufacturer registry. A serial that has been scanned hundreds of times is flagged as a likely copied code. Today MedVerify uses a demonstration registry of fictional brands. A live version would connect to manufacturer and regulator data.",
    a: (
      <>
        It reads the QR code that India now requires on top drug brands, then checks the product code,
        batch, expiry and the pack&apos;s unique serial against a manufacturer registry. A serial
        scanned hundreds of times is flagged as a likely copied code. Today it uses a{" "}
        <strong className="font-medium text-bone">demonstration registry</strong> of fictional brands.
        A live version would connect to manufacturer and regulator data.{" "}
        <Link href="/verify" className={linkCls}>
          Try it
        </Link>
        .
      </>
    ),
  },
  {
    q: "Is a DNR flag on the band legally binding?",
    text: "No. It records your wish, but in India a valid advance medical directive must follow the procedure set by the Supreme Court (Common Cause v. Union of India, 2018, modified in 2023). Make a formal directive if you want it to be binding.",
    a: (
      <>
        No. It records your wish, but in India a valid advance medical directive must follow the
        procedure set by the Supreme Court (<em>Common Cause v. Union of India</em>, 2018, modified in
        2023). See the{" "}
        <Link href="/disclaimer" className={linkCls}>
          medical disclaimer
        </Link>
        .
      </>
    ),
  },
  {
    q: "Is Patient-Tap a medical device?",
    text: "No. It is an information tool and a hackathon prototype. It does not diagnose or treat anything and doesn't replace doctors or emergency services. In an emergency, call 112.",
    a: (
      <>
        No. It is an information tool and a hackathon prototype. It does not diagnose or treat
        anything and doesn&apos;t replace doctors or emergency services.{" "}
        <strong className="font-medium text-bone">In an emergency, call 112.</strong>
      </>
    ),
  },
  {
    q: "What happens to my data?",
    text: "Your medical record lives on your band and phone, not in our database. If you opt into cloud backup it is encrypted before it leaves your phone and stored in India. We never sell data or show ads, and you can ask us to delete anything we hold.",
    a: (
      <>
        Your medical record lives on your band and phone, not in our database. If you opt into cloud
        backup it is encrypted before it leaves your phone and stored in India. We never sell data or
        show ads, and you can ask us to delete anything we hold. Read the{" "}
        <Link href="/privacy" className={linkCls}>
          privacy policy
        </Link>
        .
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
    <section id="faq" className="scroll-mt-16 pb-28 text-bone md:pb-40">
      {/* Data block, never executed, so it needs no CSP nonce. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="shell grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="display text-[clamp(3rem,8vw,7rem)]">Questions</h2>
          <Link href="/contact" className="label mt-6 inline-block text-bone underline-offset-4 hover:underline">
            Ask us something else <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="border-t border-bone/15">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-bone/15">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-baseline justify-between gap-6 py-6 text-left font-serif text-[clamp(1.25rem,1.8vw,1.6rem)] leading-snug"
                  >
                    {f.q}
                    <span aria-hidden className="w-4 shrink-0 font-mono text-lg text-bone/60">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                  className="pb-7"
                >
                  <p className="max-w-2xl text-[16px] leading-relaxed text-bone/65">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
