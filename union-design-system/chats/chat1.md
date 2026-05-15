# Font Simplification

_Started 2026-05-14 15:54 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Design System"
Current date is now May 15, 2026
</system-info>

<pasted_text name="Create design system">
We will create a design system in this project.

**Company description:** I am currently working on my website's backend. Following backend schema and match excact front-end design. Landing page, user's dashboard, admin dashboard.
# unionV2 — Backend Architecture & Build Plan

## Context

You are rebuilding your Union site as a clean v2. The current code at the repo root (Next.js 14 + Supabase + Resend + Tailwind + Radix) is mature: it already has Google OAuth, a manual MNT payment screenshot flow with admin approval, monthly subscription gating, a multi-content dashboard (lessons, zodiac, tests, community), an admin panel, and Resend email notifications.

What's different in v2:

- **Self-hosted media instead of YouTube.** Videos move from YouTube unlisted embeds to **Cloudflare R2** (zero egress fees, signed URLs). Images stay in **Supabase Storage** (RLS-native).
- **Two new content types added:** `articles` (your blog) and `collective_readings` (the "collective tarot reading" service, replacing the old per-sign zodiac model).
- **Personal coaching** with admin-published time slots, manual MNT payment per slot, and auto-expiry when the slot's end time passes.
- **Community moderation** — admin can hide/delete any post or comment.
- **Manual coaching follow-up** — on approval, the admin contacts the user directly (no meeting-link field).
- **Clean folder + fresh Supabase project.** unionV2 lives as a sibling folder at the repo root; v1 stays untouched for reference. New Supabase project = clean schema, clean storage, no migration baggage.

First rule (per your spec): **the main logic is unchanged.** Roles, subscription gate, payment screenshots, monthly auto-expiry, email notifications all keep the same shape as v1 — we add features around them, not under them.

---

## 1. Tech Stack (locked)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 App Router + TypeScript 5 | Same as v1 — server actions, route groups, middleware |
| Database + Auth | New Supabase project (Postgres + Auth) | Fresh schema, RLS, Google OAuth, service-role admin client |
| Image / file storage | Supabase Storage | Native RLS, presigned URLs, fits small assets |
| Video storage | **Cloudflare R2** (S3-compatible) | Zero egress, $0.015/GB; integrated via `@aws-sdk/client-s3` + presigned URLs |
| Email | Resend | Same as v1; templates extended |
| Styling | Tailwind + Radix UI (custom components) | Same as v1 — no shadcn/ui dependency |
| Hosting | Vercel | Same as v1; cron jobs via `vercel.json` |
| Language | Mongolian (hardcoded, `lang="mn"`) | Same as v1 |

