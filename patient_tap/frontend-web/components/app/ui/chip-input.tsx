"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

/**
 * Tag/chip input. Adds on Enter or comma; chips are removable. Used for the
 * allergy list on the patient form.
 */
export function ChipInput({
  values,
  onChange,
  placeholder = "Type and press Enter",
  tone = "royal",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  tone?: "royal" | "critical";
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim().replace(/,$/, "");
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  const chipCls =
    tone === "critical"
      ? "bg-critical/10 text-critical-deep"
      : "bg-royal-50 text-royal-700";

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-paper-line bg-paper-card px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-royal-400 focus:ring-4 focus:ring-royal-500/10"
        />
        <button
          type="button"
          onClick={add}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white transition-transform hover:scale-105"
          aria-label="Add"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium ${chipCls}`}
            >
              {v}
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${v}`}>
                <X className="h-3.5 w-3.5 opacity-60 transition-opacity hover:opacity-100" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
