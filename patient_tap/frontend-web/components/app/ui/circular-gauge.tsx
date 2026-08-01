"use client";

import { clamp } from "@/lib/utils";

/**
 * Circular tag-storage gauge. `value` is 0..1 fill. Center shows used/total.
 */
export function CircularGauge({
  value,
  used,
  total,
  size = 168,
}: {
  value: number;
  used: number;
  total: number;
  size?: number;
}) {
  const v = clamp(value, 0, 1);
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v);
  const nearFull = v > 0.85;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-paper-sunk"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={nearFull ? "stroke-critical" : "stroke-royal-500"}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-semibold tracking-tight text-ink tnum">
          {Math.round(v * 100)}%
        </span>
        <span className="mt-0.5 font-mono text-[11px] text-ink/45 tnum">
          {used} / {total} B
        </span>
      </div>
    </div>
  );
}
