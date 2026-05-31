-- =============================================================
-- MIGRATION 00009: Add description text field to articles
-- =============================================================
-- Adds a free-form description field (longer than excerpt,
-- shorter than body) to the articles table, consistent with
-- the description field on video_lessons and collective_readings.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS description TEXT;
