# After Class Waitlist

Email-only waitlist for [After Class](https://afterclassapp.com), served at `join.afterclassapp.com`.

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion, Zod, Supabase

## Local development

```bash
npm install
cp .env.example .env.local
# Add Supabase keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Supabase

1. Create a Supabase project (e.g. `afterclass-waitlist`)
2. Run [`supabase/migrations/001_waitlist_signups.sql`](supabase/migrations/001_waitlist_signups.sql) in the SQL Editor
3. Set env vars:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Deploy (Vercel)

1. Import this repo in Vercel
2. Set env vars from `.env.example`
3. Add domain `join.afterclassapp.com` and configure DNS (CNAME to Vercel)

## Marketing site

The main site at `afterclassapp.com` links here via `NEXT_PUBLIC_WAITLIST_URL=https://join.afterclassapp.com`.
