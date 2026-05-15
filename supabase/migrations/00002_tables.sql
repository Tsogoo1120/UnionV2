-- =============================================================
-- MIGRATION 00002: Tables, Constraints, and Indexes
-- =============================================================
-- v2 schema. Consolidated from v1's 13 migrations into a clean
-- baseline. See plan §3.2 for the canonical column list.

-- ----------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------
CREATE TYPE user_role            AS ENUM ('user', 'admin');
CREATE TYPE subscription_status  AS ENUM ('inactive', 'pending', 'active', 'expired', 'denied');
CREATE TYPE payment_status       AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE coaching_slot_status AS ENUM ('available', 'pending', 'booked', 'expired', 'cancelled');


-- ----------------------------------------------------------------
-- TABLE: profiles
-- One row per auth.users row; auto-created by trigger (00003).
-- email_notifications + expiry_reminder_stage are baked in from
-- day one (v1 added them in later migrations).
-- ----------------------------------------------------------------
CREATE TABLE profiles (
  id                      UUID                PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT                NOT NULL,
  full_name               TEXT,
  avatar_url              TEXT,
  role                    user_role           NOT NULL DEFAULT 'user',
  subscription_status     subscription_status NOT NULL DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  email_notifications     BOOLEAN             NOT NULL DEFAULT TRUE,
  expiry_reminder_stage   SMALLINT            NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role                ON profiles(role);
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX idx_profiles_email               ON profiles(email);
CREATE INDEX idx_profiles_email_notifications ON profiles(email_notifications);

-- Composite index for the daily expiry-reminder cron's filter.
CREATE INDEX idx_profiles_expiry_reminders
  ON profiles (subscription_status, expiry_reminder_stage, subscription_expires_at)
  WHERE subscription_status = 'active';


-- ----------------------------------------------------------------
-- TABLE: payments
-- Manual screenshot-based subscription payments.
-- reviewed_by → SET NULL keeps the audit row if the admin leaves.
-- ----------------------------------------------------------------
CREATE TABLE payments (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screenshot_path TEXT           NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency        TEXT           NOT NULL DEFAULT 'MNT',
  status          payment_status NOT NULL DEFAULT 'pending',
  bank_reference  TEXT,
  admin_note      TEXT,
  submitted_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID           REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_payments_user_id      ON payments(user_id);
CREATE INDEX idx_payments_status       ON payments(status);
CREATE INDEX idx_payments_submitted_at ON payments(submitted_at DESC);


-- ----------------------------------------------------------------
-- TABLE: video_lessons
-- Self-hosted video courses (service 1). Video file lives in R2
-- under `video_r2_key`; thumbnail lives in Supabase Storage.
-- ----------------------------------------------------------------
CREATE TABLE video_lessons (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  title            TEXT        NOT NULL,
  description      TEXT,
  body             TEXT,
  category         TEXT,
  thumbnail_path   TEXT,
  video_r2_key     TEXT        NOT NULL,
  duration_seconds INTEGER,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  is_published     BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_lessons_slug         ON video_lessons(slug);
CREATE INDEX idx_video_lessons_category     ON video_lessons(category);
CREATE INDEX idx_video_lessons_is_published ON video_lessons(is_published);
CREATE INDEX idx_video_lessons_published_at ON video_lessons(published_at DESC);


-- ----------------------------------------------------------------
-- TABLE: collective_readings
-- "Collective tarot reading" series (service 2, brand-new in v2).
-- ----------------------------------------------------------------
CREATE TABLE collective_readings (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  title            TEXT        NOT NULL,
  description      TEXT,
  body             TEXT,
  cover_image_path TEXT,
  video_r2_key     TEXT        NOT NULL,
  is_published     BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collective_readings_slug         ON collective_readings(slug);
CREATE INDEX idx_collective_readings_is_published ON collective_readings(is_published);
CREATE INDEX idx_collective_readings_published_at ON collective_readings(published_at DESC);


-- ----------------------------------------------------------------
-- TABLE: articles
-- Long-form Markdown articles (service 5, brand-new in v2).
-- ----------------------------------------------------------------
CREATE TABLE articles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  title            TEXT        NOT NULL,
  excerpt          TEXT,
  body             TEXT        NOT NULL,
  cover_image_path TEXT,
  author_id        UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  reading_minutes  INTEGER,
  is_published     BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_slug         ON articles(slug);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_author_id    ON articles(author_id);


-- ----------------------------------------------------------------
-- TABLE: psychology_tests
-- Tests with JSONB question array + scoring rules.
--   questions:     [{ id, text, options: [{ id, text, value }] }]
--   scoring_rules: { ranges: [{ min, max, result }] }
-- ----------------------------------------------------------------
CREATE TABLE psychology_tests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  title            TEXT        NOT NULL,
  description      TEXT,
  cover_image_path TEXT,
  questions        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  scoring_rules    JSONB       NOT NULL DEFAULT '{"ranges":[]}'::jsonb,
  is_published     BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psychology_tests_slug         ON psychology_tests(slug);
CREATE INDEX idx_psychology_tests_is_published ON psychology_tests(is_published);


-- ----------------------------------------------------------------
-- TABLE: test_results
-- One row per user attempt. Cascade-deletes with the test or user.
-- ----------------------------------------------------------------
CREATE TABLE test_results (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id        UUID        NOT NULL REFERENCES psychology_tests(id) ON DELETE CASCADE,
  answers        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  result_summary TEXT,
  score          JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_test_results_user_id   ON test_results(user_id);
CREATE INDEX idx_test_results_test_id   ON test_results(test_id);
CREATE INDEX idx_test_results_user_test ON test_results(user_id, test_id);


-- ----------------------------------------------------------------
-- TABLE: community_posts
-- is_hidden is new in v2 (admin moderation, see plan §17.6).
-- Replaces v1's is_published, which was always TRUE in practice.
-- ----------------------------------------------------------------
CREATE TABLE community_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  image_path TEXT,
  is_hidden  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user_id    ON community_posts(user_id);
CREATE INDEX idx_community_posts_is_hidden  ON community_posts(is_hidden);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);


-- ----------------------------------------------------------------
-- TABLE: comments
-- is_hidden is new in v2.
-- ----------------------------------------------------------------
CREATE TABLE comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       TEXT        NOT NULL,
  is_hidden  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id   ON comments(post_id);
CREATE INDEX idx_comments_user_id   ON comments(user_id);
CREATE INDEX idx_comments_is_hidden ON comments(is_hidden);


-- ----------------------------------------------------------------
-- TABLE: coaching_slots
-- Admin-published 1:1 coaching availability (brand-new in v2).
-- end_at > start_at is enforced by a CHECK constraint.
-- ----------------------------------------------------------------
CREATE TABLE coaching_slots (
  id          UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at    TIMESTAMPTZ          NOT NULL,
  end_at      TIMESTAMPTZ          NOT NULL,
  price       NUMERIC(10, 2)       NOT NULL CHECK (price > 0),
  currency    TEXT                 NOT NULL DEFAULT 'MNT',
  description TEXT,
  status      coaching_slot_status NOT NULL DEFAULT 'available',
  created_by  UUID                 NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  CONSTRAINT coaching_slots_time_order CHECK (end_at > start_at)
);

CREATE INDEX idx_coaching_slots_status_start
  ON coaching_slots(status, start_at)
  WHERE status IN ('available', 'pending');

CREATE INDEX idx_coaching_slots_start_at ON coaching_slots(start_at);
CREATE INDEX idx_coaching_slots_end_at   ON coaching_slots(end_at);


-- ----------------------------------------------------------------
-- TABLE: coaching_bookings
-- One booking per slot. A partial UNIQUE index prevents two
-- 'approved' bookings against the same slot, which would be the
-- final guard if the RPC reservation logic ever has a bug.
-- ----------------------------------------------------------------
CREATE TABLE coaching_bookings (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID           NOT NULL REFERENCES coaching_slots(id) ON DELETE RESTRICT,
  user_id         UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency        TEXT           NOT NULL DEFAULT 'MNT',
  screenshot_path TEXT           NOT NULL,
  bank_reference  TEXT,
  status          payment_status NOT NULL DEFAULT 'pending',
  admin_note      TEXT,
  submitted_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID           REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_coaching_bookings_slot_id      ON coaching_bookings(slot_id);
CREATE INDEX idx_coaching_bookings_user_id      ON coaching_bookings(user_id);
CREATE INDEX idx_coaching_bookings_status       ON coaching_bookings(status);
CREATE INDEX idx_coaching_bookings_submitted_at ON coaching_bookings(submitted_at DESC);

-- A single slot can have at most one approved booking. Pending/denied
-- bookings against the same slot are allowed (denied = audit trail).
CREATE UNIQUE INDEX coaching_bookings_one_approved_per_slot
  ON coaching_bookings(slot_id)
  WHERE status = 'approved';
