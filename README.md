# Union v2

Next.js 14 (App Router) application for the Union membership platform: video lessons, collective readings, psychology tests, community, coaching bookings, and manual subscription payments.

## Quickstart

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill in all variables (see below).

3. **Supabase**

   Apply migrations under `supabase/migrations/` to your Supabase project (SQL editor or Supabase CLI).

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Production build**

   ```bash
   npm run build
   npm start
   ```

6. **Typecheck**

   ```bash
   npx tsc --noEmit
   ```

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (OAuth redirects, presigned fetch). Example: `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server only**; never expose to the browser |
| `RESEND_API_KEY` | Resend API for transactional email |
| `EMAIL_FROM` | From address for Resend (e.g. `Union <noreply@your-domain.mn>`) |
| `CRON_SECRET` | Shared secret for `/api/cron/*` (Vercel sends `Authorization: Bearer …`) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | Cloudflare R2 for video storage and presigned upload/download |

Optional: `R2_PUBLIC_HOST` if you serve objects from a custom domain.

## Seeding / test users by subscription status

Use the Supabase **SQL editor** (with service role or as an admin) to adjust a real auth user’s profile row. Replace `:user_id` with the UUID from `auth.users` / `profiles.id`.

- **inactive** (default for new users)

  ```sql
  update profiles
  set subscription_status = 'inactive',
      subscription_expires_at = null
  where id = ':user_id';
  ```

- **pending** (submitted payment, awaiting admin)

  ```sql
  update profiles
  set subscription_status = 'pending',
      subscription_expires_at = null
  where id = ':user_id';
  ```

- **active** (paid subscriber; set future expiry)

  ```sql
  update profiles
  set subscription_status = 'active',
      subscription_expires_at = (now() + interval '30 days')
  where id = ':user_id';
  ```

- **denied**

  ```sql
  update profiles
  set subscription_status = 'denied',
      subscription_expires_at = null
  where id = ':user_id';
  ```

- **expired**

  ```sql
  update profiles
  set subscription_status = 'expired',
      subscription_expires_at = (now() - interval '1 day')
  where id = ':user_id';
  ```

- **Admin bypass** — set `role = 'admin'` on the profile (and keep sensible `subscription_status` / expiry as you prefer). Admin routes check `role` via middleware.

> Triggers may restrict some updates when using the anon key; prefer the dashboard SQL editor with sufficient privilege or `createAdminClient`-style updates on the server.

## Triggering crons locally

All cron routes expect:

`Authorization: Bearer <CRON_SECRET>`

Examples (PowerShell uses `curl` as an alias for `Invoke-WebRequest` — use real `curl.exe` if needed):

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" ^
  http://localhost:3000/api/cron/subscription-expire
```

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" ^
  http://localhost:3000/api/cron/subscription-expiring
```

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" ^
  http://localhost:3000/api/cron/coaching-cleanup
```

## Project layout (high level)

- `app/` — routes, server actions, API routes, `loading.tsx` / `error.tsx`
- `components/` — UI (shell, dashboard, admin, marketing, …)
- `lib/` — Supabase clients, queries, email, R2, validation, i18n helpers
- `supabase/migrations/` — schema and RLS

## Documentation

- `MOBILE-QA.md` — responsive / mobile QA checklist (viewport sizes and flows).
# UnionV2
