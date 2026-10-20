/**
 * First-load curtain: contactless waves, the wordmark rising into place and a
 * read bar, then the panel lifts away. Pure CSS (see globals.css), so it can
 * never get stuck if scripts fail. Hidden for repeat views in the same session
 * and for visitors who prefer reduced motion.
 */
export function Loader() {
  return (
    <div className="loader" aria-hidden>
      <div className="flex w-[min(80vw,420px)] flex-col items-center">
        <svg viewBox="0 0 40 40" className="wave h-10 w-10 text-bone" fill="none">
          <circle cx="11" cy="20" r="3" fill="currentColor" />
          <path d="M18 13a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M24 8.5a16 16 0 0 1 0 23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <p className="mt-6 overflow-hidden">
          <span className="loader-word display text-[clamp(3rem,12vw,5.5rem)]">Patient-Tap</span>
        </p>
        <div className="loader-bar mt-6 w-full">
          <span />
        </div>
        <p className="label mt-3 flex w-full justify-between text-bone/50">
          <span>Reading tag</span>
          <span>NFC 13.56 MHz</span>
        </p>
      </div>
    </div>
  );
}
