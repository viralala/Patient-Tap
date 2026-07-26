# Claude Code Prompt — Patient-Tap Frontend Build (Flutter)

Paste everything below into Claude Code as your starting prompt.

---

## Context

I'm building **Patient-Tap**, a hackathon project: an edge-medical sovereignty system that stores a patient's critical medical record (allergies, medications, DNR flag, emergency contacts, treatment log) encrypted on an NFC wristband/card (NTAG215, 504 bytes). Any Android phone can read/write it with **zero network dependency**. When signal happens to be available, the app opportunistically alerts emergency contacts via SMS with GPS location.

**Team of 4.** I own the **frontend only**. Three teammates are separately building:
- Backend/Crypto: `encryptProfile()`, `decryptProfile()`, `appendLogEntry()` — protobuf schema + AES-256-GCM
- NFC/Hardware: `writeToTag(bytes)`, `readFromTag()` — tag read/write lifecycle
- Alerts/Demo: `sendAlert(contact, location)` — SMS + GPS, plus a Supabase (accounts/backup/sync) and Stripe (subscription tiers) layer

**Your job right now: build ONLY the frontend UI/UX in Flutter.** Do not implement real encryption, real NFC calls, real SMS, or real Supabase/Stripe logic. Instead, stub every backend touchpoint behind a clean interface with realistic mock/fake data, so my teammates can drop their real implementations in later without me having to rewrite any screens.

---

## Tech Stack

- **Framework:** Flutter (Dart), Jetpack-free — we chose Flutter specifically to avoid raw native Android/Gradle friction and to get hot reload for fast hackathon iteration.
- **State management:** Riverpod or Provider (pick one, keep it simple — this is a 24-36hr hackathon, not a scalable enterprise app).
- **Navigation:** `go_router` or straightforward `Navigator` — whichever is faster to wire up.
- **No native NFC/crypto/SMS packages need to be added yet.** Just define the Dart function signatures as stubs (see "Backend Integration Points" below) returning mock data after a short simulated delay (e.g. `Future.delayed`) so the UI feels real (loading states, success/error states) without any real hardware or crypto behind it.

---

## Design Direction (reference image attached separately — follow this style closely)

The reference is a clean, modern health-tracking app. Match this aesthetic:

