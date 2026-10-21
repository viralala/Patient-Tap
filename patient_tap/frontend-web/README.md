# Patient-Tap — Website

The public website for Patient-Tap: the marketing site, **MedVerify** (scan a medicine pack to
check it's genuine), the blood & organ **donation** tools, the legal pages, and the `/app` web
demo of the patient/responder experience. The native Android app lives in
[`../../patient-tap-android`](../../patient-tap-android).

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP + Lenis · three.js (react-three-fiber)
· Supabase · Vercel.

## Run locally

```bash
cd patient_tap/frontend-web
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

Without `.env.local` the site still runs; only the forms and MedVerify report "offline".

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (typescript-eslint + React hooks) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm audit` | Should report **0 vulnerabilities** |

## Deploy to Vercel (custom domain)

1. Import the GitHub repo in Vercel. Set **Root Directory** to `patient_tap/frontend-web`
   (framework preset: Next.js).
2. Add these **Environment Variables** (Production and Preview):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain` (canonical URL, sitemap, OG tags) |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key — server-side only |
   | `WEB_RPC_TOKEN` | Shared secret checked by the database on every call |
   | `IP_HASH_SALT` | Random string for hashing visitor IPs |
   | `ADMIN_PASSWORD_HASH` | Owner password hash for `/admin` (`npm run admin:hash -- "…"`) |
   | `ADMIN_SESSION_SECRET` | Signs the admin session cookie (printed by the same command) |
   | `ADMIN_NAME` | Optional: name on the admin ID pass |

3. Add your domain under **Settings → Domains** and point DNS at Vercel.
4. Optional: enable **Web Analytics** — it loads only after a visitor opts in via the cookie banner.

`vercel.json` pins serverless functions to `bom1` (Mumbai), next to the database.

## Supabase

Migrations live in [`supabase/migrations`](supabase/migrations):

| File | Purpose |
| --- | --- |
| `…_web_schema.sql` | Waitlist, contact, MedVerify registry and reports, plus rate limiting |
| `…_medverify_demo_seed.sql` | Fictional demo medicines, batches and serials (GS1 `04x` prefix) |
| `…_server_token_gate.sql` | Moves the logic to `private`; public RPCs check `WEB_RPC_TOKEN` |

After applying them to a new project, store the token's hash once (SQL editor):

```sql
insert into private.app_config (key, value)
values ('web_rpc_token_sha256', encode(sha256(convert_to('<WEB_RPC_TOKEN>', 'UTF8')), 'hex'))
on conflict (key) do update set value = excluded.value;
```

## Security model

- **Browser:** per-request nonce CSP with `strict-dynamic` (`proxy.ts`), HSTS preload,
  `X-Frame-Options`, `nosniff`, a strict `Permissions-Policy` (camera on our origin only),
  COOP/CORP, and no `X-Powered-By` (`next.config.mjs`).
- **API** (`app/api/*`, `lib/server/guard.ts`): same-origin check, JSON-only size-capped bodies,
  zod validation, honeypot + minimum fill time, per-instance burst limit.
- **Database:** RLS on every table with no policies, and no table grants. Access goes only
  through `SECURITY DEFINER` functions that require the server token and rate-limit per hashed
  IP and globally. The browser never talks to Supabase directly.
- **Privacy:** camera frames are decoded in the browser (ZXing); IPs are salted and hashed; the
  MedVerify scan log is kept for 90 days.
- **Supply chain:** CI runs `npm audit`, lint, typecheck and build
  (`.github/workflows/web-ci.yml`), plus CodeQL and Dependabot.
- Vulnerability reports go to `/security` and `/.well-known/security.txt`.

## Legal pages

`/privacy` (DPDP Act 2023), `/terms`, `/cookies`, `/disclaimer` (medical), `/refunds`,
`/shipping`, `/accessibility`, `/security`, `/licenses`, `/contact` (with the Grievance Officer).
Operator, contact and grievance details come from **`lib/site.ts`** — edit them there.
Have the documents reviewed by a lawyer before taking real payments or real patient data.

## Structure

```
app/                  routes: / · /verify · /donate · /app · legal pages · api/*
components/redesign/  landing sections (hero, emergency story, MedVerify, donation, …)
components/three/     3D wristband (react-three-fiber), lazy-loaded with a 2D fallback
components/medverify/ scanner, result view, report form, QR renderer
components/donate/    eligibility check + blood-type compatibility explorer
components/site/      legal shell, cookie consent, forms
components/app/       the /app demo (patient + responder)
lib/                  site config, GS1 parser, forms, consent, server guard, services
proxy.ts              per-request CSP nonce
supabase/migrations/  database schema
```
