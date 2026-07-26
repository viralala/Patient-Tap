/**
 * Service barrel — the single seam between the frontend and the backend team.
 *
 * Every backend touchpoint the UI uses is re-exported here. To wire the real
 * stack, replace the four files in `lib/services/` (crypto, nfc, alert, backend)
 * while keeping these exported signatures identical. No screen should change.
 */

export {
  encryptProfile,
  decryptProfile,
  appendLogEntry,
  estimateEncodedBytes,
  decryptOk,
  type DecryptResult,
} from "./crypto";

export {
  writeToTag,
  readFromTag,
  tagWriteErrorMessage,
  TAG_CAPACITY_BYTES,
  type TagWriteError,
  type TagWriteResult,
} from "./nfc";

export { sendAlert } from "./alert";

export {
  saveProfileBackup,
  getSubscriptionStatus,
  syncLogEntry,
  type SubscriptionTier,
} from "./backend";
