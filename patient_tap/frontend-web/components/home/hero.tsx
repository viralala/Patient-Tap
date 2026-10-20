import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/ui/parallax";

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
      {/* The intro drifts slower than the page, so the record card slides over it. */}
      <Parallax speed={0.1} className="shell pb-12 pt-16 text-center md:pt-24">
        <h1 className="display text-[clamp(3.6rem,13vw,12rem)]">
          Medical ID
          <br />
          on your wrist
        </h1>
        <p className="mx-auto mt-8 max-w-2xl font-serif text-[clamp(1.15rem,1.6vw,1.45rem)] leading-snug text-bone/60">
          An NFC wristband that carries your allergies, medicines, blood group and emergency
          contacts, encrypted. A responder taps it with a phone and reads it, even with no signal.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/app">Open the web app</Button>
          <Button href="/verify" variant="line">
            Check a medicine
          </Button>
        </div>
      </Parallax>

      {/* What a responder's phone shows after a tap. */}
      <div className="shell relative z-10 pb-24 md:pb-32">
        <figure className="grid overflow-hidden rounded-[18px] bg-cobalt md:grid-cols-[1.5fr_1fr]">
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
