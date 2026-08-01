import type { LogEntry, PatientProfile } from "@/lib/models";

/**
 * STUB cloud layer — web parallel of Flutter `backend_service.dart`.
 * (Supabase accounts/backup/sync + Stripe subscriptions.)
 *
 * TODO(alerts/demo): replace with the real implementation:
 *   - Supabase client for saveProfileBackup / syncLogEntry
 *   - Stripe subscription status for getSubscriptionStatus
 * All calls return mock success so online/synced UI states can be built now.
 */

const LATENCY = 450;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type SubscriptionTier = "Free" | "Pro" | "Clinic";

/** Back up the encrypted profile to the cloud (opportunistic). */
export async function saveProfileBackup(_profile: PatientProfile): Promise<boolean> {
  // TODO(alerts/demo): Supabase upsert of the encrypted blob.
  await sleep(LATENCY);
  return true;
}

/** Current subscription tier for the signed-in account. Mock: Pro. */
export async function getSubscriptionStatus(): Promise<SubscriptionTier> {
  // TODO(alerts/demo): Stripe subscription lookup.
  await sleep(LATENCY);
  return "Pro";
}

/** Push a single treatment-log entry to the cloud for multi-device sync. */
export async function syncLogEntry(
  _patientId: string,
  _entry: LogEntry,
): Promise<boolean> {
  // TODO(alerts/demo): Supabase insert into the append-only log table.
  await sleep(LATENCY);
  return true;
}
