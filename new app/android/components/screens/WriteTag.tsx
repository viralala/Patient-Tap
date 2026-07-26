"use client";
import React, { useMemo, useState } from "react";
import { Icon } from "../ui/Icons";
import { NavHeader, Banner, BudgetMeter, Switch } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { ALL_SELECTED, WriteSelection, WRITE_CATEGORY_META } from "@/lib/types";
import { estimateWriteSize, serializeForWrite, TAG_LIMIT_BYTES } from "@/lib/store";
import { writeToTag, TagError, webNfcAvailable } from "@/lib/tag";
import { CAN_WRITE_TAG } from "@/lib/platform";

type Phase = "select" | "tapping" | "done" | "error";

// F4 — selective write. User picks categories; live budget vs 504 bytes (F4.4).
export function WriteTag() {
  const { profile, setRoute, showToast } = useApp();
  const [sel, setSel] = useState<WriteSelection>({ ...ALL_SELECTED });
  const [phase, setPhase] = useState<Phase>("select");
  const [errMsg, setErrMsg] = useState("");

  const size = useMemo(() => estimateWriteSize(profile, sel), [profile, sel]);
  const over = size > TAG_LIMIT_BYTES;
  const anySelected = Object.values(sel).some(Boolean);

  const toggle = (k: keyof WriteSelection) => setSel((s) => ({ ...s, [k]: !s[k] }));

  const count = (k: keyof WriteSelection): string => {
    switch (k) {
      case "allergies": return `${profile.allergies.length}`;
      case "medications": return `${profile.medications.length}`;
      case "contacts": return `${profile.emergencyContacts.length}`;
      case "log": return `${profile.treatmentLog.length}`;
      case "dnr": return profile.dnrFlag ? "On" : "Off";
      default: return "";
    }
  };

  const doWrite = async () => {
    setPhase("tapping");
    try {
      const payload = serializeForWrite(profile, sel);
      // small delay to show the "hold near tag" state
      await new Promise((r) => setTimeout(r, 1100));
      await writeToTag(payload);
      setPhase("done");
      showToast("Tag written", <Icon.check size={16} color="var(--accent-green)" />);
    } catch (e) {
      const msg = e instanceof TagError ? e.message : "Write failed. Try again.";
      setErrMsg(msg);
      setPhase("error");
    }
  };

  if (phase === "tapping") {
    return (
      <TapOverlay title="Hold near the tag" sub="Keep your device steady over the wristband…" />
    );
  }

  if (phase === "done") {
    return (
      <>
        <NavHeader title="Write to tag" onBack={() => setRoute(null)} />
        <div className="screen center" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: 60 }}>
          <div className="lock-glyph t-green" style={{ width: 88, height: 88 }}><Icon.checkCircle size={44} /></div>
          <div className="display" style={{ fontSize: 26, marginTop: 18 }}>Tag written</div>
          <div className="caption" style={{ maxWidth: 260, marginTop: 8 }}>
            {size} encrypted bytes stored on the tag. Re-scan in Responder mode to verify.
          </div>
          <div style={{ height: 24 }} />
          <button className="btn btn-primary" onClick={() => setRoute(null)}>Done</button>
        </div>
      </>
    );
  }

  if (phase === "error") {
    return (
      <>
        <NavHeader title="Write to tag" onBack={() => setPhase("select")} />
        <div className="screen">
          <Banner kind="danger" title="Write problem">{errMsg}</Banner>
          <button className="btn btn-primary" onClick={doWrite}>Retry</button>
          <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setPhase("select")}>Change selection</button>
        </div>
      </>
    );
  }

  return (
    <>
      <NavHeader title="Write to tag" onBack={() => setRoute(null)} />
      <div className="screen" style={{ paddingTop: 8 }}>
        {!CAN_WRITE_TAG && (
          <Banner kind="blue" title="iOS is read-only" icon={<Icon.info size={20} />}>
            Per spec, iPhones read tags via NDEF but can't write. You can still plan the payload
            here; use the Android app to write, or simulate below for the demo.
          </Banner>
        )}

        <div className="card">
          <div className="row-flex" style={{ marginBottom: 6 }}>
            <span className="headline">Payload budget</span>
            <span className="badge t-blue"><Icon.nfc size={14} /> NTAG215</span>
          </div>
          <BudgetMeter used={size} limit={TAG_LIMIT_BYTES} />
          {over && (
            <div style={{ marginTop: 10 }}>
              <Banner kind="danger" title="Over the 504-byte limit">
                Deselect lower-priority categories (e.g. older treatment log entries) to fit.
              </Banner>
            </div>
          )}
        </div>

        <div className="section-title"><h2>Choose what to store</h2></div>
        <div className="card">
          <div className="rows">
            {WRITE_CATEGORY_META.map((m) => {
              const critical = m.key === "allergies" || m.key === "dnr";
              return (
                <div key={m.key} className="row">
                  <span className={`row-icon ${critical ? "t-coral" : "t-purple"}`}>
                    {iconFor(m.key)}
                  </span>
                  <span className="row-main">
                    <span className="row-title">{m.label}</span>
                    <span className="row-sub">
                      {count(m.key as keyof WriteSelection) && (
                        <span className="mono">{count(m.key as keyof WriteSelection)} · </span>
                      )}
                      {m.hint}
                    </span>
                  </span>
                  <Switch on={sel[m.key as keyof WriteSelection]} onChange={() => toggle(m.key as keyof WriteSelection)} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 18 }} />
        {CAN_WRITE_TAG ? (
          <button className="btn btn-primary" disabled={over || !anySelected} onClick={doWrite}>
            <Icon.nfc size={20} /> Write <span className="mono">{size} B</span> to tag
          </button>
        ) : (
          <>
            <button className="btn btn-secondary" disabled title="Writing requires Android">
              <Icon.lock size={18} /> Writing unavailable on iOS
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} disabled={over || !anySelected} onClick={doWrite}>
              Simulate write (demo)
            </button>
          </>
        )}
        {webNfcAvailable() && <div className="caption center muted-2" style={{ marginTop: 10 }}>Web NFC detected — a real tap will be attempted.</div>}
        <div style={{ height: 20 }} />
      </div>
    </>
  );
}

function iconFor(key: string) {
  switch (key) {
    case "basic": return <Icon.contact size={20} />;
    case "allergies": return <Icon.drop size={20} />;
    case "medications": return <Icon.pill size={20} />;
    case "dnr": return <Icon.alert size={20} />;
    case "contacts": return <Icon.phone size={20} />;
    case "log": return <Icon.clock size={20} />;
    default: return <Icon.info size={20} />;
  }
}

export function TapOverlay({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="screen center" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="nfc-ripple">
        <Icon.nfc size={56} color="var(--accent-purple)" />
      </div>
      <div className="display" style={{ fontSize: 24, marginTop: 30 }}>{title}</div>
      <div className="caption" style={{ maxWidth: 240, marginTop: 8 }}>{sub}</div>
    </div>
  );
}
