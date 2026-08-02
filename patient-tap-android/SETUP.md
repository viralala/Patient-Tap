# Patient-Tap Android — setup guide

The app **runs with zero configuration** in demo mode: sign-in, payments and
alerts are simulated locally so you can install the APK and use every screen
immediately. NFC, encryption, reminders, biometrics and OCR are **real from
the first run** — they need no backend at all.

This guide turns on the cloud integrations, in the order that makes sense.

| Integration | What it unlocks | Needed? |
|---|---|---|
| Supabase | Accounts, E2E cloud backup, sync, audit log, share links | Required for the rest |
| Google OAuth | Real "Continue with Google" sign-in | Recommended |
| Razorpay | Real Premium / Clinic payments | Optional |
| Resend / Twilio | Real emergency alert emails & SMS | Optional |

> **This repo's path contains a backtick** (`Codeamble \`26`), which the
> Android NDK's CMake driver rejects outright. Gradle build output is
> therefore redirected to `D:\android-dev\build-out\patient-tap-android`
> (see `android/build.gradle.kts`), with a directory junction at
> `patient-tap-android\build` pointing there so `flutter build`/`flutter
> install`/IDE tooling all see the normal relative path. If this project ever
> moves to a plain path, both can be reverted — the comments in
> `android/build.gradle.kts` say how.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql` — it creates
   every table (`profiles`, `subscriptions`, `razorpay_orders`,
   `patient_backups`, `treatment_log`, `scan_events`, `emergency_contacts`,
   `share_links`), enables Row Level Security on all of them, and wires a
   trigger that bootstraps a `profiles` + free `subscriptions` row on signup.
3. Deploy the 7 Edge Functions in `supabase/functions/`:
   ```sh
   supabase functions deploy razorpay-order
   supabase functions deploy razorpay-verify
   supabase functions deploy razorpay-webhook --no-verify-jwt
   supabase functions deploy razorpay-cancel
   supabase functions deploy alerts-notify --no-verify-jwt
   supabase functions deploy audit-scan --no-verify-jwt
   supabase functions deploy share-create
   ```
   `--no-verify-jwt` is required for the three functions Responder mode calls
   without ever signing in (`audit-scan`, `alerts-notify`) and for the
   Razorpay webhook (called by Razorpay, not a user).
4. Copy **Project URL** and **anon/publishable key** from
   Project Settings → API.

## 2. Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com), create an
   OAuth 2.0 **Web application** client — this is the `serverClientId` and
   also what Supabase validates the ID token against.
2. Create an OAuth 2.0 **Android** client, using your APK's package name
   (`app.patienttap.patient_tap`) and SHA-1 fingerprint:
   ```sh
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   # or, for your release key.properties keystore:
   keytool -list -v -keystore path/to/your.jks -alias <keyAlias>
   ```
3. In Supabase → Authentication → Providers → Google, paste the **Web**
   client id + secret, and enable the provider.

## 3. Razorpay

1. Get your **Key ID** and **Key Secret** from the
   [Razorpay dashboard](https://dashboard.razorpay.com) (test mode keys start
   with `rzp_test_`).
2. Set Edge Function secrets (Project Settings → Edge Functions → Secrets, or
   `supabase secrets set`):
   ```sh
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxx
   supabase secrets set RAZORPAY_KEY_SECRET=xxxxx
   supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxxxx
   ```
3. In the Razorpay dashboard → Settings → Webhooks, add
   `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`,
   subscribe to `payment.captured`, `payment.failed`, `refund.created`, and
   set the same webhook secret as step 2.
4. Only the **Key ID** goes in the app (it's public); the secret never leaves
   the Edge Functions.

## 4. Emergency alerts (optional)

Add whichever of these you want live — the app degrades gracefully if either
is missing (`alerts-notify` reports `simulated: true`):

```sh
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set ALERT_FROM_EMAIL=alerts@yourdomain.com
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_FROM_NUMBER=+1xxxxxxxxxx
```

## 5. Build with your credentials

Everything above becomes live via `--dart-define` at build time — nothing is
hardcoded, nothing is committed:

```sh
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=sb_publishable_xxxxx \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=xxxxx.apps.googleusercontent.com \
  --dart-define=RAZORPAY_KEY_ID=rzp_test_xxxxx \
  --dart-define=SITE_URL=https://your-share-viewer-domain.com
```

Omit any `--dart-define` and that specific integration falls back to demo
mode automatically (`lib/config/app_config.dart` — `hasSupabase`,
`hasGoogle`, `hasRazorpay` are each computed from whether their values are
non-empty). `SITE_URL` only matters if you also stand up a public share-link
viewer web page; without one, share links are still created and still
decrypt correctly with `WebFetch`/any client that reads the fragment, but
there is nowhere for a browser to render them nicely.

## 6. Provisioning NFC cards

Any **NTAG213/215/216** sticker or wristband works — NTAG215 (504 usable
bytes) is what the 504-byte budget meter in the Tag screen assumes. Cheap
5-packs are available from most electronics marketplaces. No special
provisioning step is needed: the app formats a blank card automatically the
first time you write to it (see `NfcService.writeToTag` →
`NdefFormatableAndroid`).

## Verifying it worked

- **Debug**: `flutter build apk --debug` (no dart-defines needed) → sideload
  and confirm the app opens straight to demo-mode sign-in.
- **Analyzer + tests**: `flutter analyze && flutter test` — 18 unit tests
  cover the crypto wire format, the tag payload round trip, and the drug
  conflict checker (the safety-critical logic).
- **Live mode**: after building with real `--dart-define`s, Settings → "About
  this build" should read *"Connected to the live backend."* instead of
  *"Running in demo mode."*
