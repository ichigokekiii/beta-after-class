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

Use your **waitlist-only** Supabase account. Full steps: [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

Migration file: [`supabase/migrations/001_waitlist_signups.sql`](supabase/migrations/001_waitlist_signups.sql)

## Deploy (Vercel)

Full steps: [`docs/DEPLOY.md`](docs/DEPLOY.md) — import repo, set env vars, attach `join.afterclassapp.com`.

## Marketing site

The main site at `afterclassapp.com` links here via `NEXT_PUBLIC_WAITLIST_URL=https://join.afterclassapp.com`.
