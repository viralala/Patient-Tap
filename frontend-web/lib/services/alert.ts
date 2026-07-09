import { geoPretty, type ContactRef, type GeoLocation } from "@/lib/models";

/**
 * STUB opportunistic-alert layer — web parallel of Flutter `alert_service.dart`.
 *
 * TODO(alerts/demo): replace with the real implementation:
 *   - detect connectivity; if online send SMS with a GPS deep-link
 *   - otherwise queue and retry when signal returns
 */

const LATENCY = 500;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Fire an SMS alert to `contact` with the patient's `location`.
 *
 * Non-blocking by design: the responder UI shows a toast and moves on; it never
 * waits on delivery. Mock just logs and resolves.
 */
export async function sendAlert(
  contact: ContactRef,
  location: GeoLocation,
): Promise<void> {
  // TODO(alerts/demo): real connectivity check + SMS gateway.
  await sleep(LATENCY);
  // eslint-disable-next-line no-console
  console.info(
    `[alert] (mock) SMS -> ${contact.name} <${contact.phone}> @ ${geoPretty(location)}`,
  );
}
