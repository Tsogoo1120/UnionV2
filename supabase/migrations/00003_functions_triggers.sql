-- =============================================================
-- MIGRATION 00003: Helper Functions, Triggers, and RPCs
-- =============================================================
-- Functions defined first; triggers + RPCs reference them.
-- The reserve_coaching_slot / release_coaching_slot RPCs at the
-- bottom solve the §3.5 race condition atomically at the DB layer.


-- ----------------------------------------------------------------
-- HELPER: is_admin()
-- Returns TRUE when the calling authenticated user has role='admin'.
-- SECURITY DEFINER + fixed search_path: runs as the function owner,
-- bypassing RLS on profiles to avoid infinite recursion (the
-- profiles RLS policy calls is_admin() itself).
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION is_admin() TO authenticated;


-- ----------------------------------------------------------------
-- HELPER: is_active_subscriber()
-- Returns TRUE for admins (always) and users with active+unexpired
-- subscriptions. Used by RLS on subscriber-only content + storage.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_active_subscriber()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (
          subscription_status = 'active'
          AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
        )
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION is_active_subscriber() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION is_active_subscriber() TO authenticated;


-- ----------------------------------------------------------------
-- TRIGGER FUNCTION: set_updated_at()
-- Keeps updated_at current on every UPDATE.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attach to every table with updated_at.
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_video_lessons_updated_at
  BEFORE UPDATE ON video_lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_collective_readings_updated_at
  BEFORE UPDATE ON collective_readings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_psychology_tests_updated_at
  BEFORE UPDATE ON psychology_tests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_coaching_slots_updated_at
  BEFORE UPDATE ON coaching_slots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ----------------------------------------------------------------
-- TRIGGER FUNCTION: protect_profile_sensitive_fields()
-- Prevents regular users from changing role / subscription_status /
-- subscription_expires_at. Admins and service-role calls bypass.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role has no JWT; allow unrestricted updates.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins may change any field.
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'permission denied: cannot change role';
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'permission denied: cannot change subscription_status';
  END IF;

  IF NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at THEN
    RAISE EXCEPTION 'permission denied: cannot change subscription_expires_at';
  END IF;

  IF NEW.expiry_reminder_stage IS DISTINCT FROM OLD.expiry_reminder_stage THEN
    RAISE EXCEPTION 'permission denied: cannot change expiry_reminder_stage';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_sensitive_fields
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_sensitive_fields();


-- ----------------------------------------------------------------
-- TRIGGER FUNCTION: handle_new_user()
-- Auto-creates a profile row immediately after auth.users INSERT.
-- Google OAuth puts the display name in `name` and the avatar URL
-- in `picture` (the OIDC standard); we also fall back to
-- `full_name`/`avatar_url` if a different OAuth provider is added.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, role, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    ),
    'user',
    'inactive'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ================================================================
-- COACHING RPCS — solve the §3.5 race condition atomically.
-- Two users tap "Book" at the same moment; only one wins.
-- ================================================================


-- ----------------------------------------------------------------
-- RPC: reserve_coaching_slot(p_slot_id)
-- Atomically flips an 'available' slot to 'pending'. Raises
-- 'slot_unavailable' if the slot was already taken, doesn't exist,
-- or its start time has passed.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION reserve_coaching_slot(p_slot_id UUID)
RETURNS coaching_slots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot coaching_slots;
BEGIN
  -- Caller must be authenticated.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  UPDATE coaching_slots
  SET status = 'pending', updated_at = NOW()
  WHERE id = p_slot_id
    AND status = 'available'
    AND start_at > NOW()
  RETURNING * INTO slot;

  IF slot.id IS NULL THEN
    RAISE EXCEPTION 'slot_unavailable';
  END IF;

  RETURN slot;
END;
$$;

REVOKE EXECUTE ON FUNCTION reserve_coaching_slot(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION reserve_coaching_slot(UUID) TO authenticated;


-- ----------------------------------------------------------------
-- RPC: release_coaching_slot(p_slot_id)
-- Reverts a 'pending' slot back to 'available'. Used when a
-- booking insert fails after the RPC has already reserved the slot
-- (e.g. screenshot upload error). Idempotent: only changes status
-- if it's currently 'pending'.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION release_coaching_slot(p_slot_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  UPDATE coaching_slots
  SET status = 'available', updated_at = NOW()
  WHERE id = p_slot_id
    AND status = 'pending';
END;
$$;

REVOKE EXECUTE ON FUNCTION release_coaching_slot(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION release_coaching_slot(UUID) TO authenticated;