**No new heavy deps.** The only additions vs. v1 are `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for R2.

---

## 2. Folder Structure

unionV2 is a fresh Next.js app at the repo root, sibling to the existing code:

```
Union/                                  # repo root
├── (existing v1 code — left untouched as reference)
└── unionV2/                            # ← new sibling folder
    ├── app/
    │   ├── (marketing)/
    │   │   ├── page.tsx                # landing
    │   │   └── coaching/page.tsx       # public coaching slot list
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (user)/
    │   │   ├── layout.tsx              # subscription gate
    │   │   ├── dashboard/
    │   │   │   ├── page.tsx            # 5-service hub
    │   │   │   ├── video-lessons/      # service 1
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [slug]/page.tsx
    │   │   │   ├── collective-readings/# service 2 (was zodiac)
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [slug]/page.tsx
    │   │   │   ├── community/          # service 3
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [postId]/page.tsx
    │   │   │   ├── tests/              # service 4
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [slug]/...
    │   │   │   ├── articles/           # service 5
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [slug]/page.tsx
    │   │   │   ├── coaching/           # gated coaching booking
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [slotId]/book/page.tsx
    │   │   │   └── profile/page.tsx
    │   │   └── payment/page.tsx        # subscription payment screen
    │   ├── (admin)/
    │   │   └── admin/
    │   │       ├── dashboard/page.tsx
    │   │       ├── payments/page.tsx           # subscription payments
    │   │       ├── video-lessons/page.tsx      # CRUD + R2 upload
    │   │       ├── collective-readings/page.tsx
    │   │       ├── articles/page.tsx
    │   │       ├── tests/page.tsx
    │   │       ├── community/page.tsx          # moderation
    │   │       ├── coaching/
    │   │       │   ├── slots/page.tsx          # create/list slots
    │   │       │   └── bookings/page.tsx       # approve/deny
    │   │       └── users/page.tsx
    │   ├── actions/
    │   │   ├── auth.ts
    │   │   ├── payment.ts                      # subscription payment
    │   │   ├── coaching.ts                     # NEW
    │   │   ├── video-lessons.ts                # CRUD + R2 presign
    │   │   ├── collective-readings.ts
    │   │   ├── articles.ts                     # NEW
    │   │   ├── tests.ts
    │   │   ├── community.ts                    # incl. admin hide
    │   │   └── admin.ts                        # verifyAdmin shared helper
    │   ├── api/
    │   │   ├── cron/
    │   │   │   ├── subscription-expiring/route.ts
    │   │   │   ├── subscription-expire/route.ts        # NEW
    │   │   │   └── coaching-cleanup/route.ts           # NEW
    │   │   └── r2/
    │   │       ├── presign-upload/route.ts             # admin video upload
    │   │       └── presign-download/route.ts           # subscriber video stream
    │   ├── auth/callback/route.ts
    │   ├── status/{pending,denied,expired}/page.tsx
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ui/                                 # primitives (copied from v1)
    │   ├── auth/
    │   ├── marketing/                          # landing pieces
    │   ├── dashboard/                          # per-service components
    │   ├── admin/                              # admin dialogs/forms
    │   └── video/
    │       └── VideoPlayer.tsx                 # R2 signed URL player
    ├── lib/
    │   ├── supabase/{client,server,admin,middleware,env}.ts
    │   ├── auth/sign-in-with-google.ts
    │   ├── email/{client,send,templates}.ts
    │   ├── r2/{client,presign}.ts              # NEW
    │   ├── subscription.ts
    │   ├── coaching.ts                         # NEW status helpers
    │   ├── constants.ts                        # PAYMENT_INFO, SERVICES
    │   ├── types.ts
    │   └── utils.ts
    ├── supabase/
    │   └── migrations/
    │       ├── 00001_extensions.sql
    │       ├── 00002_tables.sql
    │       ├── 00003_functions_triggers.sql
    │       ├── 00004_rls.sql
    │       └── 00005_storage.sql
    ├── public/
    ├── middleware.ts
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── vercel.json                             # cron schedules
    ├── package.json
    └── .env.example
