"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminPatient, Registry } from "@/lib/server/admin-registry";
import { medSummary } from "@/lib/models";
import { cn } from "@/lib/utils";
import { IdPass } from "@/components/admin/id-pass";
import { fmtAgo, fmtDate, fmtDateTime } from "@/components/admin/format";

type StatusFilter = "All" | "Verified" | "Pending";

const BLOOD_ORDER = ["O+", "B+", "A+", "AB+", "O-", "B-", "A-", "AB-"] as const;

export function AdminDashboard({ data }: { data: Registry }) {
  const { patients, cohort, generatedAt } = data;
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [blood, setBlood] = useState("All");
  const [flagged, setFlagged] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const verified = patients.filter((p) => p.tag.status === "Verified").length;
    const reads = data.dailyScans.reduce((s, d) => s + d.count, 0);
    const active = patients.filter((p) => Date.parse(generatedAt) - Date.parse(p.lastSyncAt) < 7 * 86_400_000).length;
    const alerts = patients.filter((p) => p.allergies.length || p.conditions.length).length;
    return { verified, reads, active, alerts };
  }, [patients, data.dailyScans, generatedAt]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      if (division !== "All" && p.division !== division) return false;
      if (status !== "All" && p.tag.status !== status) return false;
      if (blood !== "All" && p.bloodType !== blood) return false;
      if (flagged && !p.allergies.length && !p.conditions.length) return false;
      if (!q) return true;
      return [p.name, p.prn, p.patientId, p.roll, p.tag.uid].some((v) => v.toLowerCase().includes(q));
    });
  }, [patients, query, division, status, blood, flagged]);

  const open = patients.find((p) => p.patientId === openId) ?? null;

  function exportCsv() {
    const head = ["Roll", "Patient ID", "Name", "PRN", "Division", "Blood", "Allergies", "Conditions", "Tag UID", "Tag status", "Verified", "Plan", "Last scan"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = rows.map((p) =>
      [p.roll, p.patientId, p.name, p.prn, p.division, p.bloodType, p.allergies.join("; "), p.conditions.join("; "), p.tag.uid, p.tag.status, p.tag.verifiedAt ?? "", p.plan, p.lastScanAt ?? ""]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patient-registry-${generatedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="shell pb-28 pt-12 md:pt-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-bone/50">
            {cohort.institution} · {cohort.department} · {cohort.year}
          </p>
          <h1 className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">Patient registry</h1>
        </div>
        <p className="label flex items-center gap-2 text-bone/60">
          <span className="h-2 w-2 rounded-full bg-signal" aria-hidden />
          Synced {fmtDateTime(generatedAt)} IST
        </p>
      </header>

      <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-bone/15 bg-bone/15 lg:grid-cols-4">
        <Stat label="Enrolled patients" value={patients.length} note={`${cohort.academicYear} cohort`} />
        <Stat
          label="Verified NFC tags"
          value={stats.verified}
          note={`${Math.round((stats.verified / patients.length) * 100)}% of enrolled`}
          accent
        />
        <Stat label="Tag reads, 30 days" value={stats.reads} note={`${stats.active} active on the app this week`} />
        <Stat label="Critical info on file" value={stats.alerts} note="Allergies or conditions" />
      </dl>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ScansChart days={data.dailyScans} />
        <BloodChart patients={patients} />
      </section>

      <section aria-labelledby="registry-title" className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="registry-title" className="display text-[clamp(2rem,4vw,3rem)]">
            All patients
          </h2>
          <button type="button" onClick={exportCsv} className="label text-bone/60 hover:text-lemon">
            Export CSV ↓
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, PRN, patient ID or tag UID"
            aria-label="Search patients"
            className="min-w-0 flex-1 basis-64 rounded-btn border border-bone/20 bg-black/15 px-4 py-3 text-[15px] text-bone outline-hidden placeholder:text-bone/35 focus:border-bone"
          />
          <Segmented label="Division" value={division} options={["All", "A", "B", "C"]} onChange={setDivision} />
          <Segmented label="Tag" value={status} options={["All", "Verified", "Pending"]} onChange={(v) => setStatus(v as StatusFilter)} />
          <select
            value={blood}
            onChange={(e) => setBlood(e.target.value)}
            aria-label="Blood group"
            className="rounded-btn border border-bone/20 bg-canvas px-3 py-3 font-mono text-[13px] text-bone"
          >
            <option value="All">All blood groups</option>
            {BLOOD_ORDER.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <label className="label flex cursor-pointer items-center gap-2 text-bone/70">
            <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} className="h-4 w-4 accent-[#FFE927]" />
            Critical only
          </label>
        </div>

        <p className="label mt-5 text-bone/45">
          {rows.length} of {patients.length} records
        </p>

        <div className="mt-3 overflow-x-auto rounded-[18px] border border-bone/15">
          <table className="w-full min-w-[980px] text-left text-[14px] [&_td]:whitespace-nowrap">
            <thead>
              <tr className="label border-b border-bone/15 text-[11px] text-bone/50">
                <th className="px-4 py-3 font-normal">Roll</th>
                <th className="px-4 py-3 font-normal">Patient</th>
                <th className="px-4 py-3 font-normal">Blood</th>
                <th className="px-4 py-3 font-normal">NFC tag UID</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Flags</th>
                <th className="px-4 py-3 font-normal">Last read</th>
                <th className="px-4 py-3 font-normal">Plan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.patientId}
                  onClick={() => setOpenId(p.patientId)}
                  className="cursor-pointer border-b border-bone/10 transition-colors last:border-0 hover:bg-bone/[0.04]"
                >
                  <td className="tnum px-4 py-3 font-mono text-[13px] text-bone/60">{p.roll}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(p.patientId);
                      }}
                      className="text-left hover:text-lemon"
                    >
                      <span className="block font-medium">{p.name}</span>
                      <span className="tnum font-mono text-[12px] text-bone/45">
                        {p.patientId} · PRN {p.prn}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono">{p.bloodType}</td>
                  <td className="tnum px-4 py-3 font-mono text-[13px] text-bone/80">{p.tag.uid}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.tag.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.allergies.length > 0 && <Flag tone="scarlet">Allergy</Flag>}
                      {p.conditions.length > 0 && <Flag tone="lemon">Condition</Flag>}
                      {p.organDonor && <Flag tone="line">Organ donor</Flag>}
                      {!p.allergies.length && !p.conditions.length && !p.organDonor && <span className="text-bone/30">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-bone/70">{p.lastScanAt ? fmtAgo(p.lastScanAt, generatedAt) : <span className="text-bone/30">Never</span>}</td>
                  <td className="px-4 py-3 text-bone/70">{p.plan}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-bone/50">
                    No patients match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="activity-title" className="mt-16">
        <h2 id="activity-title" className="display text-[clamp(2rem,4vw,3rem)]">
          Recent activity
        </h2>
        <ol className="mt-6 divide-y divide-bone/10 rounded-[18px] border border-bone/15">
          {data.activity.slice(0, 14).map((e, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3.5">
              <span className={cn("label w-16 shrink-0 text-[11px]", e.kind === "scan" ? "text-lemon" : e.kind === "verify" ? "text-signal" : "text-bone/50")}>
                {e.kind === "scan" ? "Read" : e.kind === "verify" ? "Verify" : "Update"}
              </span>
              <button type="button" onClick={() => setOpenId(e.patientId)} className="font-medium hover:text-lemon">
                {e.name}
              </button>
              <span className="min-w-0 flex-1 text-[14px] text-bone/60">{e.detail}</span>
              <span className="tnum font-mono text-[12px] text-bone/45">{fmtAgo(e.at, generatedAt)}</span>
            </li>
          ))}
        </ol>
      </section>

      {open && <PatientDrawer patient={open} now={generatedAt} cohort={cohort} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Stat({ label, value, note, accent }: { label: string; value: number; note: string; accent?: boolean }) {
  return (
    <div className="bg-canvas p-5 sm:p-7">
      <dt className="label text-bone/50">{label}</dt>
      <dd className={cn("display tnum mt-6 text-[clamp(3rem,6vw,4.75rem)] leading-none", accent && "text-lemon")}>{value}</dd>
      <dd className="mt-2 text-[13px] text-bone/50">{note}</dd>
    </div>
  );
}

function ScansChart({ days }: { days: Registry["dailyScans"] }) {
  const max = Math.max(...days.map((d) => d.count), 1);
  return (
    <figure className="rounded-[18px] border border-bone/15 p-6">
      <figcaption className="flex items-baseline justify-between">
        <span className="label text-bone/50">Tag reads per day</span>
        <span className="label text-bone/40">Last 30 days</span>
      </figcaption>
      <div className="mt-8 flex h-40 items-end gap-[3px]" role="img" aria-label="Bar chart of NFC tag reads per day over the last 30 days">
        {days.map((d, i) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div
              className={cn("w-full rounded-t-[3px] transition-colors", i === days.length - 1 ? "bg-lemon" : "bg-bone/25 group-hover:bg-bone/60")}
              style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
            />
            <span className="tnum pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-bone px-1.5 py-0.5 font-mono text-[11px] text-canvas group-hover:block">
              {d.count} · {fmtDate(d.day).replace(/ \d{4}$/, "")}
            </span>
          </div>
        ))}
      </div>
      <div className="label mt-3 flex justify-between text-[10px] text-bone/35">
        <span>{fmtDate(days[0]!.day)}</span>
        <span>Today</span>
      </div>
    </figure>
  );
}

function BloodChart({ patients }: { patients: AdminPatient[] }) {
  const counts = BLOOD_ORDER.map((b) => ({ b, n: patients.filter((p) => p.bloodType === b).length }));
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <figure className="rounded-[18px] border border-bone/15 p-6">
      <figcaption className="label text-bone/50">Blood groups on file</figcaption>
      <ul className="mt-6 space-y-2">
        {counts.map(({ b, n }) => (
          <li key={b} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-3">
            <span className="font-mono text-[13px]">{b}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-bone/10">
              <span className={cn("block h-full rounded-full", b.endsWith("-") ? "bg-scarlet" : "bg-bone/60")} style={{ width: `${(n / max) * 100}%` }} />
            </span>
            <span className="tnum text-right font-mono text-[13px] text-bone/60">{n}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function StatusBadge({ status }: { status: AdminPatient["tag"]["status"] }) {
  return (
    <span className={cn("label inline-flex items-center gap-1.5 text-[11px]", status === "Verified" ? "text-signal" : "text-lemon")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "Verified" ? "bg-signal" : "bg-lemon")} aria-hidden />
      {status}
    </span>
  );
}

function Flag({ tone, children }: { tone: "scarlet" | "lemon" | "line"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "label rounded-[5px] px-1.5 py-0.5 text-[10px]",
        tone === "scarlet" && "bg-scarlet text-bone",
        tone === "lemon" && "bg-lemon text-canvas",
        tone === "line" && "border border-bone/25 text-bone/70",
      )}
    >
      {children}
    </span>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-btn border border-bone/20">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={cn("px-3 py-3 font-mono text-[12px] uppercase tracking-wide transition-colors", value === o ? "bg-bone text-canvas" : "text-bone/60 hover:text-bone")}
        >
          {o === "All" ? `${label}: all` : o}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PatientDrawer({
  patient: p,
  now,
  cohort,
  onClose,
}: {
  patient: AdminPatient;
  now: string;
  cohort: Registry["cohort"];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <aside className="screen-in relative flex h-full w-full max-w-[640px] flex-col overflow-y-auto border-l border-bone/15 bg-canvas">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-bone/10 bg-canvas/95 px-6 py-4 backdrop-blur">
          <span className="tnum font-mono text-[13px] text-bone/60">
            {p.patientId} · {p.roll}
          </span>
          <button type="button" onClick={onClose} className="label text-bone/70 hover:text-lemon">
            Close ×
          </button>
        </div>

        <div className="px-6 pb-16 pt-8">
          <p className="label text-bone/50">
            {p.gender === "F" ? "Female" : "Male"} · {p.age} yrs · Div {p.division} / Batch {p.batch}
          </p>
          <h2 id="drawer-title" className="display mt-3 text-[clamp(2.5rem,7vw,4rem)]">
            {p.name}
          </h2>

          {(p.allergies.length > 0 || p.dnr) && (
            <div className="mt-6 rounded-[14px] bg-scarlet p-4">
              <p className="label text-bone/80">Allergies</p>
              <p className="mt-1 font-serif text-xl">{p.allergies.join(", ")}</p>
            </div>
          )}

          <Section title="Medical">
            <Row k="Blood group" v={p.bloodType} />
            <Row k="Conditions" v={p.conditions.join(", ") || "None declared"} />
            <Row k="Medications" v={p.medications.length ? p.medications.map(medSummary).join("\n") : "None"} />
            <Row k="DNR" v={p.dnr ? "Yes" : "No"} />
            <Row k="Blood donor" v={p.bloodDonor ? "Registered" : "No"} />
            <Row k="Organ donor" v={p.organDonor ? "Pledged" : "No"} />
          </Section>

          <Section title="NFC tag">
            <Row k="UID" v={p.tag.uid} mono />
            <Row k="Chip" v={`${p.tag.type} · ${p.tag.payloadBytes} / 504 bytes · AES-256-GCM`} />
            <Row k="Status" v={<StatusBadge status={p.tag.status} />} />
            <Row k="Written" v={fmtDateTime(p.tag.writtenAt)} />
            <Row k="Verified" v={p.tag.verifiedAt ? fmtDateTime(p.tag.verifiedAt) : "Awaiting first verify tap"} />
            <Row k="Reads, 30 days" v={String(p.scans30d)} />
            <Row k="Last read" v={p.lastScanAt ? `${fmtAgo(p.lastScanAt, now)} · ${p.lastScanBy}` : "Never"} />
          </Section>

          <Section title="Emergency contacts">
            {p.emergencyContacts.map((c) => (
              <Row key={c.name} k={c.relation} v={`${c.name}\n${c.phone}`} />
            ))}
          </Section>

          <Section title="Account">
            <Row k="PRN" v={p.prn} mono />
            <Row k="Date of birth" v={fmtDate(p.dob)} />
            <Row k="Enrolled" v={fmtDate(p.enrolledAt)} />
            <Row k="Plan" v={p.plan} />
            <Row k="Device" v={`${p.device} · app ${p.appVersion}`} />
            <Row k="Last sync" v={fmtAgo(p.lastSyncAt, now)} />
            <Row k="Profile" v={`${p.completeness}% complete`} />
          </Section>

          <Section title="Patient pass">
            <div className="pt-4">
              <IdPass
                band={p.allergies.length ? "Medical ID · Allergy alert" : "Medical ID"}
                bandClass={p.allergies.length ? "bg-scarlet text-bone" : "bg-cobalt text-bone"}
                name={p.name}
                subtitle={`${cohort.institution} · ${cohort.department}`}
                passId={p.patientId}
                fields={[
                  { label: "Blood", value: p.bloodType },
                  { label: "Roll", value: p.roll },
                  { label: "Tag UID", value: p.tag.uid },
                  { label: "Emergency", value: p.emergencyContacts[0]!.phone },
                ]}
                qr={`PT1:${p.patientId}:${p.tag.uid.replace(/:/g, "")}`}
              />
            </div>
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h3 className="label border-b border-bone/15 pb-2 text-bone/50">{title}</h3>
      <dl className="divide-y divide-bone/10">{children}</dl>
    </section>
  );
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-4 py-2.5 text-[14px]">
      <dt className="text-bone/50">{k}</dt>
      <dd className={cn("whitespace-pre-line", mono && "tnum font-mono text-[13px]")}>{v}</dd>
    </div>
  );
}
