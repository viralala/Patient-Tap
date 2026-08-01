"use client";

import { cn } from "@/lib/utils";

/** Segmented control with a sliding indicator. Dark or light variant. */
export function Segmented({
  options,
  value,
  onChange,
  variant = "light",
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
  variant?: "light" | "dark";
}) {
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const width = 100 / options.length;
  const dark = variant === "dark";

  return (
    <div
      className={cn(
        "relative flex rounded-pill p-1",
        dark ? "bg-ink" : "border border-paper-line bg-paper-sunk",
      )}
    >
      <span
        className="absolute inset-y-1 rounded-pill bg-royal-500 transition-transform duration-300 ease-springy"
        style={{
          width: `calc(${width}% - 4px)`,
          transform: `translateX(calc(${index * 100}% + ${index * 4}px))`,
        }}
      />
      {options.map((o) => {
        const isActive = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative z-10 flex-1 rounded-pill px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "text-white" : dark ? "text-white/50" : "text-ink/50",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
