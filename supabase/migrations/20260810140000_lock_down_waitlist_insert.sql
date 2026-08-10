-- Drop public INSERT so anon/authenticated cannot write via REST.
-- Waitlist inserts must go through the Next.js API with the service role key.

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist;

revoke insert on public.waitlist from anon, authenticated;
revoke select, update, delete on public.waitlist from anon, authenticated;
