import { Lock, WifiOff, HeartPulse, Radio, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function Bento() {
  return (
    <section id="security" className="relative bg-paper py-28 md:py-40">
      <div className="shell">
        {/* Editorial header — headline left, framing paragraph right */}
        <Reveal className="grid gap-8 md:grid-cols-2 md:items-end" stagger>
          <div data-reveal-item>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-royal-600">
              <span className="h-1.5 w-1.5 rounded-full bg-royal-500" />
              The record, engineered
            </p>
            <h2 className="mt-5 max-w-xl font-display text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Built to work when everything else doesn&apos;t.
            </h2>
          </div>
          <p data-reveal-item className="max-w-md text-base leading-relaxed text-ink/55 md:justify-self-end">
            No signal, no server, no login. The record is encrypted directly onto
            the wristband, so the phone in a bystander&apos;s hand is the only
            infrastructure a first responder needs.
          </p>
        </Reveal>

        {/* Gapless bento — 6 cols, grid-flow-dense, interlocking spans */}
        <Reveal
          className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-flow-dense md:[grid-auto-rows:minmax(210px,1fr)]"
          stagger
        >
          {/* Encryption — large anchor card (dark) */}
          <article
            data-reveal-item
            className="on-ink group relative flex flex-col justify-between overflow-hidden rounded-card bg-ink p-8 text-white md:col-span-4 md:row-span-2"
          >
            <div className="glow-royal absolute inset-0 opacity-60" />
            <div className="grain absolute inset-0" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Lock className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                256-bit
              </span>
            </div>
            <div className="relative z-10 mt-10">
              {/* faux encrypted rows */}
              <div className="space-y-2">
                {["w-11/12", "w-3/4", "w-10/12", "w-2/3"].map((w, i) => (
                  <div
                    key={i}
                    className={`h-2.5 ${w} rounded-full bg-white/10 transition-all duration-700 group-hover:bg-royal-500/40`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
              <h3 className="mt-8 max-w-md font-display text-2xl font-semibold leading-snug md:text-3xl">
                Encrypted on the tag — never in a database.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                Every record is sealed with AES-256-GCM before it touches the
                NTAG215. A tampered byte fails the auth tag and the responder is
                warned — no silent corruption, no honeypot to breach.
              </p>
            </div>
          </article>

          {/* Zero network — stat card */}
          <article
            data-reveal-item
            className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-paper-line bg-paper-card p-7 card-shadow transition-colors duration-500 hover:border-royal-200 md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <WifiOff className="h-6 w-6 text-royal-500" strokeWidth={1.8} />
              <ArrowUpRight className="h-4 w-4 text-ink/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="font-display text-6xl font-semibold tracking-tight text-ink tnum">0</p>
              <p className="mt-2 text-sm text-ink/55">network calls to read a tag</p>
            </div>
          </article>

          {/* Capacity — gauge card */}
          <article
            data-reveal-item
            className="group relative overflow-hidden rounded-card border border-paper-line bg-paper-card p-7 card-shadow transition-colors duration-500 hover:border-royal-200 md:col-span-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-4xl font-semibold tracking-tight text-ink tnum">
                  504<span className="text-xl text-ink/40"> B</span>
                </p>
                <p className="mt-1 text-sm text-ink/55">NTAG215 capacity</p>
              </div>
              <span className="rounded-pill bg-royal-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-royal-600">
                fits it all
              </span>
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-paper-sunk">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-royal-600 to-royal-400 transition-[width] duration-700 group-hover:w-[70%]" />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-ink/40">
                <span>record + log</span>
                <span>312 / 504</span>
              </div>
            </div>
          </article>

          {/* Life-safety */}
          <article
            data-reveal-item
            className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-critical/20 bg-gradient-to-br from-critical/[0.06] to-transparent p-7 transition-colors duration-500 hover:border-critical/40 md:col-span-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-critical/10">
                <HeartPulse className="h-5 w-5 text-critical" strokeWidth={1.9} />
              </div>
              <div className="flex gap-1.5">
                {["DNR", "Penicillin", "Latex"].map((t) => (
                  <span
                    key={t}
                    className="rounded-pill bg-critical/10 px-2.5 py-1 text-[11px] font-medium text-critical-deep"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold text-ink">
                Life-safety surfaces first.
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/55">
                DNR status and allergies render loudest and reddest — decided in
                the layout, not left to a responder scrolling under pressure.
              </p>
            </div>
          </article>

          {/* Alerts */}
          <article
            data-reveal-item
            className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-paper-line bg-paper-card p-7 card-shadow transition-colors duration-500 hover:border-royal-200 md:col-span-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-royal-50">
                <Radio className="h-5 w-5 text-royal-600" strokeWidth={1.9} />
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-signal-deep">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                opportunistic
              </span>
            </div>
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold text-ink">
                Alerts the instant a bar of signal appears.
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/55">
                Offline is the default, not a failure. An SMS with a live GPS pin
                queues and fires the moment connectivity returns.
              </p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
