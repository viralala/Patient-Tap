<div align="center">

# 🩺 Patient-Tap — Android

**Tap an NFC card. Save a life.**

An offline-first NFC emergency medical identity app — your critical medical
history, allergies, and medications, encrypted on a wearable NFC card and
readable by any first responder in seconds, with zero signal required.

[![Flutter](https://img.shields.io/badge/Flutter-stable-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart SDK](https://img.shields.io/badge/Dart%20SDK-%5E3.12.0-0175C2?logo=dart&logoColor=white)](https://dart.dev)
[![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)](#)
[![Backend](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Payments](https://img.shields.io/badge/payments-Razorpay-0C2451?logo=razorpay&logoColor=white)](https://razorpay.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Built for](https://img.shields.io/badge/built%20for-CODEAMBLE%202026-ff5f5f)](#)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration — Going Live](#configuration--going-live)
- [Provisioning NFC Cards](#provisioning-nfc-cards)
- [Security](#security)
- [Testing](#testing)
- [Subscription Tiers](#subscription-tiers)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Team & Credits](#team--credits)

---

## About

**Patient-Tap** is a native Flutter Android app that turns a cheap NFC
sticker or wristband into a life-saving medical ID. A patient writes their
profile — allergies, medications, conditions, emergency contacts — to an
encrypted NFC tag once. From then on, any responder can tap the tag with
this app (or scan it in **Responder mode**, no account required) and get an
instant, decrypted read-out of exactly what they need to treat the patient
safely.

The app is **offline-first by design**: NFC read/write, AES-256-GCM
encryption, on-device OCR document auto-fill, biometric lock, and local
medication reminders all work with **zero network connection and zero
configuration**, straight out of the APK. Cloud backup, multi-device sync,
emergency SMS/email alerts, and payments are optional, additive layers on
top of a backend that can be switched on later — see
[Configuration](#configuration--going-live).

This app is the native Android sibling of the Patient-Tap Next.js web
prototype, ported feature-for-feature with real device integrations in
place of browser simulations, and is part of the team's submission to
**CODEAMBLE 2026** (Healthcare & MedTech track).

## Features

**Always available — no sign-in, no network, no config:**

- 🔐 **Encrypted on-device profile** — AES-256-GCM, wire-format compatible
  with the companion web build
- 📡 **Real NFC read & write** — NTAG213/215/216 support via native NDEF
- 🚑 **Responder scan & decrypt** — tap-to-read for first responders, no
  account needed
- 💊 **Local medication reminders** — offline-scheduled notifications
- 🧬 **Drug conflict checker** — flags dangerous interactions before they
  reach a tag
- 🪪 **Document auto-fill via OCR** — point the camera at a prescription or
  ID card and the profile fills itself in (on-device ML Kit, nothing
  uploaded)
- 🔒 **Biometric / PIN lock** — fingerprint or face unlock guards the app
  itself

**Premium (cloud-connected):**

- ☁️ End-to-end encrypted cloud backup & multi-device sync
- 📣 Emergency-contact alerts triggered on scan (email/SMS)
- 🔗 Secure, shareable emergency link
- 🧾 Full access / chain-of-custody audit log

**B2B / Clinic:**

- ✅ Verified responder accounts
- 📊 Team audit dashboard
- 🏷️ Bulk NTAG215 provisioning
- 🎧 Priority support & SLA

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Flutter](https://flutter.dev) (Dart SDK `^3.12.0`) |
| State management | [`provider`](https://pub.dev/packages/provider) |
| Local persistence | [`shared_preferences`](https://pub.dev/packages/shared_preferences) |
| Cryptography | [`cryptography`](https://pub.dev/packages/cryptography) (AES-256-GCM) + [`crypto`](https://pub.dev/packages/crypto) (SHA-256 PIN hashing) |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security, Edge Functions |
| Auth | [`google_sign_in`](https://pub.dev/packages/google_sign_in) → Supabase ID-token sign-in |
| NFC | [`nfc_manager`](https://pub.dev/packages/nfc_manager) + [`nfc_manager_ndef`](https://pub.dev/packages/nfc_manager_ndef) |
| Payments | [`razorpay_flutter`](https://pub.dev/packages/razorpay_flutter) |
| Notifications | [`flutter_local_notifications`](https://pub.dev/packages/flutter_local_notifications) + [`timezone`](https://pub.dev/packages/timezone) |
| Location & hand-off | [`geolocator`](https://pub.dev/packages/geolocator) + [`url_launcher`](https://pub.dev/packages/url_launcher) |
| Biometrics | [`local_auth`](https://pub.dev/packages/local_auth) |
| OCR | [`google_mlkit_text_recognition`](https://pub.dev/packages/google_mlkit_text_recognition) + [`image_picker`](https://pub.dev/packages/image_picker) |
| Design system | Variable fonts (Manrope, Space Grotesk) + [`flutter_svg`](https://pub.dev/packages/flutter_svg) monoline icon set |

## Architecture

```
                 ┌─────────────────────────┐
                 │        ui/screens        │  sign_in · lock · home · write_tag
                 │   (Provider-driven UI)   │  responder · reminders · profile_edit
                 └────────────┬─────────────┘  scan_doc · settings
                              │
                 ┌────────────▼─────────────┐
                 │      state/app_state      │  single source of truth,
                 │        (ChangeNotifier)   │  demo-mode vs live-mode aware
                 └────────────┬─────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                      │
┌───────▼───────┐   ┌─────────▼─────────┐   ┌────────▼────────┐
│   core/*       │   │   backend/*        │   │  config/        │
│ crypto_service │   │ supabase_client    │   │ app_config.dart │
│ nfc_service    │   │ backend_service    │   │ (feature flags, │
│ local_store    │   │ razorpay_service   │   │  --dart-define) │
│ ocr_service    │   └─────────┬──────────┘   └─────────────────┘
│ reminder_svc   │             │
│ alert_service  │   ┌─────────▼──────────┐
│ conflict_check │   │  Supabase project    │
└────────────────┘   │  Postgres + RLS      │
                      │  7 Edge Functions    │
                      └──────────┬───────────┘
                                 │
                      ┌──────────▼───────────┐
                      │ Razorpay · Resend ·   │
                      │ Twilio (optional)     │
                      └───────────────────────┘
```

The app runs the entire left-hand side (UI → state → `core/*`) with **no
backend at all**. `backend/*` and everything below it only activates once
Supabase credentials are supplied — see [Configuration](#configuration--going-live).

## Project Structure

```
patient-tap-android/
├── lib/
│   ├── main.dart                  # entry point
│   ├── config/
│   │   └── app_config.dart        # feature flags, subscription tier metadata
│   ├── models/
│   │   └── patient_profile.dart   # the encrypted medical profile model
│   ├── core/                      # device-native, works fully offline
│   │   ├── crypto_service.dart    # AES-256-GCM encrypt/decrypt
│   │   ├── local_store.dart       # on-device persistence
│   │   ├── conflict_checker.dart  # drug interaction checks
│   │   ├── nfc_service.dart       # NDEF read/write to NTAG21x
│   │   ├── ocr_service.dart       # on-device text recognition
│   │   ├── reminder_service.dart  # local notification scheduling
│   │   └── alert_service.dart     # GPS + SMS/dialer/maps hand-off
│   ├── backend/                   # activates only when configured
│   │   ├── supabase_client.dart
│   │   ├── backend_service.dart
│   │   └── razorpay_service.dart
│   ├── state/
│   │   └── app_state.dart         # app-wide ChangeNotifier
│   ├── theme/                     # design tokens, typography, theme
│   └── ui/
│       ├── app_shell.dart
│       ├── screens/                # sign_in, lock, home, write_tag,
│       │                           # responder, reminders, profile_edit,
│       │                           # scan_doc, settings
│       └── widgets/
├── assets/fonts/                  # bundled variable fonts (offline-first)
├── supabase/
│   ├── migrations/                # schema + RLS
│   └── functions/                 # 7 Edge Functions
├── SETUP.md                       # step-by-step backend/live setup guide
└── README.md
```

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable channel)
- Android SDK + a device or emulator running **Android 8.0 (API 26)** or newer
  (NFC read/write requires a physical device with an NFC radio)

### Installation

```sh
git clone https://github.com/viralala/Patient-Tap.git
cd Patient-Tap/patient-tap-android
flutter pub get
```

### Run in demo mode

No API keys, no backend, no `.env` file — the app boots straight into a
fully working demo:

```sh
flutter run
```

Sign-in, billing, and alerts are simulated locally, while NFC, encryption,
reminders, biometrics, and OCR are **real** from the very first launch.

### Build a release APK

```sh
flutter build apk --release
```

## Configuration — Going Live

Everything cloud-side is opt-in and switched on per-build via
`--dart-define`, so no secret is ever hardcoded or committed:

```sh
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=sb_publishable_xxxxx \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=xxxxx.apps.googleusercontent.com \
  --dart-define=RAZORPAY_KEY_ID=rzp_test_xxxxx \
  --dart-define=SITE_URL=https://your-share-viewer-domain.com
```

| Variable | Unlocks | Required? |
|---|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Accounts, E2E cloud backup, sync, audit log, share links | Required for everything below |
| `GOOGLE_SERVER_CLIENT_ID` | Real "Continue with Google" sign-in | Recommended |
| `RAZORPAY_KEY_ID` | Real Premium / Clinic payments | Optional |
| `RESEND_API_KEY` / `TWILIO_*` (Edge Function secrets) | Real emergency alert emails & SMS | Optional |

Omitting a variable leaves that integration in demo mode automatically —
nothing crashes, it just simulates. Full walkthrough, including the
Supabase schema, the 7 Edge Functions, Google OAuth client setup, and the
Razorpay webhook, is in **[`SETUP.md`](./SETUP.md)**.

## Provisioning NFC Cards

Any **NTAG213 / NTAG215 / NTAG216** sticker or wristband works — NTAG215
(504 bytes of user memory, 492 of them usable for the NDEF message) is what
the in-app payload budget meter assumes. No
special provisioning step is required: the app auto-formats a blank card
the first time you write to it.

## Security

- **AES-256-GCM** encryption, wire-format `base64(iv[12] | ciphertext | tag[16])`
  — byte-identical to the companion web build, so a card written by one
  client decrypts correctly on the other.
- **Server-verified payments** — the app only ever sends `{tier, cycle}` to
  the backend; the Edge Function looks up the real price and verifies
  `HMAC-SHA256(order|payment)` server-side. The Razorpay key secret never
  ships inside the app.
- **Row Level Security** enforced on every Supabase table.
- Share links carry the decryption key in the URL **fragment** (`#...`),
  which browsers never send to a server.

## Testing

```sh
flutter analyze
flutter test
```

The suite covers the safety-critical logic: the crypto wire format, the
NFC tag payload round-trip, and the drug conflict checker.

## Subscription Tiers

| | Freemium | Premium | B2B / Clinic |
|---|---|---|---|
| Price | Free | ₹999/mo · ₹10,789/yr | ₹1,999/mo · ₹21,589/yr |
| Encrypted on-device profile | ✅ | ✅ | ✅ |
| NFC write / responder scan | ✅ | ✅ | ✅ |
| Local medication reminders | ✅ | ✅ | ✅ |
| E2E cloud backup & sync | — | ✅ | ✅ |
| Emergency-contact alerts | — | ✅ | ✅ |
| Shareable emergency link | — | ✅ | ✅ |
| Access / audit log | — | ✅ | ✅ |
| Verified responder accounts | — | — | ✅ |
| Team audit dashboard | — | — | ✅ |
| Bulk NTAG215 provisioning | — | — | ✅ |
| Priority support & SLA | — | — | ✅ |

## Roadmap

- [ ] iOS build (NFC read-only, per platform restrictions)
- [ ] Public share-link viewer web page
- [ ] Clinic/team admin console
- [ ] Wear OS companion for responder scanning

## Contributing

Issues and pull requests are welcome. Please open an issue first for any
significant change so it can be discussed before you put in the work.

1. Fork the repo and create your branch from `main`
2. Run `flutter analyze && flutter test` before opening a PR
3. Keep PRs focused — one feature or fix per PR

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for the
full text.

## Acknowledgements

- [Flutter](https://flutter.dev) & the Dart team
- [Supabase](https://supabase.com) for Postgres, Auth, and Edge Functions
- [Razorpay](https://razorpay.com) for payments infrastructure
- [NFC Forum](https://nfc-forum.org) NDEF specification
- [Google ML Kit](https://developers.google.com/ml-kit) for on-device OCR
- README structure inspired by [awesome-readme](https://github.com/matiassingers/awesome-readme)

## Team & Credits

Built with ❤️ by **Team Vishwakarma gng** for **CODEAMBLE 2026**:

| Name |
|---|
| Viral Dhoka |
| Tanaya Thorat |
| Samarth Dhage |
| Vyanktesh Yeole |

---

<div align="center">

If Patient-Tap could help save a life, consider ⭐ starring the repo.

</div>
