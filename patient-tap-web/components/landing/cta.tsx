import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section id="access" className="on-ink relative overflow-hidden bg-ink py-32 text-white md:py-44">
      <div className="glow-royal absolute inset-0" />
      <div className="grain absolute inset-0" />

      {/* oversized ambient wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-4%] select-none text-center font-display text-[26vw] font-semibold leading-none tracking-tighter text-white/[0.035]"
      >
        TAP IN
      </div>

      <div className="shell relative z-10 flex flex-col items-center text-center">
        <Reveal className="flex flex-col items-center" stagger>
          <p
            data-reveal-item
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Ready when you are
          </p>
          <h2
            data-reveal-item
            className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.98] tracking-tight"
          >
            Put the record
            <br />
            on the wrist.
          </h2>
          <p data-reveal-item className="mt-7 max-w-lg text-balance text-white/55">
            Explore both sides of the demo — build a patient credential, write it
            to a tag, then scan it back as a responder. Everything runs in the
            browser, fully mocked.
          </p>
          <div data-reveal-item className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button href="/app" variant="white" arrow cursorLabel="open" className="px-8 py-4">
              Launch the app
            </Button>
            <Button
              href="https://github.com/viralala/Patient-Tap"
              variant="ghostInverse"
              className="px-8 py-4"
            >
              View the code
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
