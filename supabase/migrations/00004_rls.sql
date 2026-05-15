-- =============================================================
-- MIGRATION 00004: Row Level Security — Enable + Policies
-- =============================================================
-- The RLS matrix in plan §3.4 is the canonical reference for what
-- this file should enforce.


-- ----------------------------------------------------------------
-- Enable RLS on every application table.
-- ----------------------------------------------------------------
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_lessons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychology_tests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_bookings   ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PROFILES
-- ================================================================
CREATE POLICY "profiles: users read own, admins read all"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles: admin insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "profiles: users update own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: admin update any"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "profiles: admin delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());


-- ================================================================
-- PAYMENTS — no DELETE policy (audit trail)
-- ================================================================
CREATE POLICY "payments: users read own, admins read all"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "payments: users insert own"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments: admin update"
  ON payments FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());


-- ================================================================
-- VIDEO_LESSONS
-- ================================================================
CREATE POLICY "video_lessons: active subscribers read published, admins read all"
  ON video_lessons FOR SELECT
  TO authenticated
  USING (
    (is_published = TRUE AND is_active_subscriber())
    OR is_admin()
  );

CREATE POLICY "video_lessons: admin insert"
  ON video_lessons FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "video_lessons: admin update"
  ON video_lessons FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "video_lessons: admin delete"
  ON video_lessons FOR DELETE
  TO authenticated
  USING (is_admin());


-- ================================================================
-- COLLECTIVE_READINGS — same as video_lessons
-- ================================================================
CREATE POLICY "collective_readings: active subscribers read published, admins read all"
  ON collective_readings FOR SELECT
  TO authenticated
  USING (
    (is_published = TRUE AND is_active_subscriber())
    OR is_admin()
  );

CREATE POLICY "collective_readings: admin insert"
  ON collective_readings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "collective_readings: admin update"
  ON collective_readings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "collective_readings: admin delete"
  ON collective_readings FOR DELETE
  TO authenticated
  USING (is_admin());


-- ================================================================
-- ARTICLES
-- ================================================================
CREATE POLICY "articles: active subscribers read published, admins read all"
  ON articles FOR SELECT
  TO authenticated
  USING (
    (is_published = TRUE AND is_active_subscriber())
    OR is_admin()
  );

CREATE POLICY "articles: admin insert"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "articles: admin update"
  ON articles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "articles: admin delete"
  ON articles FOR DELETE
  TO authenticated
  USING (is_admin());


-- ================================================================
-- PSYCHOLOGY_TESTS
-- ================================================================
CREATE POLICY "psychology_tests: active subscribers read published, admins read all"
  ON psychology_tests FOR SELECT
  TO authenticated
  USING (
    (is_published = TRUE AND is_active_subscriber())
    OR is_admin()
  );

CREATE POLICY "psychology_tests: admin insert"
  ON psychology_tests FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "psychology_tests: admin update"
  ON psychology_tests FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "psychology_tests: admin delete"
  ON psychology_tests FOR DELETE
  TO authenticated
  USING (is_admin());


-- ================================================================
-- TEST_RESULTS
-- ================================================================
CREATE POLICY "test_results: users read own, admins read all"
  ON test_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "test_results: users insert own"
  ON test_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "test_results: users update own, admins update any"
  ON test_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "test_results: users delete own, admins delete any"
  ON test_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());


-- ================================================================
-- COMMUNITY_POSTS — is_hidden filters non-admin readers
-- ================================================================
CREATE POLICY "community_posts: active subscribers read non-hidden, admins read all"
  ON community_posts FOR SELECT
  TO authenticated
  USING (
    (is_hidden = FALSE AND is_active_subscriber())
    OR is_admin()
  );

CREATE POLICY "community_posts: active subscribers insert own"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_active_subscriber());

CREATE POLICY "community_posts: users update own, admins update any"
  ON community_posts FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "community_posts: users delete own, admins delete any"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());


-- ================================================================
-- COMMENTS — same is_hidden treatment
-- ================================================================
CREATE POLICY "comments: active subscribers read non-hidden, admins read all"
  ON comments FOR SELECT
  TO authenticated
  USING (
    (is_hidden = FALSE AND is_active_subscriber())
    OR is_admin()
  );

CREATE POLICY "comments: active subscribers insert own"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_active_subscriber());

CREATE POLICY "comments: users update own, admins update any"
  ON comments FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "comments: users delete own, admins delete any"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());


-- ================================================================
-- COACHING_SLOTS
-- SELECT  : public/users see available + booked slots; admins see all
-- INSERT  : admin only
-- UPDATE  : admin only (RPC also bypasses RLS via SECURITY DEFINER)
-- DELETE  : admin only
-- ================================================================
CREATE POLICY "coaching_slots: public read available + booked, admins read all"
  ON coaching_slots FOR SELECT
  TO anon, authenticated
  USING (
    status IN ('available', 'booked')
    OR is_admin()
  );

CREATE POLICY "coaching_slots: admin insert"
  ON coaching_slots FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "coaching_slots: admin update"
  ON coaching_slots FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "coaching_slots: admin delete"
  ON coaching_slots FOR DELETE
  TO authenticated
  USING (is_admin());


-- ================================================================
-- COACHING_BOOKINGS
-- SELECT  : own bookings or admin
-- INSERT  : authenticated users (user_id must equal auth.uid())
-- UPDATE  : admin only (approve/deny)
-- DELETE  : admin only (audit trail otherwise)
-- ================================================================
CREATE POLICY "coaching_bookings: users read own, admins read all"
  ON coaching_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "coaching_bookings: users insert own"
  ON coaching_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coaching_bookings: admin update"
  ON coaching_bookings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "coaching_bookings: admin delete"
  ON coaching_bookings FOR DELETE
  TO authenticated
  USING (is_admin());
