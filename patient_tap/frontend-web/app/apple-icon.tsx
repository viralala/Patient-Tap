import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as app/icon.svg: a dot and two contactless waves on soft black.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#191919",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
          <circle cx="10.6" cy="16" r="2.5" fill="#FBF8F3" />
          <path d="M15.6 10.6a7.6 7.6 0 0 1 0 10.8" stroke="#FBF8F3" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M20.3 6.9a12.8 12.8 0 0 1 0 18.2" stroke="#FBF8F3" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
