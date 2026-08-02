-- ============================================================================
-- Patient-Tap Android — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once per project.
--
-- Design note: medical records are END-TO-END ENCRYPTED on the device
-- (see lib/core/crypto_service.dart). The server stores CIPHERTEXT ONLY in
-- `patient_backups`, `treatment_log.action_ciphertext` and
-- `share_links.ciphertext`. The one deliberate plaintext exception is
-- `emergency_contacts` (name/phone/email), which the alert function needs in
-- order to reach people — it is opt-in.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- profiles — 1:1 with auth.users (the app account)
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: owner can read" on public.profiles;
create policy "profiles: owner can read"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles: owner can update" on public.profiles;
create policy "profiles: owner can update"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- subscriptions — Razorpay billing state, 1:1 with user
-- ===========================================================================
create table if not exists public.subscriptions (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  tier                    text not null default 'free' check (tier in ('free','pro','clinic')),
  status                  text,                       -- active/past_due/cancelled...
  razorpay_customer_id    text,
  razorpay_subscription_id text,
  razorpay_plan_id        text,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  updated_at              timestamptz not null default now()
);

create index if not exists idx_subscriptions_customer on public.subscriptions(razorpay_customer_id);

alter table public.subscriptions enable row level security;

-- Users may READ their own billing state; writes happen only via Edge
-- Functions (service-role key, which bypasses RLS). No user write policy = locked.
drop policy if exists "subscriptions: owner can read" on public.subscriptions;
create policy "subscriptions: owner can read"
  on public.subscriptions for select using (auth.uid() = user_id);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- razorpay_orders — tracks created orders so /razorpay-verify can look the
-- server-computed price back up (the client never gets to say the amount).
-- ===========================================================================
create table if not exists public.razorpay_orders (
  order_id    text primary key,          -- Razorpay order id (order_...)
  user_id     uuid not null references auth.users(id) on delete cascade,
  tier        text not null check (tier in ('pro','clinic')),
  cycle       text not null check (cycle in ('monthly','yearly')),
  amount      int not null,              -- paise
  status      text not null default 'created' check (status in ('created','paid','failed')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_razorpay_orders_user on public.razorpay_orders(user_id, created_at desc);

alter table public.razorpay_orders enable row level security;

drop policy if exists "razorpay_orders: owner can read" on public.razorpay_orders;
create policy "razorpay_orders: owner can read"
  on public.razorpay_orders for select using (auth.uid() = user_id);
-- No user insert/update policy: writes are service-role only (Edge Functions).

-- ===========================================================================
-- patient_backups — E2E-encrypted profile blob, 1 per user
-- ===========================================================================
create table if not exists public.patient_backups (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  ciphertext        text not null,          -- base64 [IV|ciphertext+tag] from core/crypto_service
  patient_public_id text,                   -- "PT-XXXX" (non-sensitive) for linking
  version           int  not null default 2,
  updated_at        timestamptz not null default now()
);

alter table public.patient_backups enable row level security;

drop policy if exists "backups: owner full access" on public.patient_backups;
create policy "backups: owner full access"
  on public.patient_backups for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists trg_backups_updated_at on public.patient_backups;
create trigger trg_backups_updated_at before update on public.patient_backups
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- treatment_log — append-only chain-of-custody + multi-device sync
-- action text is E2E encrypted (action_ciphertext).
-- ===========================================================================
create table if not exists public.treatment_log (
  id                uuid primary key default gen_random_uuid(),
  patient_owner_id  uuid references auth.users(id) on delete cascade,
  patient_public_id text,
  responder_id      text,
  action_ciphertext text,                   -- E2E encrypted "Administered ..."
  occurred_at       timestamptz not null default now(),
  source            text not null default 'app' check (source in ('app','responder','import')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_treatment_owner on public.treatment_log(patient_owner_id, occurred_at desc);

alter table public.treatment_log enable row level security;

-- The patient (owner) can read and append their own log entries. Anonymous
-- responder writes go through the service-role /audit-scan function.
drop policy if exists "treatment_log: owner can read" on public.treatment_log;
create policy "treatment_log: owner can read"
  on public.treatment_log for select using (auth.uid() = patient_owner_id);

drop policy if exists "treatment_log: owner can insert" on public.treatment_log;
create policy "treatment_log: owner can insert"
  on public.treatment_log for insert with check (auth.uid() = patient_owner_id);

-- ===========================================================================
-- scan_events — server audit log (every scan/access of a profile)
-- Inserted by the service-role /audit-scan function (responders are anon).
-- ===========================================================================
create table if not exists public.scan_events (
  id                uuid primary key default gen_random_uuid(),
  patient_owner_id  uuid references auth.users(id) on delete set null,
  patient_public_id text,
  responder_id      text,
  responder_label   text,
  lat               double precision,
  lng               double precision,
  user_agent        text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_scan_owner on public.scan_events(patient_owner_id, created_at desc);

alter table public.scan_events enable row level security;

drop policy if exists "scan_events: owner can read" on public.scan_events;
create policy "scan_events: owner can read"
  on public.scan_events for select using (auth.uid() = patient_owner_id);
-- No user insert policy: inserts are service-role only.

-- ===========================================================================
-- emergency_contacts — server-side (opt-in) so alerts can reach people.
-- Deliberate plaintext exception to E2E; only name/phone/email.
-- ===========================================================================
create table if not exists public.emergency_contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text,
  phone       text,
  email       text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_contacts_user on public.emergency_contacts(user_id);

alter table public.emergency_contacts enable row level security;

drop policy if exists "contacts: owner full access" on public.emergency_contacts;
create policy "contacts: owner full access"
  on public.emergency_contacts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- share_links — secure, revocable, time-limited emergency card links.
-- ciphertext is encrypted with a PER-SHARE random key that lives ONLY in the
-- URL fragment (#k=...) and never reaches the server. The public viewer
-- decrypts client-side. The service role reads ciphertext for the viewer.
-- ===========================================================================
create table if not exists public.share_links (
  token         text primary key,           -- urlsafe random id (public path segment)
  user_id       uuid not null references auth.users(id) on delete cascade,
  ciphertext    text not null,
  label         text,
  expires_at    timestamptz,
  revoked       boolean not null default false,
  access_count  int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_share_user on public.share_links(user_id, created_at desc);

alter table public.share_links enable row level security;

-- Owner manages their own links. Public read is done via the service role in
-- the public share-viewer route (checks expiry/revoked, bumps access_count).
drop policy if exists "share_links: owner full access" on public.share_links;
create policy "share_links: owner full access"
  on public.share_links for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- New-user bootstrap: create profile + free subscription row on signup.
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, tier)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Done. Grant nothing extra: anon/authenticated get table access via RLS only.
-- ============================================================================