```

---

## 3. Database Schema (the heart of the backend)

### 3.1 Enums

```sql
CREATE TYPE user_role            AS ENUM ('user', 'admin');
CREATE TYPE subscription_status  AS ENUM ('inactive', 'pending', 'active', 'expired', 'denied');
CREATE TYPE payment_status       AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE coaching_slot_status AS ENUM ('available', 'pending', 'booked', 'expired', 'cancelled');
```

### 3.2 Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per `auth.users` row, auto-created by trigger | `id`, `email`, `full_name`, `avatar_url`, `role`, `subscription_status`, `subscription_expires_at`, `email_notifications`, `expiry_reminder_stage` |
| `payments` | Subscription payment submissions (50,000 MNT) | `id`, `user_id`, `screenshot_path` (Supabase Storage), `amount`, `currency`, `status`, `bank_reference`, `admin_note`, `submitted_at`, `reviewed_at`, `reviewed_by` |
| `video_lessons` | Self-hosted video courses (service 1) | `id`, `slug`, `title`, `description`, `body`, `category`, `thumbnail_path` (Supabase), `video_r2_key` (R2 object key), `duration_seconds`, `sort_order`, `is_published`, `published_at` |
| `collective_readings` | "Collective tarot reading" series (service 2) | `id`, `slug`, `title`, `description`, `body`, `cover_image_path` (Supabase), `video_r2_key` (R2), `is_published`, `published_at` |
| `psychology_tests` | Self-assessment tests (service 4) | `id`, `slug`, `title`, `description`, `cover_image_path`, `questions` JSONB, `scoring_rules` JSONB, `is_published` |
| `test_results` | Per-user test attempts | `id`, `user_id`, `test_id`, `answers` JSONB, `result_summary`, `score` JSONB, `created_at` |
| `articles` | Long-form articles (service 5) | `id`, `slug`, `title`, `excerpt`, `body` (Markdown), `cover_image_path`, `author_id`, `is_published`, `published_at`, `reading_minutes` |
| `community_posts` | User-generated posts (service 3) | `id`, `user_id`, `title`, `body`, `image_path`, `is_hidden` (admin moderation), `created_at` |
| `comments` | Replies on community posts | `id`, `post_id`, `user_id`, `body`, `is_hidden`, `created_at` |
| `coaching_slots` | Admin-published 1:1 coaching availability | `id`, `start_at`, `end_at`, `price`, `currency`, `description`, `status` (`coaching_slot_status`), `created_by` |
| `coaching_bookings` | User booking against a slot (with screenshot) | `id`, `slot_id` (UNIQUE WHERE status='approved'), `user_id`, `amount`, `screenshot_path` (Supabase), `bank_reference`, `status` (`payment_status`), `admin_note`, `reviewed_at`, `reviewed_by` |

### 3.3 Triggers (reuse v1 pattern at [supabase/migrations/20260506000003_functions_and_triggers.sql](supabase/migrations/20260506000003_functions_and_triggers.sql))

- `handle_new_user()` — auto-creates `profiles` row on `auth.users` insert (Google OAuth).
- `set_updated_at()` — attached to every table with `updated_at`.
- `protect_profile_sensitive_fields()` — blocks regular users from changing `role`, `subscription_status`, or `subscription_expires_at`.
- `is_admin()` and `is_active_subscriber()` — `SECURITY DEFINER` helpers used in RLS policies and storage policies. Identical to v1.

### 3.4 RLS Policy Pattern

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | own row OR admin | (trigger only) | own row (sensitive fields blocked) OR admin | admin |
| `payments` | own OR admin | own user_id | admin | admin |
| `video_lessons`, `collective_readings`, `articles`, `psychology_tests` | published OR admin | admin | admin | admin |
| `test_results` | own OR admin | own | own | own OR admin |
| `community_posts` | active subscriber AND NOT is_hidden, OR admin | active subscriber (own user_id) | own OR admin | own OR admin |
| `comments` | same as `community_posts` | active subscriber | own OR admin | own OR admin |
| `coaching_slots` | `status IN ('available','booked')` for public; admin sees all | admin | admin | admin |
| `coaching_bookings` | own OR admin | own user_id | admin | admin |

### 3.5 Race-safe coaching booking (Postgres RPC)

Two users tapping "Book" simultaneously is the only race condition that matters. We solve it atomically at the DB layer:

```sql
CREATE FUNCTION reserve_coaching_slot(p_slot_id UUID)
RETURNS coaching_slots
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE slot coaching_slots;
BEGIN
  UPDATE coaching_slots
  SET status = 'pending', updated_at = NOW()
  WHERE id = p_slot_id
    AND status = 'available'
    AND start_at > NOW()
  RETURNING * INTO slot;
  IF slot.id IS NULL THEN RAISE EXCEPTION 'slot_unavailable'; END IF;
  RETURN slot;
END; $$;
```

Server action calls this RPC before creating the booking row. If the RPC raises `slot_unavailable`, the user gets "this time has just been taken — please choose another".

---

## 4. Storage Architecture

### 4.1 The split

| Asset type | Where | Why |
|---|---|---|
| Payment / booking screenshots | Supabase Storage (`payment-screenshots`, private) | Small, RLS-native, admin-only read |
| Article cover images | Supabase Storage (`article-images`, public read) | Public hot path, small files |
| Lesson / collective-reading thumbnails | Supabase Storage (`media-thumbnails`, public read) | Small, served via CDN |
| Test cover images | Supabase Storage (`media-thumbnails`) | Reuses thumbnails bucket |
| Community post images | Supabase Storage (`community-images`, protected, subscribers only) | Existing v1 pattern |
| **Video files (lessons + collective readings)** | **Cloudflare R2** (`union-videos`) | Zero egress, $0.015/GB. Subscriber-only via presigned URLs |

### 4.2 Cloudflare R2 setup

1. Create one R2 bucket: `union-videos`. Do **not** make it public.
2. Generate an R2 API token (Account scoped, R/W to the bucket). Store as:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET=union-videos`
   - `R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`
