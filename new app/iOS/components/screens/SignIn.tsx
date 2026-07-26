"use client";
import React, { useState } from "react";
import { Icon } from "../ui/Icons";
import { useApp } from "../AppContext";

// Google "G" mark (inline so it works offline / under CSP).
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.6C40.9 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function SignIn({ onResponder }: { onResponder: () => void }) {
  const { signIn, isLive, showToast } = useApp();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      await signIn();
      // Live: browser redirects to Google. Demo: session flips instantly.
    } catch (e) {
      showToast("Sign-in failed", <Icon.x size={16} />);
      setBusy(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={{ flex: 1 }} />

      <div style={{ textAlign: "center" }}>
        <div style={logo}>
          <Icon.heart size={34} color="#fff" />
        </div>
        <h1 style={title}>Patient-Tap</h1>
        <p style={tagline}>
          Your encrypted medical identity — on your device, ready for any responder.
        </p>
      </div>

      <div style={featureList}>
        <Feature icon={<Icon.lock size={16} />} text="End-to-end encrypted — we never see your data" />
        <Feature icon={<Icon.wifi size={16} />} text="Cloud backup & sync across your devices" />
        <Feature icon={<Icon.alert size={16} />} text="Emergency alerts to your contacts" />
      </div>

      <div style={{ flex: 1 }} />

      <button className="btn btn-secondary" onClick={go} disabled={busy} style={googleBtn}>
        <GoogleG />
        {busy ? "Connecting…" : "Continue with Google"}
      </button>

      {!isLive && (
        <p style={demoHint}>
          Demo mode — no backend keys yet, so this signs you in locally. Add credentials in
          <code style={code}>.env.local</code> to go live.
        </p>
      )}

      <button className="btn btn-ghost" onClick={onResponder} style={{ color: "var(--accent-blue)", marginTop: 6 }}>
        <Icon.stethoscope size={18} /> I&apos;m a responder — scan without signing in
      </button>

      <p style={legal}>
        By continuing you agree this is a demo build and not a substitute for professional medical care.
      </p>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={featureRow}>
      <span style={featureIcon}>{icon}</span>
      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{text}</span>
    </div>
  );
}

const wrap: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "20px 24px 26px",
  minHeight: 0,
};
const logo: React.CSSProperties = {
  width: 76,
  height: 76,
  borderRadius: 22,
  margin: "0 auto 16px",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #7c6cf0, #4a90e2)",
  boxShadow: "0 12px 30px rgba(124,108,240,0.4)",
};
const title: React.CSSProperties = { fontSize: 30, fontWeight: 800, margin: "0 0 8px", letterSpacing: -0.5 };
const tagline: React.CSSProperties = {
  fontSize: 15,
  color: "var(--text-secondary)",
  margin: "0 auto",
  maxWidth: 300,
  lineHeight: 1.5,
};
const featureList: React.CSSProperties = { marginTop: 28, display: "flex", flexDirection: "column", gap: 12 };
const featureRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const featureIcon: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  background: "var(--surface-alt)",
  display: "grid",
  placeItems: "center",
  color: "var(--accent-purple)",
  flexShrink: 0,
};
const googleBtn: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 };
const demoHint: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-muted)",
  textAlign: "center",
  marginTop: 10,
  lineHeight: 1.5,
};
const code: React.CSSProperties = {
  background: "var(--surface-2)",
  borderRadius: 6,
  padding: "1px 6px",
  margin: "0 4px",
  fontSize: 11,
};
const legal: React.CSSProperties = { fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 14, lineHeight: 1.5 };
