# Waitlist deploy checklist (origin-replica)

## Shared Supabase (friend's project)

This app uses a **shared/friend-owned** Supabase project. Do not create a separate project unless you intentionally switch.

1. Ask your friend for (server-only unless noted):
   - `NEXT_PUBLIC_SUPABASE_URL` (public)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never commit, never put in client code)
2. Set `supabase/config.toml` `project_id` to their project ref (the subdomain of `*.supabase.co`).
3. Have your friend (or anyone with dashboard access) apply migrations in the **SQL Editor** of that project, in order:

```text
supabase/migrations/20260810120000_waitlist.sql
supabase/migrations/20260810130000_waitlist_rate_limits.sql
supabase/migrations/20260810140000_lock_down_waitlist_insert.sql
```

Or from a machine linked to their project:

```bash
supabase link --project-ref <their-project-ref>
supabase db push
```

After lock-down, anon REST inserts into `waitlist` must fail. Only the Next.js API (service role) can write.

## Vercel environment variables

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Friend's project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Friend's service role key — never expose |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Server only | Cloudflare Turnstile secret |
| `RATE_LIMIT_HMAC_SECRET` | Server only | Long random string for IP hashing |
| `RESEND_API_KEY` | Server only | Signup alerts |
| `WAITLIST_NOTIFY_TO` | Server only | Inbox for alerts |
| `WAITLIST_NOTIFY_FROM` | Server only | Verified Resend from address |
| `NEXT_PUBLIC_MAPTILER_KEY` | Public | Restrict by referrer in MapTiler |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site URL |
| `NEXT_PUBLIC_MARKETING_URL` | Public | Marketing site |

Copy from `.env.example`. Do not commit `.env.local`.

## Local setup

1. Copy `.env.example` → `origin-replica/.env.local`.
2. Paste friend's Supabase URL + service role key.
3. Generate `RATE_LIMIT_HMAC_SECRET` (e.g. `openssl rand -hex 32`).
4. Create a Turnstile widget for your local + production hostnames.
5. `cd origin-replica && npm install && npm run dev`
6. `npm run test:security`

## Smoke test after deploy

1. Submit a valid email with Turnstile completed → `{ ok: true }`.
2. Resubmit same email → identical `{ ok: true }` (no `alreadyJoined`).
3. Direct Supabase REST insert with anon key → should be denied.
4. Rapid POSTs without Turnstile → 400; with Turnstile past limit → 429.
