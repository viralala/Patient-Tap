# Patient-Tap — Backend Setup Guide

This guide takes the two Next.js apps (`iOS/` and `android/`) from **demo mode** to a
**fully live backend**: Google sign-in, a Supabase database, Stripe billing, end-to-end
encrypted cloud backup/sync, emergency-contact alerts, a secure share link, and a
chain-of-custody audit log.

> **Dual mode.** The app already runs with *none* of this configured — it falls back to a
> self-contained demo (local sign-in, simulated billing, local backup). As soon as the
> environment variables below are present, the same code switches to the real services.
> You never have to touch the app code; you only fill in `.env.local`.

Everything below is a **one-time** setup. Where a step differs between the iOS and Android
builds, it's called out — otherwise both apps share **one** Supabase project and **one**
Stripe account.

---

## 0. What you'll end up with

| Feature | Powered by | Env vars |
|---|---|---|
| Sign-in required to use the app | Supabase Auth + Google OAuth | `NEXT_PUBLIC_SUPABASE_*` |
| Cloud database (encrypted) | Supabase Postgres + RLS | `SUPABASE_SERVICE_ROLE_KEY` |
| Subscriptions (Free / Pro / Clinic) | Stripe Checkout + Portal + webhook | `STRIPE_*`, `NEXT_PUBLIC_STRIPE_*` |
| E2E backup & multi-device sync | Supabase + Web Crypto (client) | — |
| Emergency alerts (email / SMS) | Resend / Twilio | `RESEND_*`, `TWILIO_*` |
| Secure share link | Supabase + per-share key in URL `#fragment` | — |
| Audit / chain-of-custody log | Supabase service-role route | — |

---

## 1. Prerequisites

