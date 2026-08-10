-- Waitlist table hardening notes (run in Supabase SQL Editor if recreating)
-- Insert-only for anon. No select/update/delete policies for public roles.

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

create policy "Anyone can join waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Explicitly deny reads/mutations from anon via missing policies.
-- Service role / dashboard still has full access.
