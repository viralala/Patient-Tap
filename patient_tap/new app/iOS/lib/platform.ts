// Single source of truth for platform-specific behaviour + copy.
// The android/ app ships an identical file with PLATFORM = "android".
export type Platform = "ios" | "android";
export const PLATFORM = "ios" as Platform;

export const IS_IOS = PLATFORM === "ios";
export const IS_ANDROID = PLATFORM === "android";

// Per PRD §7: iOS is read-only (NDEF fallback) and cannot write to the tag.
// Android is the full read/write platform. We honour that distinction in the UI.
export const CAN_WRITE_TAG = IS_ANDROID;

export const PLATFORM_LABEL = IS_IOS ? "iOS" : "Android";
