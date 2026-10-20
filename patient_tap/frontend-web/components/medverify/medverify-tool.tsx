"use client";

import { useCallback, useRef, useState } from "react";
import { CameraScanner, decodeImageFile } from "./camera-scanner";
import { MedicineDetails, VerifyResultView } from "./verify-result";
import { QrCode } from "./qr-code";
import { FieldLabel, inputClass } from "@/components/site/form-controls";
import { postJson } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { DEMO_PACKS, VERDICT_META, type Medicine, type VerifyResult } from "@/lib/medverify/types";
import { cn } from "@/lib/utils";

type Mode = "camera" | "photo" | "manual" | "search";

const MODES: { id: Mode; label: string }[] = [
  { id: "camera", label: "Scan" },
  { id: "photo", label: "Photo" },
  { id: "manual", label: "Type code" },
  { id: "search", label: "Search" },
];

export function MedVerifyTool() {
  const [mode, setMode] = useState<Mode>("camera");
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const verify = useCallback(async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    const res = await postJson<{ result: VerifyResult }>("/api/medverify/verify", body);
    setBusy(false);
    if (res.ok) {
      setResult(res.data.result);
      setCameraOn(false);
      requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else setError(res.error);
  }, []);

  const verifyCode = useCallback((code: string) => verify({ code }), [verify]);

  const reset = () => {
    setResult(null);
    setError("");
    if (mode === "camera") setCameraOn(true);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
      {/* input */}
      <div className="no-print rounded-[18px] border border-bone/15 p-5 md:p-7">
        <div role="tablist" aria-label="How to check" className="grid grid-cols-4 gap-1 rounded-btn border border-bone/20 p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => {
                setMode(m.id);
                setCameraOn(m.id === "camera");
                setError("");
              }}
              className={cn(
                "label rounded-[7px] px-1 py-2.5 transition-colors",
                mode === m.id ? "bg-bone text-canvas" : "text-bone/60 hover:text-bone",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-6" role="tabpanel">
          {mode === "camera" && (
            <div>
              {cameraOn ? (
                <CameraScanner active={cameraOn} onCode={verifyCode} />
              ) : (
                <button
                  type="button"
                  onClick={() => setCameraOn(true)}
                  className="grid aspect-[4/3] w-full place-items-center rounded-[14px] border border-dashed border-bone/25 bg-black/20 text-bone transition-colors hover:border-bone/60"
                >
                  <span className="label">[ Start camera ]</span>
                </button>
              )}
              <p className="mt-3 font-mono text-xs text-bone/50">
                Video is processed in your browser and never uploaded. Only the decoded code is checked.
              </p>
            </div>
          )}

          {mode === "photo" && <PhotoInput onCode={verifyCode} onError={setError} />}
          {mode === "manual" && <ManualInput onSubmit={verify} busy={busy} />}
          {mode === "search" && <NameSearch />}
        </div>

        {busy && (
          <p className="label mt-5 text-bone/65">Checking the registry…</p>
        )}
        {error && (
          <p role="alert" className="mt-5 text-sm text-bone">
            <span className="label mr-2 bg-lemon px-1.5 py-0.5 text-canvas">Error</span>
            {error}
          </p>
        )}
      </div>

      {/* result */}
      <div ref={panel} className="no-print scroll-mt-28">
        {result ? (
          <VerifyResultView result={result} onReset={reset} />
        ) : (
          <div className="flex h-full min-h-[320px] flex-col justify-center rounded-[18px] border border-dashed border-bone/20 p-8 text-center">
            <p className="font-serif text-2xl">Your result will appear here</p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] text-bone/55">
              No medicine to hand? Scan a demo pack below from another screen, or press
              &ldquo;Check this pack&rdquo;.
            </p>
          </div>
        )}
      </div>

      <DemoPacks onCheck={verifyCode} busy={busy} />
    </div>
  );
}

function PhotoInput({ onCode, onError }: { onCode: (c: string) => void; onError: (e: string) => void }) {
  const [reading, setReading] = useState(false);
  return (
    <div>
      <label className="grid aspect-[4/3] w-full cursor-pointer place-items-center rounded-[14px] border border-dashed border-bone/25 bg-black/20 text-bone transition-colors hover:border-bone/60">
        <span className="label px-6 text-center">
          {reading ? "Reading the code…" : "[ Take or choose a photo of the QR code ]"}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (file.size > 15 * 1024 * 1024) return onError("That image is too large. Try one under 15 MB.");
            setReading(true);
            const text = await decodeImageFile(file);
            setReading(false);
            if (text) onCode(text);
            else onError("We couldn't find a readable code in that photo. Get closer, keep it sharp, and try again.");
          }}
        />
      </label>
      <p className="mt-3 font-mono text-xs text-bone/50">The photo is decoded on your device and is never uploaded.</p>
    </div>
  );
}

