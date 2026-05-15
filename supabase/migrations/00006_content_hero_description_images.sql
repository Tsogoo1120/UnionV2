-- =============================================================
-- MIGRATION 00006: Hero and description images on content tables
-- =============================================================
-- Optional R2/Storage paths for hero (listing/card) and description
-- section images, separate from cover/thumbnail fields.

ALTER TABLE video_lessons
  ADD COLUMN IF NOT EXISTS hero_image_path      TEXT,
  ADD COLUMN IF NOT EXISTS description_image_path TEXT;

ALTER TABLE collective_readings
  ADD COLUMN IF NOT EXISTS hero_image_path      TEXT,
  ADD COLUMN IF NOT EXISTS description_image_path TEXT;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS hero_image_path      TEXT,
  ADD COLUMN IF NOT EXISTS description_image_path TEXT;

ALTER TABLE psychology_tests
  ADD COLUMN IF NOT EXISTS hero_image_path      TEXT,
  ADD COLUMN IF NOT EXISTS description_image_path TEXT;
