-- =============================================================
-- MIGRATION 00005: Storage Buckets and Policies
-- =============================================================
-- Folder convention for user-scoped buckets: {user_id}/{filename}
-- storage.foldername(name) splits the path by '/' and returns it
-- as text[]; index [1] is the first path segment.
--
-- v2 buckets (per plan §4.1):
--   payment-screenshots  PRIVATE   subscription payment screenshots
--   coaching-screenshots PRIVATE   coaching booking screenshots
--   media-thumbnails     PUBLIC    video/reading/test thumbnails
--   article-images       PUBLIC    article cover images
--   community-images     PROTECTED community post images
--
-- Video files live in Cloudflare R2 (not Supabase Storage); see
-- lib/r2/* for that flow.


-- ----------------------------------------------------------------
-- CREATE BUCKETS
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- PRIVATE: subscription payment screenshots
  (
    'payment-screenshots',
    'payment-screenshots',
    FALSE,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  -- PRIVATE: coaching booking screenshots
  (
    'coaching-screenshots',
    'coaching-screenshots',
    FALSE,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  -- PUBLIC: thumbnails for video lessons, collective readings, psych tests
  (
    'media-thumbnails',
    'media-thumbnails',
    TRUE,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  -- PUBLIC: article cover images
  (
    'article-images',
    'article-images',
    TRUE,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  -- PROTECTED: community post images (subscribers only)
  (
    'community-images',
    'community-images',
    FALSE,
    3145728, -- 3 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- BUCKET: payment-screenshots  (PRIVATE)
-- ================================================================
CREATE POLICY "payment-screenshots: users upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "payment-screenshots: users read own, admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin()
    )
  );

CREATE POLICY "payment-screenshots: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND is_admin()
  );


-- ================================================================
-- BUCKET: coaching-screenshots  (PRIVATE)
-- Same model as payment-screenshots.
-- ================================================================
CREATE POLICY "coaching-screenshots: users upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'coaching-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "coaching-screenshots: users read own, admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'coaching-screenshots'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin()
    )
  );

CREATE POLICY "coaching-screenshots: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'coaching-screenshots'
    AND is_admin()
  );


-- ================================================================
-- BUCKET: media-thumbnails  (PUBLIC read)
-- ================================================================
CREATE POLICY "media-thumbnails: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media-thumbnails');

CREATE POLICY "media-thumbnails: admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media-thumbnails' AND is_admin());

CREATE POLICY "media-thumbnails: admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING  (bucket_id = 'media-thumbnails' AND is_admin())
  WITH CHECK (bucket_id = 'media-thumbnails' AND is_admin());

CREATE POLICY "media-thumbnails: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media-thumbnails' AND is_admin());


-- ================================================================
-- BUCKET: article-images  (PUBLIC read)
-- ================================================================
CREATE POLICY "article-images: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'article-images');

CREATE POLICY "article-images: admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images' AND is_admin());

CREATE POLICY "article-images: admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING  (bucket_id = 'article-images' AND is_admin())
  WITH CHECK (bucket_id = 'article-images' AND is_admin());

CREATE POLICY "article-images: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images' AND is_admin());


-- ================================================================
-- BUCKET: community-images  (PROTECTED — subscribers only)
-- ================================================================
CREATE POLICY "community-images: active subscribers and admins read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'community-images'
    AND is_active_subscriber()
  );

CREATE POLICY "community-images: active subscribers upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND is_active_subscriber()
  );

CREATE POLICY "community-images: users delete own, admins delete any"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin()
    )
  );
