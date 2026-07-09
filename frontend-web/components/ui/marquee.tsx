"use client";

import { cn } from "@/lib/utils";

/**
 * Seamless infinite marquee. Renders two identical tracks; the container
 * translates -50% on loop so the join is invisible. Pauses on hover.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  slow = false,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  slow?: boolean;
}) {
  return (
    <div className={cn("group flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center group-hover:[animation-play-state:paused]",
          slow ? "animate-marquee-slow" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
