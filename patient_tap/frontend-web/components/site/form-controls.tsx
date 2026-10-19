"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-hidden transition-colors placeholder:text-white/30 focus:border-royal-400 focus:bg-white/[0.06] aria-[invalid=true]:border-critical/70";

export function FieldLabel({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white/80">
        {label}
        {optional && <span className="ml-1.5 font-normal text-white/35">(optional)</span>}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white/60">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[#5E7DEE]"
      />
      <span>{children}</span>
    </label>
  );
}

/** Off-screen field bots love to fill. Real people never see it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

export function FormStatus({
  status,
  error,
  success,
}: {
  status: "idle" | "sending" | "done" | "error";
  error?: string;
  success: React.ReactNode;
}) {
  return (
    <div aria-live="polite" className="min-h-[1.25rem]">
      {status === "error" && error && (
        <p role="alert" className="text-sm text-critical-soft">
          {error}
        </p>
      )}
      {status === "done" && <div className="text-sm text-signal-soft">{success}</div>}
    </div>
  );
}

export function SubmitButton({
  sending,
  children,
  className,
}: {
  sending: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={sending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03] disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
    >
      {sending && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/25 border-t-black" />
      )}
      {children}
    </button>
  );
}
