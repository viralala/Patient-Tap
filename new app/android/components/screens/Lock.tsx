"use client";
import React, { useState } from "react";
import { Icon } from "../ui/Icons";
import { useApp } from "../AppContext";
import { hashPin, newSalt } from "@/lib/crypto";
import { loadAuth, saveAuth, hasPin } from "@/lib/store";

// F0 — local lock screen. "It's a lock screen, not a login system." (PRD §6.1)
export function Lock({ footer }: { footer?: React.ReactNode }) {
  const { setUnlocked, showToast } = useApp();
  const existing = typeof window !== "undefined" ? hasPin() : false;
  const [stage, setStage] = useState<"enter" | "create" | "confirm">(existing ? "enter" : "create");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [err, setErr] = useState(false);

  const title =
    stage === "enter" ? "Enter your PIN" : stage === "create" ? "Create a PIN" : "Confirm your PIN";
  const sub =
    stage === "enter"
      ? "Unlock Patient Mode to view or edit your medical profile."
      : stage === "create"
      ? "4–6 digits. This stays on your device — it only stops others editing your profile."
      : "Re-enter the same PIN.";

  const press = async (d: string) => {
    setErr(false);
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    if (stage === "enter" && next.length >= 4) {
      // Auto-confirm: silently try the hash from 4 digits on, so a 4-digit PIN
      // unlocks the moment it's complete — no submit button needed.
      const rec = loadAuth();
      if (rec) {
        const hash = await hashPin(next, rec.salt);
        if (hash === rec.hash) {
          setUnlocked(true);
          return;
        }
      }
      if (next.length === 6) {
        setErr(true);
        setPin("");
      }
    } else if (next.length === 6) {
      await submit(next);
    }
  };

  const submit = async (value: string) => {
    if (value.length < 4) {
      setErr(true);
      setPin("");
      return;
    }
    if (stage === "create") {
      setFirstPin(value);
      setPin("");
      setStage("confirm");
      return;
    }
    if (stage === "confirm") {
      if (value !== firstPin) {
        setErr(true);
        setPin("");
        showToast("PINs did not match", <Icon.x size={16} />);
        setStage("create");
        return;
      }
      const salt = newSalt();
      const hash = await hashPin(value, salt);
      saveAuth({ salt, hash });
      setUnlocked(true);
      return;
    }
    // enter
    const rec = loadAuth();
    if (!rec) {
      setStage("create");
      setPin("");
      return;
    }
    const hash = await hashPin(value, rec.salt);
    if (hash === rec.hash) {
      setUnlocked(true);
    } else {
      setErr(true);
      setPin("");
    }
  };

  const del = () => {
    setErr(false);
    setPin((p) => p.slice(0, -1));
  };

  const biometric = () => {
    // Simulated Face ID / fingerprint secondary method (F0.1).
    showToast("Biometric verified", <Icon.fingerprint size={16} />);
    setTimeout(() => setUnlocked(true), 400);
  };

  const maxDots = 6;
  return (
    <div className="lock fade-in">
      <div className="lock-glyph">
        <Icon.shield size={34} color="var(--accent-purple)" />
      </div>
      <div className="headline" style={{ marginBottom: 6 }}>Patient-Tap</div>
      <div className="caption" style={{ maxWidth: 260, marginBottom: 4 }}>{title}</div>
      <div className="caption muted-2" style={{ maxWidth: 280 }}>{sub}</div>

      <div className={`pin-dots ${err ? "err" : ""}`}>
        {Array.from({ length: maxDots }).map((_, i) => (
          <span key={i} className={`dot ${i < pin.length ? "filled" : ""}`} />
        ))}
      </div>

      <div className="keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)}>{d}</button>
        ))}
        {stage === "enter" && existing ? (
          <button className="fn" onClick={biometric}><Icon.fingerprint size={26} /></button>
        ) : (
          <button className="fn" onClick={() => submit(pin)}>OK</button>
        )}
        <button onClick={() => press("0")}>0</button>
        <button className="fn" onClick={del}><Icon.chevronLeft size={22} /></button>
      </div>

      {(stage === "create" || stage === "confirm") && pin.length >= 4 && (
        <button className="btn btn-primary" style={{ maxWidth: 236, marginTop: 18 }} onClick={() => submit(pin)}>
          Continue
        </button>
      )}

      {footer && <div className="lock-footer">{footer}</div>}
    </div>
  );
}
