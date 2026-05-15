-- =============================================================
-- MIGRATION 00008: profiles.phone
-- =============================================================
-- Captured during the post-OAuth onboarding form together with
-- full_name. NULL marks an incomplete profile and triggers the
-- redirect to /auth/onboarding from /payment and /dashboard.

ALTER TABLE profiles
  ADD COLUMN phone TEXT;
