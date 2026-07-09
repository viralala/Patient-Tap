"use client";

import { cn } from "@/lib/utils";

/**
 * A premium dark phone frame with a dynamic-island cutout. Pass the screen
 * content as children (it fills the rounded screen area).
 */
export function PhoneMock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-[min(78vw,300px)] rounded-[46px] border border-white/12 p-2.5",
        className,
      )}
      style={{
        background: "linear-gradient(160deg, #1a1a1f 0%, #101013 60%, #0a0a0c 100%)",
        boxShadow:
          "0 60px 120px -45px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="relative overflow-hidden rounded-[38px] bg-[#0b0b0f]"
        style={{ aspectRatio: "9 / 19.3" }}
      >
        {/* dynamic island */}
        <div className="absolute left-1/2 top-3 z-30 h-6 w-[86px] -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}