- **Color palette:** White/off-white background, one strong accent blue (`#2F5FE0`-ish royal blue), black for primary text, soft gray for secondary text/labels. Avoid pure black backgrounds — keep it light and clinical, not "hacker dark mode."
- **Typography:** Big, bold, heavy-weight numbers for key stats (e.g. BPM, byte usage) — numbers should dominate visually, labels stay small and muted above/below them.
- **Cards:** Rounded corners (~20-24px radius), soft drop shadows, white cards floating on the off-white background, generous padding.
- **Onboarding screen:** Full-bleed centered hero illustration/icon, bold headline (2 lines), muted subtext below, page-indicator dots, single circular arrow button bottom-center to proceed. Use this pattern for our onboarding flow (explaining Patient-Tap's purpose before the role toggle).
- **Dashboard-style layout:** 2-column grid of stat cards below a top greeting/profile header, each card showing one data point big and bold with a small trend/status label underneath.
- **Detail screen pattern:** Back arrow + title header, one large "hero" stat card, then a chart/graph card below, then a row of summary stats (avg/min/max style) at the bottom, then a segmented control (Hourly/Daily/Weekly/Monthly-style) — reuse this exact pattern for our Treatment Log detail view.
- **Bottom nav:** Floating pill-style bottom bar with 3-4 circular icon buttons, one highlighted/active in blue, rest in dark gray/black.

---

## App Structure — Single App, Role Toggle (NOT two separate apps)

### 1. Onboarding Flow (3 screens, swipeable)
- Screen 1: "Your Medical Record, On You" — explain the zero-network wristband concept
- Screen 2: explain the chain-of-custody treatment log concept
- Screen 3: explain the opportunistic SMS alert concept
- End with a role choice: **"I'm a Patient"** vs **"I'm a Responder"** (this sets the initial mode; both are reachable via toggle afterward, not a permanent lock-in)

### 2. Patient Mode
- **Profile onboarding form:** name/patient ID, blood type (dropdown), allergies (chip/tag input, add/remove), medications (repeatable rows: name, dose, frequency), DNR flag (prominent toggle switch, red/warning styled), emergency contacts (name + phone, add up to 2-3)
- **"Write to Tag" screen:** big primary button "Write to Tag," simulated writing animation/spinner, then success or a mock error state ("Tag moved — try again" / "Tag full — trim entries"). Call the stub `writeToTag()` (see below).
- **Profile summary/dashboard:** card-grid view of the patient's own saved profile (blood type, allergies, DNR status, med count) styled like the reference dashboard screen — read-only, "this is what's on your tag."

### 3. Responder Mode
- **Scan screen:** big "Tap to Scan" state, simulated scanning animation, calls stub `readFromTag()`.
- **Decrypted profile display:** allergies and DNR flag MOST visually prominent (top of screen, larger card, warning-red accent if DNR is true or if allergy list is non-empty) — this is a life-safety UI, prioritize scanability over aesthetics here. Medications and blood type below in standard cards.
- **Add treatment log entry screen:** simple form (action taken — text field, e.g. "administered 10mg morphine IV"), timestamp auto-filled, responder ID field. "Save & Re-write Tag" button calls stub `appendLogEntry()` then stub `writeToTag()`.
- **Treatment log detail view:** reuse the "detail screen pattern" above — show the log as a timeline/list instead of a chart (adapt the chart card into a scrollable list of past entries with timestamp + responder ID + action), since chronological log entries don't fit a line-graph metaphor.
- **Alert-sent confirmation:** after a scan, show a small toast/banner "Emergency contact alerted" (calls stub `sendAlert()`) — non-blocking, don't make the responder wait on this.

### 4. Role Toggle
- Persistent, accessible switch (e.g. in a settings/profile icon in the top corner) to flip between Patient and Responder mode without restarting the app.

---

## Backend Integration Points — Stub These, Don't Implement

Create a `/lib/services/` folder with these files, each returning realistic fake data after a short delay so the UI can be built and tested end-to-end right now. Use clear `// TODO: replace with real implementation from [role] dev` comments on each.

```dart
// lib/services/crypto_service.dart
Future<Uint8List> encryptProfile(PatientProfile profile) async { ... }
Future<PatientProfile?> decryptProfile(Uint8List bytes) async { ... }
// returns null + a "tampered" flag to simulate the auth-tag-failure error state

Future<Uint8List> appendLogEntry(Uint8List existingBytes, LogEntry entry) async { ... }
```

```dart
// lib/services/nfc_service.dart
Future<bool> writeToTag(Uint8List bytes) async { ... }
// randomly simulate failure ~20% of the time to test error states

Future<Uint8List?> readFromTag() async { ... }
```

```dart
// lib/services/alert_service.dart
Future<void> sendAlert(Contact contact, Location location) async { ... }
```

```dart
// lib/services/backend_service.dart
// Stub Supabase-style calls: saveProfileBackup(), getSubscriptionStatus(), syncLogEntry()
// These can just return mock success — no real Supabase client needed yet
```

Also define the shared Dart data models now (`PatientProfile`, `MedEntry`, `ContactRef`, `LogEntry`) matching the protobuf schema in the project doc, so when Backend hands me real `encryptProfile`/`decryptProfile` functions, the data shapes already match and I don't need to refactor screens.

---

## What NOT to Build Right Now

- No real AES-256-GCM, no real protobuf serialization
- No real `nfc_manager` tag read/write calls
- No real SMS sending
- No real Supabase client or Stripe Checkout integration
- No Gradle/native Android config changes beyond what `flutter create` already sets up

---

## Deliverable

A running Flutter app (`flutter run`) with all screens above navigable, using mock data throughout, styled per the reference image, with clearly marked stub service files ready for my three teammates to drop real implementations into.

Ask me clarifying questions if any screen or flow above is ambiguous before you start generating code.
