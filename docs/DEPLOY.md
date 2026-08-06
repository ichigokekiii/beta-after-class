# Deploy to Vercel

## 1. Import repo

1. [vercel.com/new](https://vercel.com/new) → import **sethski/afterclass-waitlist**.
2. Framework preset: **Next.js** (auto-detected).
3. Do not deploy yet — add env vars first.

## 2. Environment variables

**Settings → Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://join.afterclassapp.com` |
| `NEXT_PUBLIC_MARKETING_URL` | `https://afterclassapp.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your waitlist Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from that project |

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for where to find Supabase keys.

## 3. Deploy

Click **Deploy** (or push to `master` if Git integration is connected).

## 4. Custom domain

1. Project → **Settings → Domains**.
2. Add `join.afterclassapp.com`.
3. At your DNS host, add the record Vercel shows (typically):

   ```
   Type: CNAME
   Name: join
   Value: cname.vercel-dns.com
   ```

4. Wait for DNS + SSL (usually a few minutes).

## 5. Marketing site

On your **afterclass-website** Vercel project, confirm:

```
NEXT_PUBLIC_WAITLIST_URL=https://join.afterclassapp.com
```

Marketing CTAs already link out via that env var.

## CLI alternative

```bash
npm i -g vercel@latest
vercel login
cd afterclass-waitlist
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_MARKETING_URL
vercel --prod
```
