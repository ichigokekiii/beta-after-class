-- New waitlist schema (origin-replica branch)
-- No public INSERT policies. Writes go through the API with the service role.

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
