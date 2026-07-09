# Patient-Tap — Web

A premium, motion-rich **web** frontend for Patient-Tap, living alongside (and independent of)
the Flutter app at the repo root. Same product: an encrypted patient medical record that lives
on an NFC wristband (NTAG215, 504 bytes), readable by any phone with **zero network dependency**.

This is **frontend only**. Every backend touchpoint is stubbed behind a clean, typed interface that
returns mock data after a simulated delay — the same contract the Flutter app uses — so the
backend/crypto/NFC/alerts teammates drop real code in without touching a single screen.

## Run

> Run from **inside this folder** (`frontend-web/`) — that keeps `npm`/`next` binary resolution
> simple regardless of where the repo is checked out.

```bash
cd frontend-web
npm install
npm run dev          # http://localhost:3000
# production: npm run build && npm start
```

Node 20+ recommended (developed on Node 24 / npm 11).

## What's in it

Two surfaces, one app:

- **`/` — the landing showcase.** Cinematic dark hero with a live NFC credential card, spec marquee,
  gapless feature bento, a **scroll-pinned "how it works"** sequence, a word-by-word scrubbed mission
  reveal, a scale-on-scroll responder showcase, animated stat counters, and a closing CTA.
- **`/app` — the functional app.** A phone-framed shell with a **Patient ⇄ Responder** toggle and a
  dark floating pill nav, mirroring the Flutter screens:
  - **Patient:** Profile dashboard (circular tag-storage gauge + stat grid) · Edit form
    (blood type, allergy chips, repeatable meds, red DNR toggle, ≤3 contacts) · Write-to-Tag
    (simulated encrypt + write with `moved` / `full` errors).
  - **Responder:** Scan (pulsing ring → read → decrypt, with tampered / no-tag states) · decrypted
    life-safety record (DNR + allergies loudest/reddest) · Add-log-entry (Save & re-write tag) ·
    Treatment-log timeline (dark segmented filter).

Deep-links for demos/screenshots: `?role=patient|responder`, `?screen=profile|edit|write|scan|record|log`,
plus the legacy `?screen=patient|responder|log` shortcuts.

## Motion / UX

- **GSAP** (`@gsap/react` + `ScrollTrigger`) for the hero timeline, pinning, scrubbed reveals, and
  count-ups; **Lenis** for inertial smooth scroll (wired into the GSAP ticker).
- A bespoke **two-part cursor** (tracking dot + spring-trailing ring with contextual labels),
  **magnetic** buttons, and a 3D pointer-tilt credential card.
- Everything degrades: `prefers-reduced-motion` disables smooth scroll, the custom cursor, and
  reveals; entrances use `gsap.from` so content is never stuck hidden if JS fails.

## The backend seam

All backend calls live in **`lib/services/`** and are re-exported from **`lib/services/index.ts`**.
Swap these four files with the real stack and keep the exported signatures stable — no screen changes:

| File | Stub does | Real impl |
| --- | --- | --- |
| `crypto.ts` | JSON encode/decode; `tampered` on parse fail | protobuf + AES-256-GCM |
| `nfc.ts` | ~20% write fail, `full` over 504 B, ~10% no-tag read | Web NFC / native NTAG215 |
| `alert.ts` | logs the SMS+GPS payload | connectivity + SMS gateway |
| `backend.ts` | returns success / Pro tier | Supabase + Stripe |

Models live in `lib/models.ts` (typed parallels of the Flutter `lib/models` with `profileToMap` /
`profileFromMap` for wire parity). Sample content is in `lib/mock-data.ts`. Shared UI state
(`ownerProfile`, `scanned`) is a small Zustand store in `lib/store.ts`.

## Structure

```
app/                     # Next.js App Router (/ landing, /app surfaces)
components/
  landing/               # hero, bento, how-it-works, mission, life-safety, stats, cta
  site/                  # floating nav, footer
  brand/                 # logo, credential-card visual
  ui/                    # cursor, reveal, magnetic, button, marquee, count-up
  app/                   # the functional app
    patient/ · responder/ · ui/   # screens + shared widgets
  providers/             # smooth-scroll (Lenis + GSAP)
lib/                     # models, services (the seam), mock-data, store, utils
```

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 3 · GSAP · Lenis · Zustand · lucide-react ·
Space Grotesk + Geist. Design tokens: royal `#2F5FE0`, ink `#0A0E17`, off-white paper, critical red.
