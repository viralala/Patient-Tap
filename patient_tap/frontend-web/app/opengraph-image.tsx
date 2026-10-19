import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = "Patient-Tap — your medical record, sealed. Read in one tap.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0a0b",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* holographic glow */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 900,
            height: 900,
            display: "flex",
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 30% 40%, rgba(59,109,255,0.55), transparent 55%), radial-gradient(circle at 60% 30%, rgba(155,92,255,0.5), transparent 55%), radial-gradient(circle at 55% 65%, rgba(255,92,196,0.38), transparent 55%), radial-gradient(circle at 80% 45%, rgba(55,224,240,0.35), transparent 55%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#2F5FE0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
              <rect x="7" y="9" width="11" height="14" rx="2.4" fill="#fff" />
              <path d="M21 11.5a6 6 0 0 1 0 9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M23.6 9.4a9.4 9.4 0 0 1 0 13.2" stroke="#ffffffb3" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>Patient·Tap</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: -3,
              textTransform: "uppercase",
            }}
          >
            <span>Your record, sealed.</span>
            <span>Read in one tap.</span>
          </div>
          <span style={{ fontSize: 30, color: "rgba(255,255,255,0.62)", maxWidth: 900 }}>
            Encrypted NFC medical ID · offline in under 2 seconds · MedVerify fake-medicine check
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "rgba(255,255,255,0.55)" }}>
          {["AES-256-GCM", "Zero network", "Built for " + site.event].map((t) => (
            <span
              key={t}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