- Node 18+ (this repo was built on Node 24).
- A [Supabase](https://supabase.com) account (free tier is fine).
- A [Stripe](https://stripe.com) account (test mode is fine).
- A Google account for the [Google Cloud Console](https://console.cloud.google.com).
- *(Optional, for alerts)* a [Resend](https://resend.com) account and/or a
  [Twilio](https://twilio.com) account.

---

## 2. Supabase

### 2.1 Create the project
1. Supabase dashboard → **New project**. Pick a name and a strong DB password.
2. Wait for it to provision (~2 min).

### 2.2 Run the schema
1. In the project, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. **Run**. This creates the tables (`profiles`, `subscriptions`, `patient_backups`,
   `treatment_log`, `scan_events`, `emergency_contacts`, `share_links`), enables Row-Level
   Security with owner-only policies, and installs the "create profile on signup" trigger.

### 2.3 Get the API keys
Project → **Settings → API**. Copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
  ⚠️ **Server-only.** Never expose the service-role key to the browser or commit it.

### 2.4 Configure auth redirect URLs
Project → **Authentication → URL Configuration**:
- **Site URL:** your primary app URL (e.g. `http://localhost:3010` in dev, or your Vercel URL).
- **Redirect URLs** (add all you use):
  - `http://localhost:3010/auth/callback` (iOS dev)
  - `http://localhost:3020/auth/callback` (Android dev)
  - `https://YOUR-IOS-DOMAIN/auth/callback` (prod)
  - `https://YOUR-ANDROID-DOMAIN/auth/callback` (prod)

---

## 3. Google sign-in

### 3.1 Create an OAuth client
1. [Google Cloud Console](https://console.cloud.google.com) → create/select a project.
2. **APIs & Services → OAuth consent screen** → configure (External, add your email as a
   test user while in "Testing").
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URI:** the Supabase callback, which looks like
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
     (Supabase shows this exact URL in the next step).
4. Copy the **Client ID** and **Client secret**.

### 3.2 Enable the provider in Supabase
Supabase → **Authentication → Providers → Google** → enable, paste the **Client ID** and
**Client secret**, save. (Supabase displays the callback URL to paste back into Google in
3.1 if you didn't already.)

That's it — the app calls `signInWithOAuth({ provider: "google" })` and Supabase handles the
rest, returning to `/auth/callback`.

---

## 4. Stripe billing

### 4.1 Create products & prices
Stripe dashboard (Test mode) → **Products** → add two products with **recurring** prices:

| Product | Price (monthly) | Price (yearly ≈ −10%) |
|---|---|---|
| **Premium (Pro)** | ₹999 / month | ₹10,789 / year |
| **B2B / Clinic** | ₹1,999 / month | ₹21,589 / year |

Copy each **Price ID** (`price_...`) into:
- `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`
- `NEXT_PUBLIC_STRIPE_PRICE_CLINIC_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PRICE_CLINIC_YEARLY`

### 4.2 API keys
Stripe → **Developers → API keys**:
- **Secret key** → `STRIPE_SECRET_KEY`
- **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4.3 Webhook (this is what actually flips a user to Pro/Clinic)
Stripe → **Developers → Webhooks → Add endpoint**:
- **Endpoint URL:** `https://YOUR-DOMAIN/api/stripe/webhook`
- **Events:** `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`.
- Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

**Local testing** — use the Stripe CLI so the webhook can reach your machine:
```bash
stripe listen --forward-to localhost:3010/api/stripe/webhook
```
It prints a `whsec_...` — use that as `STRIPE_WEBHOOK_SECRET` while testing locally.

### 4.4 Billing portal
Stripe → **Settings → Billing → Customer portal** → activate (so "Manage billing" works).

---

## 5. Emergency alerts (optional)

Alerts are sent server-side to the patient's **cloud** emergency contacts (uploaded only when
the patient toggles "Emergency alerts" on). Configure either or both providers:

- **Email (Resend):** create an API key → `RESEND_API_KEY`; set a verified sender →
  `ALERT_FROM_EMAIL`.
- **SMS (Twilio):** from the console copy `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and a
  sending number → `TWILIO_FROM_NUMBER`.

If neither is set, the alert route returns a "simulated" success so the UI still works.

---

## 6. Fill in `.env.local`

Each app reads its **own** `.env.local`. Copy the example and fill it in:

```bash
# iOS build
cp "iOS/.env.local.example" "iOS/.env.local"
# Android build
cp "android/.env.local.example" "android/.env.local"
```

The only value that differs between them is `NEXT_PUBLIC_SITE_URL`:
- iOS → `http://localhost:3010` (dev) / your iOS prod URL
- Android → `http://localhost:3020` (dev) / your Android prod URL

Everything else (Supabase, Stripe, Resend/Twilio) is **the same** in both files.

---

## 7. Run it

```bash
# iOS  (from inside the folder — the repo path has a backtick, so npm --prefix fails)
cd iOS && npm install && npm run dev      # http://localhost:3010

# Android
cd android && npm install && npm run dev  # http://localhost:3020
```

Open the app → **Continue with Google** → you're signed in with a real account → create a PIN
→ go to **Settings** to see your live subscription, cloud backup, alerts, and share link.

---

## 8. Deploy (Vercel)

1. Import each app folder as its own Vercel project (set the **Root Directory** to `iOS` or
   `android`).
2. Add **all** the env vars from `.env.local` to the Vercel project (Settings → Environment
   Variables). Set `NEXT_PUBLIC_SITE_URL` to that project's production URL.
3. After the first deploy, go back and update:
   - **Supabase** redirect URLs (§2.4) with the real `…/auth/callback` URLs.
   - **Stripe** webhook endpoint (§4.3) to `https://YOUR-DOMAIN/api/stripe/webhook`, and put
     its signing secret in Vercel.
4. Redeploy.

---

## 9. Security notes

- **End-to-end encryption is preserved.** Medical records are AES-256-GCM encrypted on the
  device (`lib/crypto.ts`) before upload; the server only ever stores ciphertext
  (`patient_backups`, `treatment_log.action_ciphertext`, `share_links.ciphertext`).
- **The one plaintext exception** is `emergency_contacts` (name/phone/email) — the alert
  function needs it to reach people. It's opt-in and RLS-protected.
- **RLS is on** for every table; users can only read their own rows. Writes that must cross
  users (webhook, audit, share reads) go through **service-role** route handlers only.
- **Share links** are encrypted with a *fresh per-share key* that lives only in the URL
  `#fragment` — it never reaches the server. Links are revocable and time-limited.
- **`SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-only.** Never prefix them
  with `NEXT_PUBLIC_`.
- **Before production**, run `npm audit fix` in each app (the base `next`/`postcss`/`sharp`
  pins carry advisories; note that the Next fix is a major bump — test after upgrading).

### Optional hardening (future)
- Derive the backup key from the user's PIN (currently the shared responder key is used so
  restore always works cross-device). A PIN-derived key makes a stolen blob undecryptable
  even with app access, at the cost of requiring the PIN to restore.
- Add verified-responder accounts (Clinic tier) so every scan is attributed to a real ID.
- Move alerts to a Supabase Edge Function if you prefer them off the Next.js runtime.

---

## 10. File map (what got added)

```
new app/
├─ supabase/migrations/0001_init.sql   # DB schema + RLS + triggers
├─ BACKEND_SETUP.md                    # this file
└─ iOS/ (mirrored in android/)
   ├─ .env.local.example               # all env vars, documented
   ├─ middleware.ts                    # refreshes the Supabase session
   ├─ lib/
   │  ├─ config.ts                     # feature flags + tiers + price map
   │  ├─ backend.ts                    # dual-mode API the UI calls
   │  ├─ stripe.ts                     # server Stripe helper
   │  ├─ crypto.ts                     # (+ per-share key helpers)
   │  └─ supabase/{client,server}.ts   # browser + server/admin clients
   ├─ app/
   │  ├─ auth/callback/route.ts        # OAuth code exchange
   │  ├─ api/stripe/{checkout,portal,webhook}/route.ts
   │  ├─ api/audit/scan/route.ts       # chain-of-custody
   │  ├─ api/alerts/notify/route.ts    # email/SMS to contacts
   │  ├─ api/share/create/route.ts     # revocable share link
   │  └─ share/[token]/{page,ShareViewer}.tsx  # public E2E viewer
   └─ components/
      ├─ screens/SignIn.tsx            # Google sign-in gate
      ├─ App.tsx / AppContext.tsx      # auth gate + session/subscription state
      └─ screens/Settings.tsx          # account, billing, cloud, share UI
```
