import { cn } from "@/lib/utils";

/** The Patient-Tap mark: a credential card corner emitting NFC waves. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden fill="none">
      <rect x="2.5" y="2.5" width="27" height="27" rx="8" className="fill-royal-500" />
      <rect
        x="7"
        y="9"
        width="11"
        height="14"
        rx="2.4"
        className="fill-white/95"
      />
      <line x1="9.4" y1="12.4" x2="15.6" y2="12.4" className="stroke-royal-500" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.4" y1="15.4" x2="14" y2="15.4" className="stroke-royal-300" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.4" y1="18.4" x2="15" y2="18.4" className="stroke-royal-300" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21 11.5a6 6 0 0 1 0 9" className="stroke-white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M23.6 9.4a9.4 9.4 0 0 1 0 13.2" className="stroke-white/70" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Full wordmark. `tone` controls text color for light vs dark chapters. */
export function Logo({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "white";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-[17px] font-semibold tracking-tight",
        tone === "white" ? "text-white" : "text-ink",
        className,
      )}
    >
      <LogoMark />
      <span>
        Patient<span className="text-royal-500">·</span>Tap
      </span>
    </span>
  );
}
