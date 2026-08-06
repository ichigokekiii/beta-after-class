create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Block public/anon access; server uses service role (bypasses RLS)
alter table waitlist_signups enable row level security;
