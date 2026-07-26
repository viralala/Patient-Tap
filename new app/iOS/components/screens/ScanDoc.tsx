"use client";
import React, { useRef, useState } from "react";
import { Icon } from "../ui/Icons";
import { NavHeader, Banner } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { parseFieldsFromText, ParsedFields, SAMPLE_DOCS } from "@/lib/ocr";

type Step = "pick" | "extract" | "review";

// F2 — document auto-fill. On-device OCR is simulated on web (see lib/ocr.ts);
// the field parser is real. Nothing is saved without user confirmation (F2.4).
export function ScanDoc() {
  const { profile, setProfile, setRoute, showToast } = useApp();
  const [step, setStep] = useState<Step>("pick");
  const [rawText, setRawText] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedFields | null>(null);
  const [busy, setBusy] = useState(false);
  const [accept, setAccept] = useState({ name: true, bloodType: true, allergies: true, medications: true, dnr: true });
  const fileRef = useRef<HTMLInputElement>(null);

  const pickSample = (text: string) => {
    setImgUrl(null);
    setRawText(text);
    runOcr(text);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgUrl(URL.createObjectURL(f));
    // We can't OCR arbitrary images in-browser; use the first sample as stand-in text.
    setRawText(SAMPLE_DOCS[0].text);
    runOcr(SAMPLE_DOCS[0].text);
  };

  const runOcr = (text: string) => {
    setStep("extract");
    setBusy(true);
    // Simulate the on-device ML Kit pass latency.
    setTimeout(() => {
      setRawText(text);
      setBusy(false);
    }, 900);
  };

  const doParse = () => {
    const p = parseFieldsFromText(rawText);
    setParsed(p);
    setStep("review");
  };

  const confirm = () => {
    if (!parsed) return;
    const next = structuredClone(profile);
    if (accept.name && parsed.name) next.name = parsed.name;
    if (accept.bloodType && parsed.bloodType) next.bloodType = parsed.bloodType;
    if (accept.allergies) next.allergies = Array.from(new Set([...next.allergies, ...parsed.allergies]));
    if (accept.medications)
      for (const m of parsed.medications)
        if (!next.medications.some((x) => x.name.toLowerCase() === m.name.toLowerCase())) next.medications.push(m);
    if (accept.dnr && parsed.dnrFlag) next.dnrFlag = true;
    setProfile(next);
    showToast("Fields added to profile", <Icon.check size={16} color="var(--accent-green)" />);
    setRoute(null);
  };

  return (
    <>
      <NavHeader title="Scan document" onBack={() => setRoute(null)} />
      <div className="screen" style={{ paddingTop: 8 }}>
        <Banner kind="amber" title="On-device only" icon={<Icon.sparkle size={20} />}>
          OCR runs entirely offline (ML Kit on Android). This web build simulates the OCR
          step, then parses labelled fields for real. Always review before saving.
        </Banner>

        {step === "pick" && (
          <>
            <div className="section-title"><h2>Choose a document</h2></div>
            <button className="card row" style={{ width: "100%", marginBottom: 12 }} onClick={() => fileRef.current?.click()}>
              <span className="row-icon t-purple"><Icon.camera size={20} /></span>
              <span className="row-main" style={{ textAlign: "left" }}>
                <span className="row-title">Photograph or upload</span>
                <span className="row-sub">Prescription, discharge summary, allergy report</span>
              </span>
              <Icon.chevronRight size={18} color="var(--text-muted)" />
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={onFile} />
            <div className="caption muted-2" style={{ margin: "8px 2px" }}>Or try a clean sample:</div>
            {SAMPLE_DOCS.map((d) => (
              <button key={d.label} className="card-alt row" style={{ width: "100%", marginBottom: 10 }} onClick={() => pickSample(d.text)}>
                <span className="row-icon t-amber"><Icon.doc size={20} /></span>
                <span className="row-main" style={{ textAlign: "left" }}>
                  <span className="row-title">{d.label}</span>
                  <span className="row-sub">Tap to scan</span>
                </span>
              </button>
            ))}
          </>
        )}

        {step === "extract" && (
          <>
            {imgUrl && <img src={imgUrl} alt="document" style={{ width: "100%", borderRadius: 16, marginBottom: 12, maxHeight: 220, objectFit: "cover" }} />}
            <div className="section-title"><h2>Extracted text</h2></div>
            {busy ? (
              <div className="card center" style={{ padding: 30 }}>
                <div className="scanning-pulse"><Icon.scan size={40} color="var(--accent-purple)" /></div>
                <div className="caption" style={{ marginTop: 12 }}>Reading text on-device…</div>
              </div>
            ) : (
              <>
                <textarea className="input" value={rawText} onChange={(e) => setRawText(e.target.value)} rows={9} />
                <div className="caption muted-2" style={{ margin: "6px 2px 14px" }}>You can correct the raw text before parsing.</div>
                <button className="btn btn-primary" onClick={doParse}><Icon.sparkle size={18} /> Detect fields</button>
              </>
            )}
          </>
        )}

        {step === "review" && parsed && (
          <>
            <Banner kind="blue" title="Review before saving">
              These fields were auto-detected. Uncheck anything wrong — nothing saves without your confirmation.
            </Banner>
            <div className="card">
              <ReviewRow label="Name" value={parsed.name} on={accept.name} disabled={!parsed.name} onToggle={() => setAccept((a) => ({ ...a, name: !a.name }))} />
              <ReviewRow label="Blood type" value={parsed.bloodType} on={accept.bloodType} disabled={!parsed.bloodType} onToggle={() => setAccept((a) => ({ ...a, bloodType: !a.bloodType }))} />
              <ReviewRow label="Allergies" value={parsed.allergies.join(", ")} on={accept.allergies} disabled={parsed.allergies.length === 0} onToggle={() => setAccept((a) => ({ ...a, allergies: !a.allergies }))} />
              <ReviewRow label="Medications" value={parsed.medications.map((m) => `${m.name} ${m.dose}`).join(", ")} on={accept.medications} disabled={parsed.medications.length === 0} onToggle={() => setAccept((a) => ({ ...a, medications: !a.medications }))} />
              <ReviewRow label="DNR" value={parsed.dnrFlag ? "Yes" : undefined} on={accept.dnr} disabled={!parsed.dnrFlag} onToggle={() => setAccept((a) => ({ ...a, dnr: !a.dnr }))} />
            </div>
            <div style={{ height: 16 }} />
            <button className="btn btn-primary" onClick={confirm}><Icon.check size={18} /> Add to profile</button>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setStep("extract")}>Back to text</button>
          </>
        )}
        <div style={{ height: 20 }} />
      </div>
    </>
  );
}

function ReviewRow({
  label,
  value,
  on,
  disabled,
  onToggle,
}: {
  label: string;
  value?: string;
  on: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="row">
      <span className={`row-icon ${disabled ? "" : "t-green"}`}>
        {disabled ? <Icon.x size={18} color="var(--text-muted)" /> : <Icon.check size={18} />}
      </span>
      <span className="row-main">
        <span className="row-title">{label}</span>
        <span className="row-sub">{disabled ? "Not detected — enter manually" : value}</span>
      </span>
      {!disabled && (
        <button className="switch-mini" onClick={onToggle} aria-pressed={on}>
          <span className={`switch ${on ? "on" : ""}`} style={{ transform: "scale(0.8)" }}><span className="knob" /></span>
        </button>
      )}
    </div>
  );
}