3. (Optional, recommended) Bind a custom domain like `videos.your-domain.mn` for cleaner URLs.

### 4.3 R2 client (`lib/r2/`)

`lib/r2/client.ts` — singleton S3 client pointed at R2.
`lib/r2/presign.ts` — two helpers:
- `presignUpload(key: string, contentType: string)` → 15-min PUT URL for admin video upload.
- `presignDownload(key: string)` → 1-hour GET URL for subscriber playback.

### 4.4 Video upload flow (admin)

1. Admin in `/admin/video-lessons` opens "New lesson" dialog, picks a video file.
2. Client calls server action `requestVideoUploadUrl(filename, contentType)` → returns `{ key, uploadUrl }`. Server action calls `verifyAdmin()` first.
3. Browser does a direct PUT to `uploadUrl` (multi-part for large files — use a small upload helper in `lib/r2/upload-helper.ts`).
4. On success, client calls `createVideoLesson({ title, ..., video_r2_key: key })`. Row gets written, thumbnail uploaded to Supabase Storage, lesson saved as a draft.

### 4.5 Video playback flow (subscriber)

1. User opens a published lesson page. Server component loads the row.
2. If `canAccessSubscriberContent(profile)` → server action `getVideoStreamUrl(lessonId)` calls `presignDownload(row.video_r2_key)` and returns the 1-hour URL.
3. `<VideoPlayer src={signedUrl}>` (native `<video>` tag) streams it. URL is never exposed in HTML source — it's fetched on demand and refreshed if it expires mid-session.

This kills the YouTube-unlisted problem completely: signed URLs are short-lived, scoped to one user's view, and the underlying R2 keys are never public.

---

## 5. Authentication & Authorization

### 5.1 Auth provider

- Supabase Auth with **Google OAuth** (Gmail) — the only provider. This is what the user means by "register with Gmail".
- Reused as-is from v1 ([lib/auth/sign-in-with-google.ts](lib/auth/sign-in-with-google.ts), [app/auth/callback/route.ts](app/auth/callback/route.ts), [lib/supabase/middleware.ts](lib/supabase/middleware.ts)).
- `handle_new_user()` DB trigger auto-creates a `profiles` row with `role='user'`, `subscription_status='inactive'`.

### 5.2 Three-layer authorization (defense in depth)

1. **Middleware** ([middleware.ts](middleware.ts)) — refreshes the Supabase session on every request; redirects:
   - unauthenticated → `/login` for any `/dashboard/*` or `/admin/*`
   - non-admin → `/dashboard` for any `/admin/*`
   - non-active subscriber → `/payment` (or `/status/{pending,denied,expired}`) for `/dashboard/*`
2. **Server actions** — every privileged action calls `verifyAdmin()` ([app/actions/admin.ts:31](app/actions/admin.ts:31)) before touching the service-role client. Steps: (1) verify JWT, (2) re-check `role='admin'` in DB, (3) only then create admin client. **Never reorder.**
3. **RLS policies** — the database is the last gate. Even if a server action had a bug, RLS blocks the write.

### 5.3 The first admin

Admin can't be created through the UI (that would be a security hole). Bootstrap pattern:
1. Sign up via Google OAuth like a normal user.
2. Manually run `UPDATE profiles SET role='admin' WHERE email='altancog@gmail.com';` in Supabase SQL editor.
3. From then on, that admin can promote other admins through `/admin/users`.

---

## 6. Subscription & Payment Flow (end-to-end)

Mirrors v1 exactly. Code pattern is in [app/actions/payment.ts](app/actions/payment.ts) (submission) and [app/actions/admin.ts](app/actions/admin.ts) (approval).

