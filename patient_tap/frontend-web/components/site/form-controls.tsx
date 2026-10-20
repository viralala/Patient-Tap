"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-btn border border-bone/20 bg-black/15 px-4 py-3 text-[15px] text-bone outline-hidden transition-colors placeholder:text-bone/35 focus:border-bone aria-[invalid=true]:border-lemon";

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
      <label htmlFor={id} className="label text-bone/75">
        {label}
        {optional && <span className="ml-1.5 text-bone/45">(optional)</span>}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-bone/50">{hint}</p>}
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
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-bone/70">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[#FFE927]"
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
        <p role="alert" className="text-sm text-bone">
          <span className="label mr-2 bg-lemon px-1.5 py-0.5 text-canvas">Error</span>
          {error}
        </p>
      )}
      {status === "done" && <div className="text-sm text-bone">{success}</div>}
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
      className={cn("btn btn-solid disabled:pointer-events-none disabled:opacity-60", className)}
    >
      <span>{sending ? "Sending" : children}</span>
      <span aria-hidden>{sending ? "…" : "→"}</span>
    </button>
  );
}
