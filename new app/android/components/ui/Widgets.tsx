"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { IS_IOS } from "@/lib/platform";

export function StatusBar() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const t = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "")
      );
    t();
    const id = setInterval(t, 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="statusbar">
      {IS_IOS ? <div className="notch" /> : <div className="punch" />}
      <span>{time}</span>
      <div className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="8" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <Icon.wifi size={15} />
        <svg width="24" height="13" viewBox="0 0 26 13" fill="none" stroke="currentColor"><rect x="1" y="1" width="21" height="11" rx="3"/><rect x="3" y="3" width="15" height="7" rx="1.5" fill="currentColor"/><rect x="23.5" y="4.5" width="1.5" height="4" rx="1" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

export function NavHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  // Material top app bar: back arrow, left-aligned title, trailing action.
  return (
    <div className="navbar">
      <button className="nav-back" onClick={onBack} aria-label="Back">
        <Icon.chevronLeft size={24} />
      </button>
      <span className="nav-title">{title}</span>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`switch ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="knob" />
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

type BannerKind = "danger" | "amber" | "green" | "blue";
export function Banner({
  kind,
  title,
  children,
  icon,
}: {
  kind: BannerKind;
  title: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const def: Record<BannerKind, React.ReactNode> = {
    danger: <Icon.alert size={20} />,
    amber: <Icon.clock size={20} />,
    green: <Icon.checkCircle size={20} />,
    blue: <Icon.info size={20} />,
  };
  return (
    <div className={`banner banner-${kind}`}>
      <span className="banner-icon">{icon ?? def[kind]}</span>
      <div>
        <div className="banner-title">{title}</div>
        {children && <div className="banner-body">{children}</div>}
      </div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        {title && (
          <div className="row-flex" style={{ marginBottom: 12 }}>
            <h2 className="headline">{title}</h2>
            <button className="icon-btn" onClick={onClose}>
              <Icon.x size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function BudgetMeter({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, (used / limit) * 100);
  const over = used > limit;
  const color = over ? "var(--accent-coral)" : pct > 80 ? "var(--accent-amber)" : "var(--accent-green)";
  return (
    <div className="meter">
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      <div className="meter-labels">
        <span className="muted">{used} bytes encrypted</span>
        <span style={{ color, fontWeight: 700 }}>
          {over ? `${used - limit} over` : `${limit - used} left`} / {limit}
        </span>
      </div>
    </div>
  );
}

/** SVG adherence donut ring in the reference-image style. */
export function Ring({
  segments,
  size = 200,
  stroke = 20,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const gap = 0.04 * c; // small gap between arcs
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${Math.max(0, len - gap)} ${c}`;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="ring-center">
        {centerLabel && <div className="caption">{centerLabel}</div>}
        {centerValue && <div className="display" style={{ fontSize: 34 }}>{centerValue}</div>}
      </div>
    </div>
  );
}

export function Toast({ msg, icon }: { msg: string; icon?: React.ReactNode }) {
  return (
    <div className="toast-wrap">
      <div className="toast">
        {icon}
        {msg}
      </div>
    </div>
  );
}
