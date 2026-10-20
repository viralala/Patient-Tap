import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = "Patient-Tap: an encrypted medical ID on your wrist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same print palette as the site: soft black, bone text, one cobalt block.
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
          padding: "64px 72px",
          background: "#191919",
          color: "#FBF8F3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 2 }}>
          <span style={{ fontWeight: 800 }}>PATIENT-TAP</span>
          <span style={{ opacity: 0.6 }}>NFC MEDICAL ID</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 116,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: -4,
            textTransform: "uppercase",
          }}
        >
          <span>Medical ID</span>
          <span>on your wrist</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#1E4BD7",
            borderRadius: 18,
            padding: "26px 32px",
            fontSize: 26,
          }}
        >
          <span>Encrypted with AES-256-GCM. Read with no signal.</span>
          <span style={{ opacity: 0.75 }}>{new URL(site.url).host}</span>
        </div>
      </div>
    ),
    size,
  );
}