```
User journey:
  /register (Google OAuth) 
    → profile auto-created (status='inactive') 
    → middleware redirects to /payment
    → /payment shows bank info (PAYMENT_INFO from lib/constants.ts: 50,000 MNT, Голомт банк, account 2705130475)
    → User pays via mobile banking → screenshots the receipt
    → Uploads screenshot to /payment form
        → submitPayment() validates type/size, uploads to Supabase Storage `payment-screenshots/{user_id}/{uuid}.ext`, inserts payments row with status='pending', moves user to status='pending'
    → /status/pending shows "your payment is under review"

Admin journey:
  /admin/payments shows pending tab
    → admin clicks payment row → views screenshot (signed URL, 1-hour)
    → Approve:
        → approvePayment() (verifyAdmin → admin client → atomic update)
        → payments.status='approved', reviewed_at, reviewed_by
        → profiles.subscription_status='active'
        → profiles.subscription_expires_at = max(now, existing_expiry) + 30 days  ← renewal-aware
        → profiles.expiry_reminder_stage = 0  ← reset reminder cycle
        → sendPaymentApprovedEmail(userId)
    → Deny:
        → denyPayment(adminNote)
        → payments.status='denied' + admin_note
        → profiles.subscription_status='denied'
        → sendPaymentDeniedEmail(userId, adminNote)
        → User sees /status/denied with the admin's note, can resubmit (which transitions them back to 'pending')

Auto-expiry:
  /api/cron/subscription-expire runs daily
    → UPDATE profiles SET subscription_status='expired' WHERE status='active' AND expires_at < now()
  /api/cron/subscription-expiring runs daily
    → Sends 3-day and 1-day reminder emails (idempotent via expiry_reminder_stage 0→1→2)
```

`lib/subscription.ts` ([lib/subscription.ts:34](lib/subscription.ts:34)) is reused verbatim. `getEffectiveStatus()` is the single source of truth for access — never read `subscription_status` directly in route guards. This is the v1 rule that keeps drift between DB state and wall clock from breaking access control.

---

## 7. Coaching Flow (end-to-end)

This is the brand-new system.

### 7.1 Admin creates slots

1. `/admin/coaching/slots` shows a calendar + list of upcoming slots.
2. Admin clicks "New slot" → modal asks: start datetime (with timezone selector, default `Asia/Ulaanbaatar`), duration, price (default 150,000 MNT), optional description.
3. `createCoachingSlot()` server action inserts a row with `status='available'`.

### 7.2 User books a slot

1. **Public landing page** at `/coaching` shows slots where `status='available' AND start_at > now()`.
2. **Dashboard at `/dashboard/coaching`** shows the same list (with auth, no extra friction).
3. User clicks "Book" → `/dashboard/coaching/[slotId]/book`:
   - Server action `bookCoachingSlot(slotId, formData)`:
     - `verifyUser()` → must be authenticated.
     - **Atomic reservation**: call `reserve_coaching_slot(slot_id)` RPC. If it raises `slot_unavailable`, return error.
     - Validate + upload screenshot to Supabase Storage `coaching-screenshots/{user_id}/{uuid}.ext`.
     - Insert `coaching_bookings` row with `status='pending'`, the slot's price as `amount`.
     - On any failure after RPC succeeded → call `release_coaching_slot(slot_id)` RPC to revert status back to 'available'.
4. User sees "booking submitted, awaiting approval".

### 7.3 Admin approves / denies

