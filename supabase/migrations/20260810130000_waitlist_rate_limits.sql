-- Durable IP rate limits for waitlist signup (shared across serverless instances).
-- App stores HMAC(ip) only — never raw IP addresses.

create table if not exists public.waitlist_rate_limits (
  ip_hash text primary key,
  attempt_count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.waitlist_rate_limits enable row level security;

-- No policies for anon/authenticated — only service role (bypasses RLS) may use this table.
revoke all on public.waitlist_rate_limits from anon, authenticated;

create or replace function public.consume_waitlist_rate_limit(
  p_ip_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.waitlist_rate_limits%rowtype;
  v_now timestamptz := now();
begin
  if p_ip_hash is null or length(p_ip_hash) < 8 then
    return false;
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  select * into v_row
  from public.waitlist_rate_limits
  where ip_hash = p_ip_hash
  for update;

  if not found then
    insert into public.waitlist_rate_limits (ip_hash, attempt_count, window_start)
    values (p_ip_hash, 1, v_now);
    return true;
  end if;

  if v_now - v_row.window_start > make_interval(secs => p_window_seconds) then
    update public.waitlist_rate_limits
    set attempt_count = 1,
        window_start = v_now
    where ip_hash = p_ip_hash;
    return true;
  end if;

  if v_row.attempt_count >= p_limit then
    return false;
  end if;

  update public.waitlist_rate_limits
  set attempt_count = attempt_count + 1
  where ip_hash = p_ip_hash;

  return true;
end;
$$;

revoke all on function public.consume_waitlist_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_waitlist_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.consume_waitlist_rate_limit(text, integer, integer) to service_role;