function ManualInput({ onSubmit, busy }: { onSubmit: (b: Record<string, unknown>) => void; busy: boolean }) {
  const [raw, setRaw] = useState("");
  const [gtin, setGtin] = useState("");
  const [batch, setBatch] = useState("");
  const [serial, setSerial] = useState("");
  const [expiry, setExpiry] = useState("");
  const [fields, setFields] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (fields) onSubmit({ gtin, batch: batch || undefined, serial: serial || undefined, expiry: expiry || undefined });
        else onSubmit({ code: raw });
      }}
      className="space-y-4"
    >
      {!fields ? (
        <FieldLabel label="Code from the pack" hint="Paste the text under the QR code, e.g. (01)…(17)…(10)…(21)…">
          {(id) => (
            <textarea
              id={id}
              required
              rows={3}
              maxLength={512}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="(01)00400000000015(17)290331(10)PX26A04(21)PTGEN0001"
              className={cn(inputClass, "font-mono text-sm")}
            />
          )}
        </FieldLabel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Product code (GTIN)">
            {(id) => <input id={id} required inputMode="numeric" maxLength={14} value={gtin} onChange={(e) => setGtin(e.target.value)} className={cn(inputClass, "font-mono")} />}
          </FieldLabel>
          <FieldLabel label="Batch no." optional>
            {(id) => <input id={id} maxLength={20} value={batch} onChange={(e) => setBatch(e.target.value)} className={cn(inputClass, "font-mono uppercase")} />}
          </FieldLabel>
          <FieldLabel label="Serial no." optional>
            {(id) => <input id={id} maxLength={20} value={serial} onChange={(e) => setSerial(e.target.value)} className={cn(inputClass, "font-mono uppercase")} />}
          </FieldLabel>
          <FieldLabel label="Expiry date" optional>
            {(id) => <input id={id} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={cn(inputClass, "[color-scheme:dark]")} />}
          </FieldLabel>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" disabled={busy}>
          Verify
        </Button>
        <button type="button" onClick={() => setFields((f) => !f)} className="text-sm text-bone/60 underline-offset-4 hover:text-bone hover:underline">
          {fields ? "Paste the full code instead" : "Enter fields separately"}
        </button>
      </div>
    </form>
  );
}

function NameSearch() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Medicine[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const res = await postJson<{ results: Medicine[] }>("/api/medverify/search", { q });
          setBusy(false);
          if (res.ok) setResults(res.data.results);
          else setError(res.error);
        }}
        className="flex gap-2"
      >
        <label htmlFor="med-search" className="sr-only">
          Medicine name
        </label>
        <input
          id="med-search"
          required
          minLength={2}
          maxLength={60}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Brand or generic name, e.g. paracetamol"
          className={inputClass}
        />
        <button type="submit" disabled={busy} className="btn btn-solid shrink-0 disabled:opacity-60">
          <span>{busy ? "…" : "Search"}</span>
        </button>
      </form>
      <p className="mt-3 font-mono text-xs text-bone/50">Search shows what a medicine is. It can&apos;t tell you whether a pack is genuine, so scan for that.</p>
      {error && <p className="mt-3 text-sm text-bone">{error}</p>}
      {results && (
        <ul className="mt-5 space-y-3">
          {results.length === 0 && <li className="text-sm text-bone/55">No matches in the demo registry.</li>}
          {results.map((m) => (
            <li key={m.gtin}>
              <button
                type="button"
                onClick={() => setOpen(open === m.gtin ? null : m.gtin)}
                aria-expanded={open === m.gtin}
                className="flex w-full items-baseline justify-between gap-3 rounded-btn border border-bone/15 px-4 py-3 text-left transition-colors hover:border-bone/40"
              >
                <span>
                  <span className="font-serif text-lg">{m.brandName}</span>
                  <span className="ml-2 text-sm text-bone/55">{m.genericName}</span>
                </span>
                <span aria-hidden className="font-mono text-bone/50">{open === m.gtin ? "−" : "+"}</span>
              </button>
              {open === m.gtin && (
                <div className="mt-3">
                  <MedicineDetails med={m} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DemoPacks({ onCheck, busy }: { onCheck: (code: string) => void; busy: boolean }) {
  return (
    <section id="demo-packs" aria-labelledby="demo-packs-title" className="scroll-mt-28 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="demo-packs-title" className="display text-[clamp(2.5rem,6vw,5rem)]">
            Demo packs
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-bone/60">
            Six fictional packs, one for each verdict. Scan a QR with another phone, print them for a
            live demo, or tap a card to check it here.
          </p>
        </div>
        <Button onClick={() => window.print()} variant="line" glyph="⎙" className="no-print">
          Print packs
        </Button>
      </div>
      <ul className="print-packs mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_PACKS.map((p) => {
          const tone = VERDICT_META[p.expect].tone;
          return (
            <li key={p.id} className="print-pack flex gap-4 rounded-[18px] border border-bone/15 p-4">
              <QrCode value={p.code} size={112} className="shrink-0 rounded-lg" label={`QR code for the ${p.title} demo pack`} />
              <div className="flex min-w-0 flex-col">
                <p className="font-serif text-lg leading-tight">{p.title}</p>
                <p className="text-sm text-bone/55">{p.brand}</p>
                <span
                  className={cn(
                    "label mt-2 w-fit px-1.5 py-0.5 text-[10px]",
                    tone === "safe" && "bg-pine text-bone",
                    tone === "warn" && "bg-lemon text-canvas",
                    tone === "danger" && "bg-scarlet text-bone",
                    tone === "neutral" && "border border-bone/30 text-bone/70",
                  )}
                >
                  Expect: {VERDICT_META[p.expect].label}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onCheck(p.code)}
                  className="label no-print mt-auto w-fit pt-3 text-bone underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Check this pack <span aria-hidden>→</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
