-- Waitlist schema (origin-replica). Apply via supabase/migrations/ in order.
-- Inserts only via service role from the Next.js API. No anon write path.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (
    email ~ '^[a-z0-9]+([._+-][a-z0-9]+)*@[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.[a-z]{2,}$'
    and char_length(email) <= 254
  )
);

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist;

revoke insert on public.waitlist from anon, authenticated;
revoke select, update, delete on public.waitlist from anon, authenticated;

-- Rate limits (HMAC of IP only). See migration 20260810130000_waitlist_rate_limits.sql.
create table if not exists public.waitlist_rate_limits (
  ip_hash text primary key,
  attempt_count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.waitlist_rate_limits enable row level security;
revoke all on public.waitlist_rate_limits from anon, authenticated;
