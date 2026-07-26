"use client";
// Client-side decryptor + renderer for a shared emergency card. Reads the
// decryption key (and, for demo links, the ciphertext) from the URL #fragment.
import React, { useEffect, useState } from "react";
import { decryptWithKeyB64 } from "@/lib/crypto";

type Status = "ok" | "expired" | "revoked" | "notfound";
type View = "loading" | "shown" | "error" | Status;

interface Card {
  id?: string;
  n?: string;
  bt?: string;
  a?: string[];
  m?: [string, string, string][];
  dnr?: number;
  c?: [string, string][];
  ts?: number;
}

export function ShareViewer({
  status,
  ciphertext,
}: {
  status: Status;
  ciphertext: string | null;
}) {
  const [view, setView] = useState<View>("loading");
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    if (status !== "ok") {
      setView(status);
      return;
    }
    (async () => {
      try {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const key = hash.get("k");
        const ct = ciphertext ?? hash.get("d");
        if (!key || !ct) {
          setView("error");
          return;
        }
        const json = await decryptWithKeyB64(ct, key);
        setCard(JSON.parse(json) as Card);
        setView("shown");
      } catch {
        setView("error");
      }
    })();
  }, [status, ciphertext]);

  const messages: Record<string, { title: string; body: string }> = {
    loading: { title: "Decrypting…", body: "Opening the encrypted emergency card." },
    error: { title: "Cannot open", body: "The decryption key is missing or the link is malformed." },
    expired: { title: "Link expired", body: "This share link has passed its expiry time." },
    revoked: { title: "Link revoked", body: "The owner has revoked this share link." },
    notfound: { title: "Not found", body: "No share link exists for this address." },
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.brandRow}>
          <span style={S.dot} />
          <span style={S.brand}>Patient-Tap</span>
          <span style={S.badge}>EMERGENCY CARD</span>
        </div>

        {view !== "shown" ? (
          <div style={S.state}>
            <h1 style={S.stateTitle}>{messages[view]?.title ?? "…"}</h1>
            <p style={S.stateBody}>{messages[view]?.body ?? ""}</p>
          </div>
        ) : (
          <>
            <div style={S.headline}>
              <div>
                <div style={S.name}>{card?.n || "Unknown patient"}</div>
                {card?.id && <div style={S.pid}>{card.id}</div>}
              </div>
              {card?.bt && (
                <div style={S.blood}>
                  <div style={S.bloodLabel}>BLOOD</div>
                  <div style={S.bloodType}>{card.bt}</div>
                </div>
              )}
            </div>

            {card?.dnr === 1 && <div style={S.dnr}>⚠ DNR — Do Not Resuscitate</div>}

            <Section label="Allergies" danger>
              {card?.a?.length ? (
                <div style={S.chips}>
                  {card.a.map((x, i) => (
                    <span key={i} style={S.chipDanger}>
                      {x}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={S.muted}>None recorded</span>
              )}
            </Section>

            <Section label="Medications">
              {card?.m?.length ? (
                <ul style={S.list}>
                  {card.m.map((row, i) => (
                    <li key={i} style={S.li}>
                      <b>{row[0]}</b>
                      {row[1] ? ` · ${row[1]}` : ""}
                      {row[2] ? ` · ${row[2]}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={S.muted}>None recorded</span>
              )}
            </Section>

            <Section label="Emergency contacts">
              {card?.c?.length ? (
                <ul style={S.list}>
                  {card.c.map((row, i) => (
                    <li key={i} style={S.li}>
                      <b>{row[0]}</b>
                      {row[1] && (
                        <>
                          {" — "}
                          <a href={`tel:${row[1].replace(/\s+/g, "")}`} style={S.tel}>
                            {row[1]}
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={S.muted}>None recorded</span>
              )}
            </Section>

            <p style={S.footer}>
              Decrypted in your browser · the server never saw the key
              {card?.ts ? ` · shared ${new Date(card.ts).toLocaleString()}` : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  danger,
  children,
}: {
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={S.section}>
      <div style={{ ...S.sectionLabel, color: danger ? "var(--accent-coral)" : "var(--text-secondary)" }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "radial-gradient(1200px 600px at 50% -10%, #17171b 0%, #050506 60%)",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    padding: "22px 20px 18px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 18 },
  dot: { width: 10, height: 10, borderRadius: 999, background: "var(--accent-coral)" },
  brand: { fontWeight: 700, fontSize: 15 },
  badge: {
    marginLeft: "auto",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 700,
    color: "var(--accent-coral)",
    border: "1px solid var(--accent-coral)",
    borderRadius: 999,
    padding: "4px 10px",
  },
  state: { padding: "40px 6px 30px", textAlign: "center" },
  stateTitle: { fontSize: 22, margin: "0 0 8px" },
  stateBody: { color: "var(--text-secondary)", fontSize: 14, margin: 0 },
  headline: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  name: { fontSize: 26, fontWeight: 700, letterSpacing: -0.4 },
  pid: { color: "var(--text-muted)", fontSize: 13, marginTop: 2, fontVariantNumeric: "tabular-nums" },
  blood: {
    textAlign: "center",
    background: "var(--surface-2)",
    borderRadius: 14,
    padding: "8px 12px",
    flexShrink: 0,
  },
  bloodLabel: { fontSize: 9, letterSpacing: 1, color: "var(--text-muted)", fontWeight: 700 },
  bloodType: { fontSize: 22, fontWeight: 800, color: "var(--accent-coral)" },
  dnr: {
    marginTop: 14,
    background: "rgba(255,98,89,0.12)",
    border: "1px solid var(--accent-coral)",
    color: "var(--accent-coral)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    fontSize: 14,
  },
  section: { marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chipDanger: {
    background: "rgba(255,98,89,0.14)",
    color: "var(--accent-coral)",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: 600,
  },
  list: { margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 },
  li: { fontSize: 14, lineHeight: 1.4 },
  tel: { color: "var(--accent-blue)", textDecoration: "none" },
  muted: { color: "var(--text-muted)", fontSize: 14 },
  footer: { marginTop: 18, color: "var(--text-muted)", fontSize: 11, textAlign: "center", lineHeight: 1.5 },
};
