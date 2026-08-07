-- Per-IP (hashed) sliding fixed-window counters for waitlist spam control.
-- Server uses service role; no public policies.

create table if not exists waitlist_rate_limits (
  key text primary key,
  hit_count integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table waitlist_rate_limits enable row level security;

create or replace function public.consume_waitlist_rate_limit(
  p_key text,
  p_max_hits integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row waitlist_rate_limits%rowtype;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return false;
  end if;

  if p_max_hits < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into waitlist_rate_limits (key, hit_count, window_started_at)
  values (p_key, 0, now())
  on conflict (key) do nothing;

  select * into v_row
  from waitlist_rate_limits
  where key = p_key
  for update;

  if v_row.window_started_at <= now() - make_interval(secs => p_window_seconds) then
    update waitlist_rate_limits
    set hit_count = 1,
        window_started_at = now()
    where key = p_key;
    return true;
  end if;

  if v_row.hit_count >= p_max_hits then
    return false;
  end if;

  update waitlist_rate_limits
  set hit_count = hit_count + 1
  where key = p_key;

  return true;
end;
$$;

revoke all on function public.consume_waitlist_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_waitlist_rate_limit(text, integer, integer) to service_role;
