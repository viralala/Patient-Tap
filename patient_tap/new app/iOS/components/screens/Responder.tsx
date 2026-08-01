"use client";
import React, { useState } from "react";
import { Icon } from "../ui/Icons";
import { Banner, Sheet } from "../ui/Widgets";
import { TapOverlay } from "./WriteTag";
import { useApp } from "../AppContext";
import { PatientProfile, LogEntry } from "@/lib/types";
import { readFromTag, writeToTag, tagIsSetUp, TagError } from "@/lib/tag";
import { deserializeFromTag, serializeForWrite } from "@/lib/store";
import { ALL_SELECTED } from "@/lib/types";
import { checkConflict, ConflictResult } from "@/lib/conflict";
import { sendAlert, smsDeepLink, AlertResult } from "@/lib/alert";
import { CAN_WRITE_TAG } from "@/lib/platform";

type Phase = "idle" | "scanning" | "loaded" | "error";
const RESPONDER_ID = "EMT-" + Math.floor(1000 + Math.random() * 9000);

// F7–F12 — Responder mode. No login required (F7 / PRD §6.1).
export function Responder() {
  const { showToast } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [alert, setAlert] = useState<AlertResult | null>(null);
  const [logSheet, setLogSheet] = useState(false);
  const [t0, setT0] = useState(0);
  const [readMs, setReadMs] = useState(0);

  const scan = async () => {
    setPhase("scanning");
    setAlert(null);
    const start = performance.now();
    setT0(start);
    try {
      await new Promise((r) => setTimeout(r, 900)); // tap animation
      const json = await readFromTag();
      const p = deserializeFromTag(json);
      setPatient(p);
      setReadMs(Math.round(performance.now() - start));
      setPhase("loaded");
      // F12 — alert primary emergency contact with GPS.
      if (p.emergencyContacts[0]) {
        const res = await sendAlert(p.emergencyContacts[0], p.name);
        setAlert(res);
      }
    } catch (e) {
      setErrMsg(e instanceof TagError ? e.message : "Could not read tag.");
      setPhase("error");
    }
  };

  const onLogged = async (entry: LogEntry) => {
    if (!patient) return;
    const next = structuredClone(patient);
    next.treatmentLog = [entry, ...next.treatmentLog];
    setPatient(next);
    setLogSheet(false);
    // F11 — write updated profile back to the tag.
    try {
      await writeToTag(serializeForWrite(next, ALL_SELECTED));
      showToast("Log written back to tag", <Icon.check size={16} color="var(--accent-green)" />);
    } catch {
      showToast("Log saved locally (tag write queued)", <Icon.info size={16} />);
    }
  };

  if (phase === "scanning") {
    return <TapOverlay title="Scanning tag" sub="Reading and decrypting the patient's profile…" />;
  }

  if (phase === "idle" || phase === "error") {
    return (
      <div className="screen fade-in" style={{ display: "flex", flexDirection: "column" }}>
        <div className="large-title">Responder</div>
        <Banner kind="blue" title="No login required" icon={<Icon.shield size={20} />}>
          Scanning a patient tag is frictionless in an emergency. Login only gates the patient's own data.
        </Banner>
        {phase === "error" && <Banner kind="danger" title="Scan failed">{errMsg}</Banner>}
        {typeof window !== "undefined" && !tagIsSetUp() && (
          <Banner kind="amber" title="No tag written yet">
            Write a profile from Patient mode first, then scan it here to see the full flow.
          </Banner>
        )}
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "30px 0" }}>
          <button onClick={scan} style={{ display: "grid", placeItems: "center", gap: 18 }}>
            <div className="nfc-ripple" style={{ width: 150, height: 150 }}>
              <Icon.nfc size={64} color="var(--accent-blue)" />
            </div>
            <span className="headline">Tap to scan patient tag</span>
          </button>
        </div>
      </div>
    );
  }

  // loaded
  const p = patient!;
  return (
    <div className="screen fade-in">
      <div className="row-flex" style={{ margin: "6px 0 12px" }}>
        <div className="large-title" style={{ margin: 0 }}>Patient</div>
        <span className="badge t-green"><Icon.checkCircle size={14} /> Read in {readMs}ms</span>
      </div>

      {/* Critical-first: allergies + DNR (F8) */}
      {p.dnrFlag && (
        <div className="banner banner-danger" style={{ marginBottom: 8 }}>
          <span className="banner-icon"><Icon.alert size={22} /></span>
          <div><div className="banner-title" style={{ fontSize: 17 }}>DNR — DO NOT RESUSCITATE</div></div>
        </div>
      )}
      {p.allergies.length > 0 && (
        <div className="banner banner-danger">
          <span className="banner-icon"><Icon.drop size={22} /></span>
          <div>
            <div className="banner-title" style={{ fontSize: 17 }}>ALLERGIES</div>
            <div className="banner-body" style={{ fontSize: 15 }}>{p.allergies.join(" · ")}</div>
          </div>
        </div>
      )}

      {/* Identity */}
      <div className="hero" style={{ marginTop: 8 }}>
        <div className="hero-sheen" />
        <div className="display" style={{ fontSize: 28 }}>{p.name || "Unknown patient"}</div>
        <div className="row-flex" style={{ marginTop: 8 }}>
          <span className="badge t-coral"><Icon.drop size={14} /> Blood {p.bloodType || "—"}</span>
          <span className="caption">ID {p.patientId}</span>
        </div>
      </div>

      {/* Alert to contact (F12) */}
      {alert && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="row-flex">
            <span className="headline">Emergency contact alerted</span>
            <Icon.message size={20} color="var(--accent-green)" />
          </div>
          <div className="caption" style={{ margin: "6px 0" }}>
            {alert.contact.name} · {alert.contact.phone}
          </div>
          <div className="card-alt" style={{ fontSize: 13, lineHeight: 1.4 }}>{alert.body}</div>
          {alert.mapsUrl ? (
            <a className="btn btn-secondary btn-sm" style={{ marginTop: 10, width: "100%" }} href={alert.mapsUrl} target="_blank" rel="noreferrer">
              <Icon.map size={16} /> View GPS location
            </a>
          ) : (
            <div className="caption muted-2" style={{ marginTop: 8 }}>GPS unavailable — location permission denied.</div>
          )}
          <a className="btn btn-ghost btn-sm" style={{ marginTop: 6, width: "100%" }} href={smsDeepLink(alert.contact.phone, alert.body)}>
            <Icon.message size={16} /> Open SMS to send
          </a>
        </div>
      )}

      {/* Medications */}
      <div className="section-title"><h2>Current medications</h2></div>
      <div className="card">
        <div className="rows">
          {p.medications.map((m, i) => (
            <div key={i} className="row">
              <span className="row-icon t-purple"><Icon.pill size={20} /></span>
              <span className="row-main"><span className="row-title">{m.name}</span><span className="row-sub">{m.dose} · {m.frequency}</span></span>
            </div>
          ))}
          {p.medications.length === 0 && <div className="caption muted-2" style={{ padding: "6px 2px" }}>None on record</div>}
        </div>
      </div>

      {/* Treatment log */}
      <div className="section-title">
        <h2>Treatment log</h2>
        <button className="pill-cta" onClick={() => setLogSheet(true)}><Icon.plus size={16} /> Log</button>
      </div>
      <div className="card">
        <div className="rows">
          {p.treatmentLog.map((e, i) => (
            <div key={i} className="row">
              <span className="row-icon t-blue"><Icon.stethoscope size={20} /></span>
              <span className="row-main"><span className="row-title">{e.action}</span><span className="row-sub">{e.responderId}</span></span>
              <span className="row-right"><span className="row-time">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></span>
            </div>
          ))}
          {p.treatmentLog.length === 0 && <div className="caption muted-2" style={{ padding: "6px 2px" }}>No entries yet. Log a treatment to build the chain of custody.</div>}
        </div>
      </div>

      <div style={{ height: 16 }} />
      <button className="btn btn-secondary" onClick={() => { setPhase("idle"); setPatient(null); }}><Icon.arrowSwap size={18} /> Scan another tag</button>
      <div style={{ height: 20 }} />

      {logSheet && <LogSheet patient={p} responderId={RESPONDER_ID} onClose={() => setLogSheet(false)} onLog={onLogged} canWriteBack={CAN_WRITE_TAG} />}
    </div>
  );
}

