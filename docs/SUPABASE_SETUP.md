# Supabase setup (separate account)

Use your **After Class waitlist** Supabase account (not the marketing-site account).

## 1. Create project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard) with your waitlist account.
2. **New project** → name it `afterclass-waitlist`.
3. Pick a region close to your users and set a database password (save it somewhere safe).

## 2. Run migration

1. Open **SQL Editor** → **New query**.
2. Paste the contents of [`supabase/migrations/001_waitlist_signups.sql`](../supabase/migrations/001_waitlist_signups.sql).
3. Click **Run**.

You should see a `waitlist_signups` table under **Table Editor** with columns: `id`, `email`, `created_at`.

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
2. Submit a test email → row appears in **Table Editor → waitlist_signups**.
3. Submit the same email again → UI shows "You're already on the list."

## 6. Vercel production env

In the **afterclass-waitlist** Vercel project → **Settings → Environment Variables**, add the same four vars for **Production** (and Preview if you want forms to work on preview URLs).
