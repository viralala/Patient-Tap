// Monoline outline icons — white stroke, 24px default (PRD §9.6).
import React from "react";

type P = { size?: number; className?: string; color?: string; strokeWidth?: number };

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

const S = ({ size = 24, className, color, strokeWidth, children }: P & { children: React.ReactNode }) => (
  <svg {...base(size)} strokeWidth={strokeWidth ?? 2} className={className} style={color ? { color } : undefined}>
    {children}
  </svg>
);

export const Icon = {
  search: (p: P) => (<S {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></S>),
  bell: (p: P) => (<S {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></S>),
  plus: (p: P) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>),
  chevronRight: (p: P) => (<S {...p}><path d="m9 6 6 6-6 6" /></S>),
  chevronLeft: (p: P) => (<S {...p}><path d="m15 6-6 6 6 6" /></S>),
  home: (p: P) => (<S {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></S>),
  pill: (p: P) => (<S {...p}><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(45 12 12)" /><path d="m8.5 8.5 7 7" /></S>),
  nfc: (p: P) => (<S {...p}><path d="M4 8a12 12 0 0 1 0 8" /><path d="M8 6a18 18 0 0 1 0 12" /><path d="M20 8a12 12 0 0 0 0 8" /><path d="M16 6a18 18 0 0 0 0 12" /></S>),
  stethoscope: (p: P) => (<S {...p}><path d="M4 3v5a5 5 0 0 0 10 0V3" /><path d="M9 18a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="13" r="2" /></S>),
  settings: (p: P) => (<S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></S>),
  shield: (p: P) => (<S {...p}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" /></S>),
  alert: (p: P) => (<S {...p}><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 18h.01" /></S>),
  check: (p: P) => (<S {...p}><path d="M20 6 9 17l-5-5" /></S>),
  checkCircle: (p: P) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-4.8" /></S>),
  x: (p: P) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>),
  camera: (p: P) => (<S {...p}><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></S>),
  contact: (p: P) => (<S {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></S>),
  drop: (p: P) => (<S {...p}><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z" /></S>),
  clock: (p: P) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>),
  lock: (p: P) => (<S {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></S>),
  fingerprint: (p: P) => (<S {...p}><path d="M12 10a2 2 0 0 1 2 2c0 3-1 5-1 5" /><path d="M8.5 8.2A5 5 0 0 1 17 12c0 1 0 2-.3 3" /><path d="M6 12a6 6 0 0 1 1.4-3.9" /><path d="M9 20c-.7-1-1-2.5-1-4a4 4 0 0 1 4-4" /></S>),
  edit: (p: P) => (<S {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m14 6 4 4" /></S>),
  trash: (p: P) => (<S {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></S>),
  doc: (p: P) => (<S {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></S>),
  heart: (p: P) => (<S {...p}><path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-2 4.5-9 9-9 9z" /></S>),
  map: (p: P) => (<S {...p}><path d="M12 21s6-5.7 6-10a6 6 0 0 0-12 0c0 4.3 6 10 6 10z" /><circle cx="12" cy="11" r="2.2" /></S>),
  phone: (p: P) => (<S {...p}><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></S>),
  message: (p: P) => (<S {...p}><path d="M4 5h16v11H8l-4 4z" /></S>),
  scan: (p: P) => (<S {...p}><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3M4 12h16" /></S>),
  arrowSwap: (p: P) => (<S {...p}><path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" /></S>),
  wifi: (p: P) => (<S {...p}><path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" /><path d="M12 19h.01" /></S>),
  info: (p: P) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></S>),
  eye: (p: P) => (<S {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></S>),
  key: (p: P) => (<S {...p}><circle cx="8" cy="8" r="4" /><path d="m11 11 8 8M16 16l2-2M14 18l2-2" /></S>),
  sparkle: (p: P) => (<S {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></S>),
};

export type IconName = keyof typeof Icon;
