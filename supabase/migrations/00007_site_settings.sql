-- Site-wide key/value settings (intro video, poster, etc.)

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT INTO site_settings (key, value) VALUES ('intro_video_r2_key', '')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('intro_poster_path', '')
  ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read for marketing intro video keys
CREATE POLICY "site_settings: public read intro keys"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (key IN ('intro_video_r2_key', 'intro_poster_path'));

-- Admin full access
CREATE POLICY "site_settings: admin all"
  ON site_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
