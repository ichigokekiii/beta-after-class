# Supabase setup (separate account)

Use your **After Class waitlist** Supabase account (not the marketing-site account).

## 1. Create project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard) with your waitlist account.
2. **New project** → name it `afterclass-waitlist`.
3. Pick a region close to your users and set a database password (save it somewhere safe).

## 2. Run migrations

1. Open **SQL Editor** → **New query**.
2. Paste and run [`supabase/migrations/001_waitlist_signups.sql`](../supabase/migrations/001_waitlist_signups.sql).
3. Paste and run [`supabase/migrations/002_waitlist_rate_limits.sql`](../supabase/migrations/002_waitlist_rate_limits.sql).
4. Paste and run [`supabase/migrations/003_waitlist_edu_ph_email.sql`](../supabase/migrations/003_waitlist_edu_ph_email.sql).

You should see:
- `waitlist_signups` (`id`, `email`, `created_at`) with a `.edu.ph` check constraint
- `waitlist_rate_limits` (`key`, `hit_count`, `window_started_at`)
- function `consume_waitlist_rate_limit` (used by the server action; **5 tries / IP / 15 min**)

Only **`.edu.ph` school emails** are accepted (e.g. `name@up.edu.ph`).

If production already ran earlier migrations, run any missing ones (`002`, `003`) before deploying.

## 3. Copy API keys

**Project Settings → API**

| Key | Where it goes |
|-----|----------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `service_role` (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

Never commit the service role key. Do not prefix it with `NEXT_PUBLIC_`.

## 4. Local env

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SITE_URL=https://join.afterclassapp.com
NEXT_PUBLIC_MARKETING_URL=https://afterclassapp.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart `npm run dev` after saving.

## 5. Smoke test

1. Open [http://localhost:3000](http://localhost:3000).
2. Submit a `.edu.ph` email (e.g. `you@up.edu.ph`) → row appears in **Table Editor → waitlist_signups**.
3. Submit a Gmail address → UI shows "Use your .edu.ph school email".
4. Submit the same school email again → UI shows "You're already on the list."
5. Submit 5+ different `.edu.ph` emails quickly → UI shows "Too many tries…" after the limit.

## 6. Vercel production env

In the **afterclass-waitlist** Vercel project → **Settings → Environment Variables**, add the same four vars for **Production** (and Preview if you want forms to work on preview URLs).
