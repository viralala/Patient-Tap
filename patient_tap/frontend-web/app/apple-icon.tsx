import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#2F5FE0",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
          <rect x="7" y="9" width="11" height="14" rx="2.4" fill="#fff" />
          <line x1="9.4" y1="12.4" x2="15.6" y2="12.4" stroke="#2F5FE0" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="9.4" y1="15.4" x2="14" y2="15.4" stroke="#8FA6F6" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="9.4" y1="18.4" x2="15" y2="18.4" stroke="#8FA6F6" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M21 11.5a6 6 0 0 1 0 9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M23.6 9.4a9.4 9.4 0 0 1 0 13.2" stroke="#ffffffb3" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