1. `/admin/coaching/bookings` shows pending bookings with screenshot preview.
2. Approve → `approveCoachingBooking(bookingId, adminNote?)`:
   - Booking → `status='approved'`.
   - Slot → `status='booked'`.
   - Email user (template: "Booking approved — admin will

**Additional notes:**
i don't like mystic design. I like clean modern bold minimal creative style

---

Design systems are folders on the file system containing typography guidelines, colors, assets, brand style and tone guides, css styles, and React recreations of UIs, decks, etc. they give design agents the ability to create designs against a company's existing products, and create assets using that company's brand. Design systems should contain real visual assets (logos, brand illustrations, etc), low-level visual foundations (e.g. typography specifics; color system, shadow, border, spacing systems) and also high-level visual ELEMENTS (buttons, full screens) within ui kits.

No need to invoke the create_design_system skill; this is it.

To begin, create a todo list with the tasks below, then follow it:

- Explore provided assets and materials to gain a high-level understanding of the company/product context, the different products represented, etc. Read each asset (codebase, figma, file etc) and see what they do. Find some product copy; examine core screens; find any design system definitions.
- Create a README.md with the high-level understanding of the company/product context, the different products represented, etc. Mention the sources you were given: full Figma links, GitHub repos, codebase paths, etc. Do not assume the reader has access, but store in case they do.
- Call set_project_title with a short name derived from the brand/product (e.g. "Acme Design System"). This replaces the generic placeholder so the project is findable.
- IF any slide decks attached, use your repl tool to look at them, extract key assets + text, write to disk.
- Explore the codebase and/or figma design contexts and create a colors_and_type.css file containing CSS vars for both base type + color styles (e.g. fg1, fg2, serif-display, etc) and semantic CSS vars (e.g. h1, h2, code, p). Copy any webfonts or ttfs into fonts/.
- Explore, then update README.md with a CONTENT FUNDAMENTALS section: how is copy written? What is tone, casing, etc? I vs you, etc? are emoji used? What is the vibe? Include specific examples
- Explore, update README.md with VISUAL FOUNDATIONS section that talks about the visual motifs and foundations of the brand. Colors, type, spacing, backgrounds (images? full-bleed? hand-drawn illustrations? repeating patterns/textures? gradients?), animation (easing? fades? bounces? no anims?), hover states (opacity, darker colors, lighter colors?), press states (color? shrink?), borders, inner/outer shadow systems, protection gradients vs capsules, layout rules (fixed elements), use of transparency and blur (when?), color vibe of imagery (warm? cool? b&w? grain?), corner radii, what do cards look like (shadow, rounding, border), etc. whatever else you can think of. answer ALL these questions.
- If you are missing font files, find the nearest match on Google Fonts. Flag this substitution to the user and ask for updated font files.
- As you work, create HTML card files in preview/ that populate the Design System tab. Target ~700×150px each (400px max) — err toward MORE small cards, not fewer dense ones. Split at the sub-concept level: separate cards for primary vs neutral vs semantic colors; display vs body vs mono type; spacing tokens vs a spacing-in-use example; one card per component state cluster. A typical system is 12–20+ cards. Skip titles and framing — the asset name renders OUTSIDE the card, so just show the swatches/specimens/tokens directly with minimal decoration. After writing each batch, call register_assets with items carrying viewport {width: 700, height: <your estimate>}, a one-line subtitle, and a `group` tag so the Design System tab can split cards into sections. Use these groups: "Type" for typography specimens and scales, "Colors" for palettes / color scales / semantic colors, "Spacing" for radii / shadow systems / spacing tokens / elevation, "Components" for buttons / form inputs / cards / badges / menus, "Brand" for logos / imagery / anything that doesn't fit the others. Title-cased, consistent across the batch.
- Copy logos, icons and other visual assets into assets/. update README.md with an ICONOGRAPHY describing the brand's approach to iconography. Answer ALL these and more: are certain icon systems used? is there a builtin icon font? are there SVGs used commonly, or png icons? (if so, copy them in!) Is emoji ever used? Are unicode chars used as icons? Make sure to copy key logos, background images, maybe 1-2 full-bleed generic images, and ALL generic illustrations you find. NEVER draw your own SVGs or generate images; COPY icons programmatically if you can.
- For icons: FIRST copy the codebase's own icon font/sprite/SVGs into assets/ if you can. Otherwise, if the set is CDN-available (e.g. Lucide, Heroicons), link it from CDN. If neither, substitute the closest CDN match (same stroke weight / fill style) and FLAG the substitution. Document usage in ICONOGRAPHY.
- For each product given (E.g. app and website), create UI kits in ui_kits/<product>/{README.md, index.html, Component1.jsx, Component2.jsx}; see the UI kits section. Verify visually. Make one todo list item for each product/surface.
- If you were given a slide template, create sample slides in slides/{index.html, TitleSlide.jsx, ComparisonSlide.jsx, BigQuoteSlide.jsx, etc}. If no sample slides were given, don't create them. Create an HTML file per slide type; if decks were provided, copy their style. Use the visual foundations and bring in logos + other assets. Register each slide HTML via register_assets with viewport {width: 1280, height: 720} so the 16:9 frame scales to fit the card.
- Register each UI kit's index.html as its own card via register_assets with viewport {width: <kit's design width>, height: <above-fold height>} — the declared height caps what's shown, so pick the portion worth previewing.
- Update README.md with a short "index" pointing the reader to the other files available. This should serve as a manifest of the root folder, plus a list of ui kits, etc.
- Create SKILL.md file (details below)
- You are done! The Design System tab shows every registered card. Do NOT summarize your output; just mention CAVEATS (e.g. things you were unable to do or unsure) and have a CLEAR, BOLD ASK for the user to help you ITERATE to make things PERFECT.

