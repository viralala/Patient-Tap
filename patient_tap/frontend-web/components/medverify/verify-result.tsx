"use client";

import { useState } from "react";
import { VERDICT_META, type Medicine, type VerifyResult } from "@/lib/medverify/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/site/form-controls";
import { ReportForm } from "./report-form";

// Flat verdict panels. Text inherits the panel colour, so lemon gets dark ink.
const TONE = {
  safe: "bg-pine text-bone",
  warn: "bg-lemon text-canvas",
  danger: "bg-scarlet text-bone",
  neutral: "border border-bone/20 text-bone",
} as const;

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Not given";

/** Client-side only: does this medicine clash with an allergy the user typed? */
function allergyHits(med: Medicine, allergies: string): string[] {
  const hay = `${med.genericName} ${med.drugClass ?? ""} ${med.composition}`.toLowerCase();
  return allergies
    .split(/[,;\n]/)
    .map((a) => a.trim().toLowerCase())
    .filter((a) => a.length >= 3)
    .filter((a) => hay.includes(a) || (a.startsWith("penicillin") && hay.includes("penicillin")));
}

export function VerifyResultView({ result, onReset }: { result: VerifyResult; onReset: () => void }) {
  const meta = VERDICT_META[result.verdict];
  const tone = TONE[meta.tone];
  const med = result.medicine;
  const [allergies, setAllergies] = useState("");
  const [reporting, setReporting] = useState(result.verdict !== "genuine" && result.verdict !== "unknown");
  const hits = med ? allergyHits(med, allergies) : [];

  return (
    <div className="space-y-5" aria-live="polite">
      {/* verdict */}
      <div className={cn("rounded-[18px] p-6 md:p-7", tone)}>
        <p className="label opacity-70">Verdict</p>
        <h2 className="display mt-3 text-[clamp(2.6rem,5vw,3.75rem)]">{meta.label}</h2>
        <p className="mt-3 font-serif text-xl leading-snug">{meta.advice}</p>
        <ul className="mt-4 space-y-1.5">
          {result.reasons.map((r) => (
            <li key={r} className="flex gap-2 text-[15px] leading-relaxed opacity-80">
              <span aria-hidden className="font-mono">+</span> {r}
            </li>
          ))}
        </ul>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-current/20 pt-5 text-sm sm:grid-cols-4">
          {[
            ["Product code", result.parsed.gtin ?? "Not given"],
            ["Batch", result.parsed.batch ?? "Not given"],
            ["Serial", result.parsed.serial ?? "Not given"],
            ["Expiry on pack", fmtDate(result.parsed.expiry)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="label text-[10px] opacity-65">{k}</dt>
              <dd className="mt-0.5 truncate font-mono">{v}</dd>
            </div>
          ))}
        </dl>
        {result.unit && result.unit.scanCount > 0 && (
          <p className="mt-4 font-mono text-xs opacity-70">
            This exact pack has been verified {result.unit.scanCount} time{result.unit.scanCount === 1 ? "" : "s"}
            {result.unit.firstScannedAt ? `, first on ${fmtDate(result.unit.firstScannedAt)}` : ""}.
          </p>
        )}
      </div>

      {med && <MedicineDetails med={med} batch={result.batch} />}

      {med && (
        <div className="rounded-[18px] border border-bone/15 p-6">
          <label htmlFor="allergy-check" className="label text-bone/75">
            Check against your allergies <span className="text-bone/45">(stays on this device)</span>
          </label>
          <input
            id="allergy-check"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. penicillin, sulfa"
            className={cn(inputClass, "mt-2")}
          />
          {allergies.trim() && (
            <p className="mt-3 text-[15px] leading-relaxed text-bone/85">
              {hits.length ? (
                <>
                  <span className="label mr-2 bg-scarlet px-1.5 py-0.5 text-bone">Possible clash</span>
                  This medicine contains or belongs to &ldquo;{hits.join(", ")}&rdquo;. Don&apos;t take it.
                  Ask your doctor or pharmacist.
                </>
              ) : (
                "No match with the allergies you typed. This is a simple text check, so always confirm with a pharmacist."
              )}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onReset} glyph="↺">
          Check another pack
        </Button>
        {!reporting && (
          <Button onClick={() => setReporting(true)} variant="line" glyph="!">
            Report this medicine
          </Button>
        )}
      </div>

      {reporting && <ReportForm parsed={result.parsed} />}
    </div>
  );
}

export function MedicineDetails({ med, batch }: { med: Medicine; batch?: VerifyResult["batch"] }) {
  const lists: [string, string[]][] = [
    ["Used for", med.uses],
    ["Common side effects", med.sideEffects],
    ["Warnings", med.warnings],
    ["Interacts with", med.interactions],
  ];
  return (
    <div className="rounded-[18px] border border-bone/15 p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-serif text-3xl leading-tight">{med.brandName}</h3>
        {med.rxRequired && <span className="label bg-bone px-1.5 py-0.5 text-canvas">Rx only</span>}
        {med.isDemo && <span className="label border border-bone/40 px-1.5 py-0.5 text-bone/75">Demo data</span>}
      </div>
      <p className="mt-1 text-[15px] text-bone/70">
        {med.composition}, {med.dosageForm}
        {med.packSize ? `, ${med.packSize}` : ""}
      </p>
      <p className="mt-1 font-mono text-xs text-bone/50">
        {med.manufacturer}
        {med.mfgLicence ? `. Lic. ${med.mfgLicence}` : ""}
        {batch ? `. Batch ${batch.batchNo}, mfd ${fmtDate(batch.mfgDate)}, exp ${fmtDate(batch.expiryDate)}` : ""}
      </p>

      <div className="mt-6 grid gap-5 border-t border-bone/15 pt-5 sm:grid-cols-2">
        {lists.map(([title, items]) =>
          items.length ? (
            <div key={title}>
              <p className="label text-bone/50">{title}</p>
              <ul className="mt-2 space-y-1.5">
                {items.map((i) => (
                  <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-bone/75">
                    <span aria-hidden className="font-mono text-bone/45">+</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
      {med.storage && <p className="mt-5 font-mono text-xs text-bone/55">Storage: {med.storage}</p>}
      <p className="mt-4 font-mono text-xs leading-relaxed text-bone/45">
        General information, not medical advice. Always read the leaflet and ask your doctor or pharmacist.
      </p>
    </div>
  );
}
