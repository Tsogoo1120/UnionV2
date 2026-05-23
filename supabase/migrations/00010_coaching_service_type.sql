-- Add service_type to coaching_slots.
-- Existing rows are backfilled to '1vs1_coaching' via the column DEFAULT.
ALTER TABLE coaching_slots
  ADD COLUMN service_type TEXT NOT NULL DEFAULT '1vs1_coaching'
  CHECK (service_type IN ('1vs1_coaching', 'tarot_reading'));
