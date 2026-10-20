import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/ui/parallax";
import { NfcCardStack } from "./nfc-card";

const RECORD: [string, string, boolean?][] = [
  ["Name", "Arjun Mehta, PT-0007"],
  ["Blood group", "O negative"],
  ["DNR", "Yes", true],
  ["Allergies", "Penicillin, peanuts", true],
  ["Medicine", "Metformin 500 mg, twice daily"],
  ["Contact", "Priya Mehta (spouse), +91 98765 43210"],
];

const SPECS: [string, string][] = [
  ["Chip", "NTAG215, 504 bytes"],
  ["Encryption", "AES-256-GCM"],
  ["Battery", "None"],
  ["Signal needed", "None"],
];

export function Hero() {
  return (
    <section className="relative pt-16 text-bone">
      <div className="shell grid items-center gap-14 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-24">
        <div>
          <h1 data-reveal className="display text-[clamp(3.4rem,8vw,8.25rem)]">
            Medical ID
            <br />
            on your
            <br />
            wrist
          </h1>
          <p
            data-reveal
            style={{ "--d": 1 } as React.CSSProperties}
            className="mt-8 max-w-xl font-serif text-[clamp(1.15rem,1.6vw,1.45rem)] leading-snug text-bone/65"
          >
            An NFC wristband that carries your allergies, medicines, blood group and emergency
            contacts, encrypted. A responder taps it with a phone and reads it, even with no signal.
          </p>
          <div
            data-reveal
            style={{ "--d": 2 } as React.CSSProperties}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button href="/app">Open the web app</Button>
            <Button href="/verify" variant="line">
              Check a medicine
            </Button>
          </div>
        </div>

        {/* The card drifts up a little faster than the page. */}
        <Parallax speed={-0.08} minWidth={1024} className="px-4 sm:px-10 lg:pl-0 lg:pr-8">
          <div data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <NfcCardStack />
          </div>
        </Parallax>
      </div>

      {/* What a responder's phone shows after a tap. */}
      <div className="shell relative z-10 pb-24 md:pb-32">
        <figure data-reveal className="grid overflow-hidden rounded-[18px] bg-cobalt md:grid-cols-[1.5fr_1fr]">
          <div className="p-6 md:p-10">
            <figcaption className="label flex items-center justify-between text-bone/75">
              <span>What a responder sees after one tap</span>
              <span>Sample record</span>
            </figcaption>
            <dl className="mt-8 divide-y divide-bone/20 border-y border-bone/20 font-mono text-[13px] md:text-sm">
              {RECORD.map(([k, v, alert]) => (
                <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3 md:grid-cols-[9rem_1fr]">
                  <dt className="uppercase tracking-wide text-bone/65">{k}</dt>
                  <dd className={alert ? "font-medium text-lemon" : "text-bone"}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between border-t border-bone/20 p-6 md:border-l md:border-t-0 md:p-10">
            <dl className="space-y-5">
              {SPECS.map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-bone/65">{k}</dt>
                  <dd className="mt-1 font-serif text-2xl leading-tight">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 font-mono text-xs leading-relaxed text-bone/70">
              Nothing is printed on the band. The record lives inside the chip.
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}