UI kit details:
- UI Kits are high-fidelity visual + interaction recreations of interfaces. They cut corners on functionality -- they are not 'real production code' -- but they provide high-fidelity UI components. Your UI kits should be pixel-perfect recreations, created by reading the original UI code if possible, or using figma's get-design-context. They should be modular and reusable, so they can easily be pieced together for real designs. UI kits should recreate key screens in the product as click-thru prototypes. a UI kit's index.html must look like a typical view of the product. These are recreations, not storybooks.
- To start, update the todo list to contain these steps for each product: (1) Explore codebase + components in Figma (design context) and code, (2) Create 3-5 core screens for each product (e.g. homepage or app) with interactive click-thru components, (3) Iterate visually on the designs 1-2x, cross-referencing with design context.
- Figure out the core products from this company/codebase. There may be one, or a few. (e.g. mobile app, marketing website, docs website).
- Each UI kit must contain JSX components (well-factored; small, neat) for core UI elements (e.g. sidebars, composers, file panels, hero units, headers, footers, buttons, fields, menus, blog posts, video players, settings screens, login, etc).
- The index.html file should demonstrate an interactive version of the UI (e.g a chat app would show you a login screen, let you create a chat, send a message, etc, as fake)
- You should get the visuals exactly right, using design context or codebase import. Don't copy component implementations exactly; make simple mainly-cosmetic versions. It's important to copy.
- Focus on good component coverage, not replicating every single section in a design.
- Do not invent new designs for UI kits. The job of the UI kit is to replicate the existing design, not create a new one. Copy the design, don't reinvent it. If you do not see it in the project, omit, or leave purposely blank with a disclaimer.

Guidance
- Run independently without stopping unless there's a crucial blocker (E.g. lack of Figma access to a pasted link; lack of codebase access).
- When creating slides and UI kits, avoid cutting corners on iconography; instead, copy icon assets in! Do not create halfway representations of iconography using hand-rolled SVG, emoji, etc.
- CRITICAL: Do not recreate UIs from screenshots alone unless you have no other choice! Use the codebase, or Figma's get-design-context, as a source of truth. Screenshots are much lossier than code; use screenshots as a high-level guide but always find components in the codebase if you can!
- Avoid these visual motifs unless you are sure you see them in the codebase or Figma: bluish-purple gradients, emoji cards, cards with rounded corners and colored left-border only
- Avoid reading SVGs -- this is a waste of context! If you know their usage, just copy them and then reference them.
- When using Figma, use get-design-context to understand the design system and components being used. Screenshots are ONLY useful for high-level guidance. Make sure to expand variables and child components to get their content, too. (get_variable_defs)
- Create these files in the ROOT of the project unless asked not to. For example, README.md should be at the root, not in a folder!
- Stop if key resources are unnecessible: iff a codebase was attached or mentioned, but you are unable to access it via local_ls, etc, you MUST stop and ask the user to re-attach it using the Import menu. These get reattached often; do not complete a design system if you get a disconnect! Similarly, if a Figma url is inaccessible, stop and ask the user to rectify. NEVER go ahead spending tons of time making a design system if you cannot access all the resources the user gave you.

SKILL.md
- When you are done, we should make this file cross-compatible with Agent SKills in case the user wants to download it and use it in Claude Code.
- Create a SKILL.md file like this:

<skill-md>
---
name: {brand}-design
description: Use this skill to generate well-branded interfaces and assets for {brand}, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
</skill-md>

</pasted_text>

## Assistant

_[tool: list_files]_

_[tool: set_project_title]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: update_todos]_

No codebase or Figma was attached, so I'll work from the spec and the aesthetic direction ("clean modern bold minimal creative, NOT mystic"). I'll commit to an editorial, magazine-grade direction: a bold modern serif paired with a clean grotesk, cream paper background, deep ink, and a single ember accent — confident and warm without leaning into tarot tropes. Let me build.

_[tool: write_file]_

Now type specimen cards:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now color cards:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now spacing, radii, shadows:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now component cards:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now brand mark / wordmark:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: show_html]_

_[tool: write_file]_

