# Patient-Tap — Frontend (Flutter)

Edge-medical sovereignty: a patient's critical record (allergies, medications,
DNR flag, emergency contacts, treatment log) lives **encrypted on an NFC
wristband/card (NTAG215, 504 bytes)** and is readable/writable by any phone with
**zero network dependency**. When signal is available, the app opportunistically
SMS-alerts emergency contacts with GPS.

This repo is the **frontend UI/UX only**. Every backend touchpoint (crypto, NFC,
SMS, cloud) is **stubbed behind a clean interface** returning realistic mock data
after a short delay, so the three backend teammates can drop real implementations
in without any screen rewrites.

---

## Running it

✅ **Verified:** `flutter analyze` reports *no issues* and `flutter build web`
succeeds on **Flutter 3.44.5 / Dart 3.12.2**. The `android/` and `web/` platform
folders are already scaffolded and included.

On this machine the Flutter SDK is installed at **`D:\flutter`** but is **not on
PATH**. Either add `D:\flutter\bin` to PATH, or prefix commands with it:

```powershell
$env:Path = "D:\flutter\bin;$env:Path"   # once per terminal session

cd patient_tap
flutter pub get
flutter run -d chrome        # web — no NFC phone needed, everything is mocked
# or: flutter run             # pick an attached Android device / emulator
```

Because all hardware/crypto is mocked, **the app runs fully in a browser or on a
desktop** — you don't need a physical NFC phone to demo the flows. To add iOS /
desktop targets later: `flutter create --platforms=ios,windows,macos .`

---

## What's implemented

**Single app, role toggle** (not two apps). A persistent Patient ⇄ Responder
switch lives in the header on every shell screen.

- **Onboarding** — 3 swipeable intro screens (wristband concept, chain-of-custody
  log, opportunistic SMS) → role choice (`I'm a Patient` / `I'm a Responder`).
- **Patient mode** (bottom nav: Profile · Edit · Write) — **pre-seeded with a
  demo patient** ("Alex Harmozi") so the dashboard is populated on first launch.
  Disable via `PatientController(seedDemo: false)` in `lib/app.dart`.
  - Profile form: name/ID, blood type dropdown, allergies chip input,
    repeatable medication rows, prominent red **DNR** toggle, up to 3 emergency
    contacts.
  - **Write to Tag**: big button → simulated encrypt + write animation → success
    or mock error (`Tag moved`, `Tag full`).
  - Dashboard: read-only "what's on your tag" stat grid + tag byte-usage meter.
- **Responder mode** (bottom nav: Scan · Record · Log)
  - **Scan**: tap-to-scan → simulated read/decrypt → auto-opens the record.
  - **Decrypted record**: allergies + DNR are the most prominent, warning-red
    elements (life-safety UI); meds/blood type below.
  - **Add log entry**: action + auto timestamp + responder ID →
    `Save & Re-write Tag` (append → re-write → cloud sync).
  - **Treatment log**: reuses the reference "detail screen" pattern — hero stat
    card, a timeline (the chart adapted to a scrollable list), summary stats,
    and an `All / Today / This Week` segmented control.
  - Non-blocking **"contact alerted"** toast fires after a scan.

---

## Project structure

```
lib/
  main.dart                 App entry
  app.dart                  Providers + role-based root surface
  theme/                    Colors + ThemeData + style tokens
  models/                   PatientProfile, MedEntry, ContactRef, LogEntry,
                            BloodType, GeoLocation  (protobuf-shaped)
  services/                 ── STUBS: swap these out ──
    crypto_service.dart       encryptProfile / decryptProfile / appendLogEntry
    nfc_service.dart          writeToTag (~20% mock failure) / readFromTag
    alert_service.dart        sendAlert
    backend_service.dart      saveProfileBackup / getSubscriptionStatus / syncLogEntry
    mock_data.dart            sample patient + demo GPS
  state/                    AppState (role), PatientController, ResponderController
  widgets/                  StatCard, PrimaryButton, FloatingBottomNav, ChipInput,
                            DnrBadge, SegmentedControl, PulsingRing, RoleSwitch, …
  screens/
    onboarding/             onboarding + role choice
    patient/                shell, dashboard, profile form, write-to-tag
    responder/              shell, scan, decrypted record, add-log, treatment log
```

**State management:** `provider` (ChangeNotifier) — kept intentionally simple.
**Navigation:** MaterialApp `home` swaps shells on role toggle; `Navigator.push`
for detail screens (e.g. Add Log Entry). No `go_router` needed.

---

## For the backend teammates — integration points

All stubs live in `lib/services/` and are marked with
`// TODO: replace with real implementation from [role] dev`. Keep the signatures
and the app's screens won't change.

```dart
// crypto_service.dart  (Backend/Crypto)
Future<Uint8List>      encryptProfile(PatientProfile profile);
Future<DecryptResult>  decryptProfile(Uint8List bytes);   // .profile + .tampered
Future<Uint8List>      appendLogEntry(Uint8List existingBytes, LogEntry entry);

// nfc_service.dart  (NFC/Hardware)
Future<TagWriteResult> writeToTag(Uint8List bytes);       // .ok + .error
Future<Uint8List?>     readFromTag();                     // null = no tag

// alert_service.dart  (Alerts/Demo)
Future<void> sendAlert(ContactRef contact, GeoLocation location);

// backend_service.dart  (Alerts/Demo — Supabase + Stripe)
Future<bool>             saveProfileBackup(PatientProfile profile);
Future<SubscriptionTier> getSubscriptionStatus();
Future<bool>             syncLogEntry(String patientId, LogEntry entry);
```

> **Note on `decryptProfile`:** the brief specified `Future<PatientProfile?>`
> "returns null + a tampered flag". That's implemented as a small
> `DecryptResult { profile, tampered }` so the responder UI can distinguish
> "no data" from "auth-tag failure / tampered". If you'd rather return a bare
> nullable, change the one call site in `ResponderController.scan()`.

The data models in `lib/models/` are plain immutable classes with
`toMap()`/`fromMap()`, shaped to match the protobuf schema — real
encrypt/decrypt should round-trip them without a UI refactor.

---

## Not implemented (by design, per the brief)

Real AES-256-GCM · real protobuf · real `nfc_manager` · real SMS · real
Supabase/Stripe. All are mocked so the frontend is buildable and demoable today.
