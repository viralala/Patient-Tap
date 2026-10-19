"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CircleAlert,
  CircleHelp,
  OctagonAlert,
  Pill,
  TriangleAlert,
  Flag,
  RotateCcw,
} from "lucide-react";
import { VERDICT_META, type Medicine, type VerifyResult } from "@/lib/medverify/types";
import { cn } from "@/lib/utils";
import { ReportForm } from "./report-form";

const TONE = {
  safe: { box: "border-signal/35 bg-signal/[0.08]", text: "text-signal-soft", Icon: BadgeCheck },
  warn: { box: "border-amber-400/40 bg-amber-400/[0.08]", text: "text-amber-200", Icon: TriangleAlert },
  danger: { box: "border-critical/45 bg-critical/[0.09]", text: "text-critical-soft", Icon: OctagonAlert },
  neutral: { box: "border-white/15 bg-white/[0.05]", text: "text-white/80", Icon: CircleHelp },
} as const;

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";

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
      <div className={cn("rounded-[22px] border p-6", tone.box)}>
        <div className="flex items-start gap-4">
          <tone.Icon className={cn("h-9 w-9 shrink-0", tone.text)} strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Verdict</p>
            <h2 className={cn("font-display text-3xl font-semibold tracking-tight", tone.text)}>{meta.label}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/80">{meta.advice}</p>
            <ul className="mt-3 space-y-1.5">
              {result.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-white/60">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-white/35" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-4">
          {[
            ["Product code", result.parsed.gtin ?? "—"],
            ["Batch", result.parsed.batch ?? "—"],
            ["Serial", result.parsed.serial ?? "—"],
            ["Expiry on pack", fmtDate(result.parsed.expiry)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-white/40">{k}</dt>
              <dd className="mt-0.5 truncate font-mono text-white/85">{v}</dd>
            </div>
          ))}
        </dl>
        {result.unit && result.unit.scanCount > 0 && (
          <p className="mt-4 text-xs text-white/45">
            This exact pack has been verified {result.unit.scanCount} time{result.unit.scanCount === 1 ? "" : "s"}
            {result.unit.firstScannedAt ? `, first on ${fmtDate(result.unit.firstScannedAt)}` : ""}.
          </p>
        )}
      </div>

      {med && <MedicineDetails med={med} batch={result.batch} />}

      {med && (
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
          <label htmlFor="allergy-check" className="text-sm font-medium text-white/80">
            Check against your allergies <span className="font-normal text-white/40">(stays on this device)</span>
          </label>
          <input
            id="allergy-check"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. penicillin, sulfa"
            className="mt-2 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-hidden placeholder:text-white/30 focus:border-royal-400"
          />
          {allergies.trim() && (
            <p className={cn("mt-3 text-sm", hits.length ? "text-critical-soft" : "text-signal-soft")}>
              {hits.length
                ? `⚠ Possible clash: this medicine contains or belongs to “${hits.join(", ")}”. Don't take it — ask your doctor or pharmacist.`
                : "No match with the allergies you typed. This is a simple text check — always confirm with a pharmacist."}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
        >
          <RotateCcw className="h-4 w-4" /> Check another pack
        </button>
        {!reporting && (
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/50"
          >
            <Flag className="h-4 w-4" /> Report this medicine
          </button>
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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
          <Pill className="h-6 w-6 text-royal-300" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold tracking-tight">{med.brandName}</h3>
            {med.rxRequired && (
              <span className="rounded-full bg-critical/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-critical-soft">
                Rx only
              </span>
            )}
            {med.isDemo && (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-200">
                Demo data
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">
            {med.composition} · {med.dosageForm}
            {med.packSize ? ` · ${med.packSize}` : ""}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {med.manufacturer}
            {med.mfgLicence ? ` · Lic. ${med.mfgLicence}` : ""}
            {batch ? ` · Batch ${batch.batchNo}, mfd ${fmtDate(batch.mfgDate)}, exp ${fmtDate(batch.expiryDate)}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {lists.map(([title, items]) =>
          items.length ? (
            <div key={title}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{title}</p>
              <ul className="mt-2 space-y-1.5">
                {items.map((i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-white/70">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
      {med.storage && <p className="mt-5 text-xs text-white/45">Storage: {med.storage}</p>}
      <p className="mt-4 text-xs leading-relaxed text-white/35">
        General information, not medical advice. Always read the leaflet and ask your doctor or pharmacist.
      </p>
    </div>
  );
}