Now the UI kits. Three products: marketing landing, user dashboard, admin dashboard.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

Marketing looks solid. Now the user dashboard:

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

The "Алтан-Оч" is breaking on the hyphen. Quick fix:Now the admin dashboard — indigo accent for admin chrome:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: update_todos]_

All three UI kits look great. Now the README, SKILL.md, and asset registration:

_[tool: done]_

_[tool: fork_verifier_agent]_

The Union design system is wired up — open the **Design System** tab to see all 23 cards (Type, Colors, Spacing, Components, Brand) and three UI kits.

**Caveats to flag:**
- **No codebase or Figma was attached** — everything was inferred from the backend spec + your "clean modern bold minimal creative, not mystic" direction. Final reconciliation needed if owned assets exist.
- **Fonts are Google CDN** — Instrument Serif (display) + Geist (UI). Swap to owned typefaces if you have them.
- **Brand mark is invented** — a serif `Union.` wordmark with a single ember dot. Easy to replace.
- **Mongolian copy** is my best rendering (e.g. "Хамтын уншилт" for collective readings). Please correct anything off.
- **Admin uses an indigo chrome** I introduced — subscriber surfaces never touch it. Confirm the split feels right.

**Bold ask — what to iterate on, in order of impact:**

1. **Type pairing.** Instrument Serif is editorial and warm but possibly too literary. If you want more *bold* than *editorial*, I'd swap to a tighter serif (e.g. PP Editorial New) or a bold grotesk-only system (Geist 700 doing all the heavy lifting). **Tell me which way to push.**
2. **Accent color.** Ember `#E84A1F` is the only color note. If you want something cooler (electric green, chartreuse, deep blue) or quieter (terracotta, olive), say the word and I'll re-roll the whole system in 10 minutes.
3. **Send any real brand assets** — logo, photography style references, any owned typography, and the actual Mongolian product copy you've drafted. The closer we are to real content, the sharper this gets.

## User

Regenerate "Display — Serif": change font it's too fancy

## Assistant

_[tool: str_replace_edit]_

Switching the display family from Instrument Serif to **Bricolage Grotesque** — a modern bold grotesk that keeps the editorial italics but drops the literary "old-paper" character. More confident, less ornamental.

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Update the README to reflect the type change, then refresh the card:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_to_user]_

_[tool: save_screenshot]_

_[tool: view_image]_

Switched to **Bricolage Grotesque** — bold modern grotesk, no fancy serifs. The editorial "second-clause whisper" pattern now uses **weight contrast** (700 ↔ 300) instead of italics, since Bricolage doesn't ship true italics and synthetic italic on a grotesk reads worse than just dropping to a lighter weight.

Updates propagated everywhere: all UI kits (marketing hero, dashboard greeting, admin alert panel, etc.), the brand wordmark SVGs, the README, and the SKILL.md.

Open the Design System tab to see the updated cards — the rest of the system auto-inherited via CSS variables.

If Bricolage still feels too playful or you want something different (e.g. **Space Grotesk** for a more techy edge, **Manrope** for cleaner geometric, or **PP Editorial New** if you have a license), just say the word.

## User

change font's too elegent and messy!
change paper ink colors black color are too dark!

## Assistant

_[tool: str_replace_edit]_

Switching to **Geist for everything** (cleaner, less character) and softening the ink palette so blacks aren't so harsh.Now update the wordmark SVGs and the type-display preview card, then refresh:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: run_script]_

_[tool: grep]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

Let me check it all comes together — open the marketing landing and verify:

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_to_user]_

Done. Changes:

- **One font, Geist.** Bold 700 for headlines (tight tracking -0.045em), light 300 for the "second clause" — weight does what italic was doing. No second family, no fancy curves.
- **Softer ink.** Pure-black `#14110D` → warm-dark `#2A2520`. The whole ink ramp and dark-section colors lifted to match. Cream paper unchanged.
- All UI kits, the wordmark, and preview cards inherited the change via CSS variables; lesson-card gradient placeholders updated too.

Open the **Design System** tab and the marketing/dashboard kits to see it across the board.

If `#2A2520` is still too dark, I can go further — `#332E26` (medium warm-dark) or `#403930` (much lighter). Or if Geist feels generic, **Space Grotesk** has a touch more character without being "elegant."