// F9 + F10 — add a treatment entry with live conflict check.
function LogSheet({
  patient,
  responderId,
  onClose,
  onLog,
  canWriteBack,
}: {
  patient: PatientProfile;
  responderId: string;
  onClose: () => void;
  onLog: (e: LogEntry) => void;
  canWriteBack: boolean;
}) {
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [conflict, setConflict] = useState<ConflictResult | null>(null);

  const onDrugChange = (v: string) => {
    setDrug(v);
    setConflict(v.trim() ? checkConflict(patient, v) : null);
  };

  const submit = () => {
    const action = `Administered ${drug}${dose ? " " + dose : ""}`;
    onLog({ timestamp: Date.now(), responderId, action });
  };

  const blocked = conflict?.level === "danger";

  return (
    <Sheet open onClose={onClose} title="Log treatment">
      <div className="field"><label>Medication / action</label>
        <input className="input" value={drug} onChange={(e) => onDrugChange(e.target.value)} placeholder="e.g. Amoxicillin" autoFocus />
      </div>
      <div className="field"><label>Dose (optional)</label>
        <input className="input" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="500mg IV" />
      </div>

      {conflict && conflict.level === "danger" && (
        <Banner kind="danger" title={conflict.title}>{conflict.detail}</Banner>
      )}
      {conflict && conflict.level === "warning" && (
        <Banner kind="amber" title={conflict.title}>{conflict.detail}</Banner>
      )}
      {conflict && conflict.level === "ok" && drug.trim() && (
        <Banner kind="green" title={conflict.title}>{conflict.detail}</Banner>
      )}

      <div className="caption muted-2" style={{ margin: "4px 2px 12px" }}>
        Logged as {responderId} · auto-timestamped {canWriteBack ? "· written back to tag" : "· saved locally (iOS can't write back)"}
      </div>

      {blocked ? (
        <>
          <button className="btn btn-danger" onClick={submit}><Icon.alert size={18} /> Override &amp; log anyway</button>
          <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
        </>
      ) : (
        <button className="btn btn-primary" disabled={!drug.trim()} onClick={submit}><Icon.check size={18} /> Add to log</button>
      )}
    </Sheet>
  );
}
