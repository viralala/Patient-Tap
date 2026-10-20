/** Contactless symbol: a dot and two arcs. `animated` lights the waves in turn. */
export function ContactlessMark({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={`${animated ? "wave " : ""}${className ?? ""}`} fill="none" aria-hidden>
      <circle cx="11" cy="20" r="3" fill="currentColor" />
      <path d="M18 13a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 8.5a16 16 0 0 1 0 23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** The chip contacts, drawn as flat lines. */
function Chip() {
  return (
    <svg viewBox="0 0 52 40" className="h-10 w-[52px]" fill="none" aria-hidden>
      <rect x="1" y="1" width="50" height="38" rx="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1 14h15M1 26h15M36 14h15M36 26h15M16 1v38M36 1v38M16 20h20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Two flat cards: a scarlet one behind, the bone Patient-Tap card in front.
 * They fan apart on hover (styles in globals.css). No personal data on the
 * face, matching the real product: the record lives inside the chip.
 */
export function NfcCardStack() {
  return (
    <div className="nfc-stack relative mx-auto aspect-[1.586] w-full max-w-[460px]">
      <div
        aria-hidden
        className="nfc-back absolute inset-0 rounded-[22px] bg-scarlet"
      />

      <figure
        className="nfc-front absolute inset-0 flex flex-col justify-between rounded-[22px] bg-bone p-6 text-canvas shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] sm:p-8"
      >
        <div className="flex items-start justify-between">
          <span className="display text-[clamp(1.6rem,3vw,2.1rem)] leading-none">Patient-Tap</span>
          <ContactlessMark animated className="h-8 w-8 text-cobalt sm:h-9 sm:w-9" />
        </div>
        <Chip />
        <figcaption className="flex items-end justify-between gap-4">
          <span className="font-mono text-[11px] uppercase leading-relaxed tracking-wide text-canvas/65 sm:text-xs">
            NTAG215, 504 bytes
            <br />
            AES-256-GCM sealed
          </span>
          <span className="label bg-canvas px-2 py-1 text-bone">Tap here</span>
        </figcaption>
      </figure>
    </div>
  );
}
