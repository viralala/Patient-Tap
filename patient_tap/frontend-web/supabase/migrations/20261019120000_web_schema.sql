-- Patient-Tap website schema: waitlist, contact, MedVerify registry, reports.
--
-- Security model
--   * Every table has RLS ON and NO policies, and table privileges are revoked
--     from anon/authenticated: nothing is readable or writable directly.
--   * The website reaches the data only through the SECURITY DEFINER functions
--     below, which validate input, rate-limit per hashed IP, and return only
--     the fields a visitor should see.
--   * IPs are never stored: the web server sends a salted SHA-256 of the IP.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Rate limiting
-- ---------------------------------------------------------------------------

create table private.rate_events (
  id bigint generated always as identity primary key,
  bucket text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index rate_events_lookup on private.rate_events (bucket, ip_hash, created_at desc);
create index rate_events_global on private.rate_events (bucket, created_at desc);

-- Raises 'rate_limited' when either this IP or the whole bucket is over budget.
create or replace function private.check_rate(
  p_bucket text,
  p_ip_hash text,
  p_limit int,
  p_window interval,
  p_global_limit int
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ip text := coalesce(nullif(p_ip_hash, ''), 'unknown');
  v_count int;
begin
  -- Housekeeping: rate events are only useful for a day.
  if random() < 0.05 then
    delete from private.rate_events where created_at < now() - interval '1 day';
  end if;

  select count(*) into v_count
  from private.rate_events
  where bucket = p_bucket and ip_hash = v_ip and created_at > now() - p_window;
  if v_count >= p_limit then
    raise exception 'rate_limited' using errcode = 'PT429';
  end if;

  select count(*) into v_count
  from private.rate_events
  where bucket = p_bucket and created_at > now() - interval '1 hour';
  if v_count >= p_global_limit then
    raise exception 'rate_limited' using errcode = 'PT429';
  end if;

  insert into private.rate_events (bucket, ip_hash) values (p_bucket, v_ip);
end;
$$;

-- ---------------------------------------------------------------------------
-- Waitlist & contact
-- ---------------------------------------------------------------------------

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null
    check (char_length(email) between 3 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name text check (name is null or char_length(name) <= 120),
  interest text not null default 'patient'
    check (interest in ('patient', 'family', 'responder', 'institution', 'pharmacy', 'other')),
  consent_version text not null check (char_length(consent_version) <= 32),
  consent_at timestamptz not null default now(),
  ip_hash text,
  created_at timestamptz not null default now()
);
create unique index waitlist_email_key on public.waitlist (lower(email));
comment on table public.waitlist is
  'People who asked to hear about launch. Written only by join_waitlist(). Erase on request (DPDP Act).';

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null
    check (char_length(email) between 3 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic text not null
    check (topic in ('general', 'partnership', 'press', 'data_request', 'grievance', 'security', 'order', 'other')),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  ip_hash text,
  created_at timestamptz not null default now()
);
comment on table public.contact_messages is
  'Contact-form messages, including data-rights requests and grievances. Written only by send_contact_message().';

-- ---------------------------------------------------------------------------
-- MedVerify registry (demo data — see seed migration)
-- ---------------------------------------------------------------------------

create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  gtin text not null unique check (gtin ~ '^\d{14}$'),
  brand_name text not null,
  generic_name text not null,
  composition text not null,
  dosage_form text not null,
  pack_size text,
  manufacturer text not null,
  mfg_licence text,
  rx_required boolean not null default true,
  drug_class text,
  uses text[] not null default '{}',
  side_effects text[] not null default '{}',
  warnings text[] not null default '{}',
  interactions text[] not null default '{}',
  storage text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table public.medicines is
  'Product registry for MedVerify. Rows flagged is_demo are fictional brands built on real generic drug information.';

create table public.medicine_batches (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines (id) on delete cascade,
  batch_no text not null,
  mfg_date date not null,
  expiry_date date not null,
  status text not null default 'ok' check (status in ('ok', 'recalled', 'nsq', 'spurious')),
  status_note text,
  unique (medicine_id, batch_no),
  check (expiry_date > mfg_date)
);

create table public.medicine_units (
  serial text primary key check (char_length(serial) between 4 and 40),
  batch_id uuid not null references public.medicine_batches (id) on delete cascade,
  scan_count integer not null default 0,
  -- Off for the stable demo packs so repeated demos never trip clone detection.
  track_scans boolean not null default true,
  first_scanned_at timestamptz,
  last_scanned_at timestamptz
);
create index medicine_units_batch on public.medicine_units (batch_id);

-- Anonymous verification log (retained 90 days) for spotting counterfeit hot spots.
create table public.medicine_scans (
  id bigint generated always as identity primary key,
  gtin text,
  batch_no text,
  serial text,
  verdict text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index medicine_scans_created on public.medicine_scans (created_at desc);

create table public.medicine_reports (
  id uuid primary key default gen_random_uuid(),
  gtin text check (gtin is null or gtin ~ '^\d{14}$'),
  batch_no text check (batch_no is null or char_length(batch_no) <= 40),
  serial text check (serial is null or char_length(serial) <= 40),
  raw_code text check (raw_code is null or char_length(raw_code) <= 512),
  reason text not null
    check (reason in ('suspected_fake', 'damaged_packaging', 'overcharged', 'expired_sold', 'side_effect', 'other')),
  details text check (details is null or char_length(details) <= 2000),
  city text check (city is null or char_length(city) <= 80),
  ip_hash text,
  created_at timestamptz not null default now()
);
comment on table public.medicine_reports is
  'Suspicious-medicine reports from the public. Not a substitute for reporting to CDSCO / the State Drug Controller.';

-- ---------------------------------------------------------------------------
-- Lock every table down: RLS on, no policies, no direct grants.
-- ---------------------------------------------------------------------------

alter table public.waitlist enable row level security;
alter table public.contact_messages enable row level security;
alter table public.medicines enable row level security;
alter table public.medicine_batches enable row level security;
alter table public.medicine_units enable row level security;
alter table public.medicine_scans enable row level security;
alter table public.medicine_reports enable row level security;
alter table private.rate_events enable row level security;

revoke all on public.waitlist, public.contact_messages, public.medicines,
  public.medicine_batches, public.medicine_units, public.medicine_scans,
  public.medicine_reports
  from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public functions (the only way in)
-- ---------------------------------------------------------------------------

create or replace function public.join_waitlist(
  p_email text,
  p_name text,
  p_interest text,
  p_consent_version text,
  p_ip_hash text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_rate('waitlist', p_ip_hash, 5, interval '1 hour', 300);

  insert into public.waitlist (email, name, interest, consent_version, ip_hash)
  values (lower(trim(p_email)), nullif(trim(p_name), ''), p_interest, p_consent_version, p_ip_hash)
  on conflict ((lower(email))) do update
    set consent_version = excluded.consent_version,
        consent_at = now(),
        interest = excluded.interest;
end;
$$;

create or replace function public.send_contact_message(
  p_name text,
  p_email text,
  p_topic text,
  p_message text,
  p_ip_hash text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_rate('contact', p_ip_hash, 4, interval '15 minutes', 200);

  insert into public.contact_messages (name, email, topic, message, ip_hash)
  values (trim(p_name), lower(trim(p_email)), p_topic, trim(p_message), p_ip_hash);
end;
$$;

-- Medicine detail as the public sees it.
create or replace function private.medicine_json(m public.medicines)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'gtin', m.gtin,
    'brandName', m.brand_name,
    'genericName', m.generic_name,
    'composition', m.composition,
    'dosageForm', m.dosage_form,
    'packSize', m.pack_size,
    'manufacturer', m.manufacturer,
    'mfgLicence', m.mfg_licence,
    'rxRequired', m.rx_required,
    'drugClass', m.drug_class,
    'uses', to_jsonb(m.uses),
    'sideEffects', to_jsonb(m.side_effects),
    'warnings', to_jsonb(m.warnings),
    'interactions', to_jsonb(m.interactions),
    'storage', m.storage,
    'isDemo', m.is_demo
  );
$$;

/*
  Verdicts
    genuine      product, batch and serial all match the manufacturer record
    expired      genuine but past its expiry date
    alert        the batch is recalled / Not of Standard Quality / spurious
    cloned       the serial is real but has been verified an abnormal number of times
    suspicious   product is registered but batch, serial or expiry do not match
    unknown      product code is not in the registry at all
*/
create or replace function public.verify_medicine(
  p_gtin text,
  p_batch text,
  p_serial text,
  p_expiry date,
  p_ip_hash text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_med public.medicines;
  v_batch public.medicine_batches;
  v_unit public.medicine_units;
  v_verdict text;
  v_reasons text[] := '{}';
  v_clone_threshold constant int := 25;
begin
  perform private.check_rate('verify', p_ip_hash, 60, interval '10 minutes', 5000);

  if random() < 0.02 then
    delete from public.medicine_scans where created_at < now() - interval '90 days';
  end if;

  p_batch := nullif(upper(trim(p_batch)), '');
  p_serial := nullif(upper(trim(p_serial)), '');

  select * into v_med from public.medicines where gtin = p_gtin;
  if not found then
    v_verdict := 'unknown';
    v_reasons := array['This product code is not in the registry.'];
  else
    if p_batch is not null then
      select * into v_batch from public.medicine_batches
      where medicine_id = v_med.id and upper(batch_no) = p_batch;
    end if;

    if p_batch is null then
      v_verdict := 'suspicious';
      v_reasons := array['No batch number was read from the pack, so the batch cannot be checked.'];
    elsif v_batch.id is null then
      v_verdict := 'suspicious';
      v_reasons := array['The manufacturer never issued this batch number for this product.'];
    elsif v_batch.status <> 'ok' then
      v_verdict := 'alert';
      v_reasons := array[coalesce(v_batch.status_note, 'This batch has been flagged by the regulator.')];
    elsif p_expiry is not null and p_expiry <> v_batch.expiry_date then
      v_verdict := 'suspicious';
      v_reasons := array['The expiry date printed on the pack does not match the manufacturer record.'];
    else
      if p_serial is not null then
        select * into v_unit from public.medicine_units where serial = p_serial;
      end if;

      if p_serial is not null and v_unit.serial is null then
        v_verdict := 'suspicious';
        v_reasons := array['This serial number was never issued by the manufacturer.'];
      elsif v_unit.serial is not null and v_unit.batch_id <> v_batch.id then
        v_verdict := 'suspicious';
        v_reasons := array['This serial number belongs to a different batch.'];
      else
        if v_unit.serial is not null and v_unit.track_scans then
          update public.medicine_units
            set scan_count = scan_count + 1,
                first_scanned_at = coalesce(first_scanned_at, now()),
                last_scanned_at = now()
            where serial = v_unit.serial
            returning * into v_unit;
        end if;

        if v_unit.serial is not null and v_unit.scan_count > v_clone_threshold then
          v_verdict := 'cloned';
          v_reasons := array[format(
            'This exact code has been verified %s times. A genuine pack is normally checked only a few times, so the code may have been copied onto fake packs.',
            v_unit.scan_count)];
        elsif v_batch.expiry_date < current_date then
          v_verdict := 'expired';
          v_reasons := array['This batch is genuine but expired. Do not use it.'];
        else
          v_verdict := 'genuine';
          v_reasons := array['Product, batch and serial match the manufacturer record.'];
          if p_serial is null then
            v_reasons := v_reasons || 'No serial number was read, so this specific pack could not be checked.';
          end if;
        end if;
      end if;
    end if;
  end if;

  insert into public.medicine_scans (gtin, batch_no, serial, verdict, ip_hash)
  values (left(p_gtin, 14), left(p_batch, 40), left(p_serial, 40), v_verdict, p_ip_hash);

  return jsonb_build_object(
    'verdict', v_verdict,
    'reasons', to_jsonb(v_reasons),
    'medicine', case when v_med.id is null then null else private.medicine_json(v_med) end,
    'batch', case when v_batch.id is null then null else jsonb_build_object(
      'batchNo', v_batch.batch_no,
      'mfgDate', v_batch.mfg_date,
      'expiryDate', v_batch.expiry_date,
      'status', v_batch.status
    ) end,
    'unit', case when v_unit.serial is null then null else jsonb_build_object(
      'scanCount', v_unit.scan_count,
      'firstScannedAt', v_unit.first_scanned_at
    ) end
  );
end;
$$;

create or replace function public.search_medicines(p_query text, p_ip_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_q text := trim(coalesce(p_query, ''));
  v_pattern text;
begin
  perform private.check_rate('search', p_ip_hash, 60, interval '10 minutes', 5000);

  if char_length(v_q) < 2 or char_length(v_q) > 60 then
    return '[]'::jsonb;
  end if;
  -- Escape LIKE wildcards so the query is matched literally.
  v_pattern := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';

  return coalesce((
    select jsonb_agg(private.medicine_json(m) order by m.brand_name)
    from (
      select * from public.medicines m
      where m.brand_name ilike v_pattern
         or m.generic_name ilike v_pattern
         or m.gtin = v_q
      limit 10
    ) m
  ), '[]'::jsonb);
end;
$$;

create or replace function public.report_medicine(
  p_gtin text,
  p_batch text,
  p_serial text,
  p_raw_code text,
  p_reason text,
  p_details text,
  p_city text,
  p_ip_hash text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_rate('report', p_ip_hash, 5, interval '1 hour', 300);

  insert into public.medicine_reports (gtin, batch_no, serial, raw_code, reason, details, city, ip_hash)
  values (
    nullif(trim(p_gtin), ''),
    nullif(upper(trim(p_batch)), ''),
    nullif(upper(trim(p_serial)), ''),
    nullif(p_raw_code, ''),
    p_reason,
    nullif(trim(p_details), ''),
    nullif(trim(p_city), ''),
    p_ip_hash
  );
end;
$$;

-- Only the public entry points are callable, and only by the API roles.
revoke all on function private.check_rate(text, text, int, interval, int) from public, anon, authenticated;
revoke all on function private.medicine_json(public.medicines) from public, anon, authenticated;

revoke all on function public.join_waitlist(text, text, text, text, text) from public;
revoke all on function public.send_contact_message(text, text, text, text, text) from public;
revoke all on function public.verify_medicine(text, text, text, date, text) from public;
revoke all on function public.search_medicines(text, text) from public;
revoke all on function public.report_medicine(text, text, text, text, text, text, text, text) from public;

grant execute on function public.join_waitlist(text, text, text, text, text) to anon, authenticated;
grant execute on function public.send_contact_message(text, text, text, text, text) to anon, authenticated;
grant execute on function public.verify_medicine(text, text, text, date, text) to anon, authenticated;
grant execute on function public.search_medicines(text, text) to anon, authenticated;
grant execute on function public.report_medicine(text, text, text, text, text, text, text, text) to anon, authenticated;
