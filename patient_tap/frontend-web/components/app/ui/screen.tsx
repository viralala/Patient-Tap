"use client";

import { cn } from "@/lib/utils";

/** Scrollable screen body inside the app frame (leaves room for the pill nav). */
export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-lenis-prevent
      className={cn("h-full overflow-y-auto px-5 pb-28 pt-5", className)}
    >
      {children}
    </div>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-royal-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
      </div>
      {right}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-paper-line bg-paper-card p-5 card-shadow", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/40">
      {children}
    </p>
  );
}
