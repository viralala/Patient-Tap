import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import type { Role } from "@/components/app/ui/role-switch";

export const metadata: Metadata = {
  title: "Patient-Tap — app",
  description: "Patient and responder demo surfaces for Patient-Tap.",
};

/**
 * `/app` entry. Supports deep-links used for demos/screenshots:
 *   ?role=patient|responder
 *   ?screen=profile|edit|write | scan|record|log
 *   ?screen=patient|responder|log   (legacy shortcuts)
 */
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const roleParam = typeof sp.role === "string" ? sp.role : "";
  const screenParam = typeof sp.screen === "string" ? sp.screen : "";

  let role: Role = roleParam === "responder" ? "responder" : "patient";
  let screen = screenParam;

  // Legacy shortcuts from the Flutter deep-link scheme.
  if (screenParam === "patient") {
    role = "patient";
    screen = "profile";
  } else if (screenParam === "responder") {
    role = "responder";
    screen = "scan";
  } else if (screenParam === "log") {
    role = "responder";
    screen = "log";
  }

  return <AppShell initialRole={role} initialScreen={screen} />;
}
