-- Gate every public RPC behind a server-only token.
--
-- The publishable key is, by design, not a secret. So the real logic moves to
-- the unexposed `private` schema, and the public functions become thin
-- wrappers that first check a token only the Next.js server holds
-- (env WEB_RPC_TOKEN). The database stores just its SHA-256, set once with:
--
--   insert into private.app_config (key, value)
--   values ('web_rpc_token_sha256', encode(sha256(convert_to('<token>', 'UTF8')), 'hex'))
--   on conflict (key) do update set value = excluded.value;

create table if not exists private.app_config (
  key text primary key,
  value text not null
);
alter table private.app_config enable row level security;
revoke all on private.app_config from public, anon, authenticated;

create or replace function private.assert_server(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
begin
  select value into v_hash from private.app_config where key = 'web_rpc_token_sha256';
  if v_hash is null
     or p_token is null
     or encode(sha256(convert_to(p_token, 'UTF8')), 'hex') <> v_hash then
    raise exception 'forbidden' using errcode = 'PT403';
  end if;
end;
$$;
revoke all on function private.assert_server(text) from public, anon, authenticated;

-- Move the implementations out of the exposed API schema.
alter function public.join_waitlist(text, text, text, text, text) set schema private;
alter function public.send_contact_message(text, text, text, text, text) set schema private;
alter function public.verify_medicine(text, text, text, date, text) set schema private;
alter function public.search_medicines(text, text) set schema private;
alter function public.report_medicine(text, text, text, text, text, text, text, text) set schema private;

revoke all on function private.join_waitlist(text, text, text, text, text) from public, anon, authenticated;
revoke all on function private.send_contact_message(text, text, text, text, text) from public, anon, authenticated;
revoke all on function private.verify_medicine(text, text, text, date, text) from public, anon, authenticated;
revoke all on function private.search_medicines(text, text) from public, anon, authenticated;
revoke all on function private.report_medicine(text, text, text, text, text, text, text, text) from public, anon, authenticated;

-- Thin, token-checked public wrappers.
create function public.join_waitlist(
  p_token text, p_email text, p_name text, p_interest text, p_consent_version text, p_ip_hash text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_server(p_token);
  perform private.join_waitlist(p_email, p_name, p_interest, p_consent_version, p_ip_hash);
end;
$$;

create function public.send_contact_message(
  p_token text, p_name text, p_email text, p_topic text, p_message text, p_ip_hash text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_server(p_token);
  perform private.send_contact_message(p_name, p_email, p_topic, p_message, p_ip_hash);
end;
$$;

create function public.verify_medicine(
  p_token text, p_gtin text, p_batch text, p_serial text, p_expiry date, p_ip_hash text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_server(p_token);
  return private.verify_medicine(p_gtin, p_batch, p_serial, p_expiry, p_ip_hash);
end;
$$;

create function public.search_medicines(p_token text, p_query text, p_ip_hash text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_server(p_token);
  return private.search_medicines(p_query, p_ip_hash);
end;
$$;

create function public.report_medicine(
  p_token text, p_gtin text, p_batch text, p_serial text, p_raw_code text,
  p_reason text, p_details text, p_city text, p_ip_hash text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_server(p_token);
  perform private.report_medicine(p_gtin, p_batch, p_serial, p_raw_code, p_reason, p_details, p_city, p_ip_hash);
end;
$$;

revoke all on function public.join_waitlist(text, text, text, text, text, text) from public;
revoke all on function public.send_contact_message(text, text, text, text, text, text) from public;
revoke all on function public.verify_medicine(text, text, text, text, date, text) from public;
revoke all on function public.search_medicines(text, text, text) from public;
revoke all on function public.report_medicine(text, text, text, text, text, text, text, text, text) from public;

grant execute on function public.join_waitlist(text, text, text, text, text, text) to anon;
grant execute on function public.send_contact_message(text, text, text, text, text, text) to anon;
grant execute on function public.verify_medicine(text, text, text, text, date, text) to anon;
grant execute on function public.search_medicines(text, text, text) to anon;
grant execute on function public.report_medicine(text, text, text, text, text, text, text, text, text) to anon;

-- Supabase's default privileges also grant new functions to `authenticated`.
revoke all on function public.join_waitlist(text, text, text, text, text, text) from authenticated;
revoke all on function public.send_contact_message(text, text, text, text, text, text) from authenticated;
revoke all on function public.verify_medicine(text, text, text, text, date, text) from authenticated;
revoke all on function public.search_medicines(text, text, text) from authenticated;
revoke all on function public.report_medicine(text, text, text, text, text, text, text, text, text) from authenticated;
