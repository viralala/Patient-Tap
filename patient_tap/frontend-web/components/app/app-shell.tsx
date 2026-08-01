"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, SquareUser, Pencil, Nfc, ScanLine, ClipboardPlus, ScrollText } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { RoleSwitch, type Role } from "@/components/app/ui/role-switch";
import { PillNav, type NavItem } from "@/components/app/ui/pill-nav";
import { Toaster } from "@/components/app/ui/toast";
import { PatientDashboard } from "@/components/app/patient/dashboard";
import { ProfileForm } from "@/components/app/patient/profile-form";
import { WriteToTag } from "@/components/app/patient/write-to-tag";
import { ResponderScan } from "@/components/app/responder/scan";
import { AddLogEntry } from "@/components/app/responder/add-log-entry";
import { TreatmentLog } from "@/components/app/responder/treatment-log";

const PATIENT_NAV: NavItem[] = [
  { key: "profile", label: "Profile", icon: SquareUser },
  { key: "edit", label: "Edit", icon: Pencil },
  { key: "write", label: "Write", icon: Nfc },
];
const RESPONDER_NAV: NavItem[] = [
  { key: "scan", label: "Scan", icon: ScanLine },
  { key: "record", label: "Record", icon: ClipboardPlus },
  { key: "log", label: "Log", icon: ScrollText },
];

export function AppShell({
  initialRole = "patient",
  initialScreen,
}: {
  initialRole?: Role;
  initialScreen?: string;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const [patientTab, setPatientTab] = useState(
    ["profile", "edit", "write"].includes(initialScreen ?? "") && initialRole === "patient"
      ? (initialScreen as string)
      : "profile",
  );
  const [responderTab, setResponderTab] = useState(
    ["scan", "record", "log"].includes(initialScreen ?? "") && initialRole === "responder"
      ? (initialScreen as string)
      : "scan",
  );

  const tab = role === "patient" ? patientTab : responderTab;

  return (
    <div className="relative min-h-[100dvh] w-full bg-paper">
      {/* ambient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(47,95,224,0.12),transparent_70%)]" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[460px] flex-col md:my-[4vh] md:h-[min(900px,92vh)] md:min-h-0 md:overflow-hidden md:rounded-[36px] md:border md:border-paper-line md:bg-paper md:card-shadow-lg">
        {/* header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-paper-line px-4 py-3">
          <Link
            href="/"
            data-cursor="home"
            className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-3 transition-colors hover:bg-paper-sunk"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-paper-sunk text-ink/60">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <LogoMark className="h-5 w-5" />
          </Link>
          <RoleSwitch role={role} onChange={setRole} />
        </header>

        {/* active surface */}
        <div className="relative flex-1 overflow-hidden">
          <div key={`${role}-${tab}`} className="screen-in h-full">
            {role === "patient" && patientTab === "profile" && (
              <PatientDashboard
                onEdit={() => setPatientTab("edit")}
                onWrite={() => setPatientTab("write")}
              />
            )}
            {role === "patient" && patientTab === "edit" && (
              <ProfileForm onSaved={() => setPatientTab("profile")} />
            )}
            {role === "patient" && patientTab === "write" && (
              <WriteToTag onDone={() => setPatientTab("profile")} />
            )}

            {role === "responder" && responderTab === "scan" && (
              <ResponderScan
                onAddLog={() => setResponderTab("record")}
                onViewLog={() => setResponderTab("log")}
              />
            )}
            {role === "responder" && responderTab === "record" && (
              <AddLogEntry
                onSaved={() => setResponderTab("log")}
                onGoScan={() => setResponderTab("scan")}
              />
            )}
            {role === "responder" && responderTab === "log" && (
              <TreatmentLog onGoScan={() => setResponderTab("scan")} />
            )}
          </div>

          <PillNav
            items={role === "patient" ? PATIENT_NAV : RESPONDER_NAV}
            active={tab}
            onChange={role === "patient" ? setPatientTab : setResponderTab}
          />
        </div>
      </div>

      <Toaster />
    </div>
  );
}
