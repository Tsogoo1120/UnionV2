
# CLAUDE.md — unionV2 project memory

This file gives Claude Code (and any new contributor) the minimum context to be useful on this codebase. Keep it short and current; if a convention changes, update this file in the same commit.

---

## Stack

Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind. Backend on Supabase (Postgres + RLS + Storage + Auth). Cloudflare R2 (S3-compatible) for video files. Resend for transactional email. Deployed on Vercel. UI is Mongolian.

## Conventions

- **Path alias**: `@/*` resolves to project root (see `tsconfig.json`). Always import via `@/lib/...`, `@/components/...`, not relative `../../`.
- **RLS-first**: every Supabase query must work under Row-Level Security. Use the appropriate client:
  - `@/lib/supabase/client` — browser, anon key, RLS-enforced.
  - `@/lib/supabase/server` — server components / actions, anon key, RLS-enforced, reads cookies.
  - `@/lib/supabase/admin` — service-role, bypasses RLS, **server-only**, use sparingly.
- **Queries centralized**: never call `supabase.from(...)` in components. All DB access goes through `@/lib/queries/*`. New queries belong there.
- **Server Actions**: under `app/actions/*`, return shape `{ ok: true, ... } | { ok: false, code: string, fieldErrors?: Record<string,string> }`. Errors map to Mongolian via `@/lib/i18n/action-feedback`.
- **Route guards**: do not re-implement auth in pages. Use `requireSession()`, `requireActive()`, `requireAdmin()` from `@/lib/auth`. The middleware (`middleware.ts`) gates routes at the edge as a defense layer; the in-page helpers still verify on the server.
- **Validation**: Zod schemas in `@/lib/validation/client-forms` for forms; reuse on server actions for parity.

## Payment flow (non-obvious)

This is **not** a Stripe integration. Subscriptions are paid by manual bank transfer:
1. User visits `/payment`, sees bank info from `@/lib/constants.PAYMENT_INFO`, uploads a transfer screenshot (R2 bucket `payment-screenshots`).
2. Row created in `payments` table with `status = 'submitted'`.
3. Admin reviews in `/admin/dashboard` → approves or denies. Approval flips subscription to active.

Coaching bookings follow the same pattern in the `coaching_bookings` table.

## Where things live

```
app/
  actions/      Server actions (mutations). One file per resource.
  api/          API routes — cron jobs (`/api/cron/*`) + R2 presigners.
  admin/        Admin dashboard (gated by requireAdmin).
  auth/         Sign-in, onboarding, OAuth callback.
  status/       Subscription state pages (pending/expired/inactive/denied).
  dev/          Dev-only sanity pages. Gitignored. Middleware blocks in prod.
components/     UI by feature folder + shared `shell/` + `ui/`.
lib/
  supabase/     Clients + env validation.
  auth/         Session guards + effective status logic.
  queries/      All DB reads (one file per resource).
  email/        Resend client + templates.
  r2/           S3 SDK + presign helpers.
  validation/   Zod schemas.
middleware.ts   Route gates (dev/admin/active/session).
supabase/migrations/  Schema source of truth. Applied via Supabase Dashboard.
union-design-system/  Tokens + preview HTML; not bundled into the app.
```

## Run / test / deploy

- `npm run dev` — local dev server (http://localhost:3000)
- `npm run lint` — ESLint (must pass for prod build)
- `npm run typecheck` — strict TS check
- `npm run build` — production build
- No automated test framework wired yet — Vitest + Playwright are the planned choice (see `.claude/plans/` for the health-check plan).

### Env vars (12 required)

All in `.env.example`. The 5 R2 keys + `CRON_SECRET` are easy to forget on fresh setups.

### Vercel cron schedules (in `vercel.json`)

- `0 9 * * *` → subscription-expiring (notify upcoming expirations)
- `0 0 * * *` → subscription-expire (mark expired)
- `*/15 * * * *` → coaching-cleanup (purge past coaching bookings)

Each cron route validates `Authorization: Bearer ${CRON_SECRET}` via `app/api/cron/_shared.ts`.

## Gotchas

- **Windows + OneDrive + npm**: file locks from a running dev server can break `npm ci`. Stop dev before clean installs.
- **Next-SWC binary**: same as above — antivirus or VS Code TS server can hold it.
- **CRLF**: git is configured to autocrlf on this Windows box; expect CRLF warnings on `git add` for new text files. Harmless.
- **`design-fetch.bin`** in repo root is intentionally untracked — confirm with the author before committing.
- **N+1 in community feed**: `app/community/page.tsx` issues 20 `createSignedUrl` calls per page load. Acceptable today; batch if scaling.
- **Mongolian copy**: user-facing strings are Mongolian. When adding new copy, mirror the tone of existing files; do not auto-translate from English.
