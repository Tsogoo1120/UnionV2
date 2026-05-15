-- =============================================================
-- MIGRATION 00001: Extensions
-- =============================================================

-- uuid-ossp: provides uuid_generate_v4() as a fallback;
-- gen_random_uuid() is built-in on PG 13+ (Supabase default) and
-- is what we use in column defaults, but enabling uuid-ossp is
-- harmless and ensures compatibility.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- btree_gist is required for the coaching_slots exclusion constraint
-- (prevents overlapping bookings from the same admin in §11.5 race tests).
CREATE EXTENSION IF NOT EXISTS "btree_gist";
