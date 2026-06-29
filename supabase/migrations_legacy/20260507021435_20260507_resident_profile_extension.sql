/*
  # Resident Profile Extension

  ## Summary
  Extends cv_team_patient to become the single source of truth for resident identity,
  adding the rich identity fields currently only stored in memory_book_identity.
  Creates a sync function so saving the Resident Profile also keeps memory_book_identity
  up to date for Memory Book display purposes.

  ## Changes

  ### Modified Tables
  - `cv_team_patient`: adds preferred_name, birthplace, address_preference,
    relationship_status, cultural_preferences, language_preferences, about_me, photo_url

  ### New Functions
  - `cv_sync_resident_to_memory_book_identity(p_team_id)`: upserts memory_book_identity
    from cv_team_patient data, used after any resident profile save

  ## Notes
  - All new columns are nullable text (no breaking change to existing rows)
  - The memory_book_identity table is NOT dropped — Memory Book continues to read it
  - Existing memory_book_identity data is not migrated automatically here because
    the sync is one-directional (Resident Profile → Memory Book Identity) going forward
*/

-- 1. Add rich identity columns to cv_team_patient
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'preferred_name') THEN
    ALTER TABLE cv_team_patient ADD COLUMN preferred_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'birthplace') THEN
    ALTER TABLE cv_team_patient ADD COLUMN birthplace text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'address_preference') THEN
    ALTER TABLE cv_team_patient ADD COLUMN address_preference text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'relationship_status') THEN
    ALTER TABLE cv_team_patient ADD COLUMN relationship_status text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'cultural_preferences') THEN
    ALTER TABLE cv_team_patient ADD COLUMN cultural_preferences text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'language_preferences') THEN
    ALTER TABLE cv_team_patient ADD COLUMN language_preferences text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'about_me') THEN
    ALTER TABLE cv_team_patient ADD COLUMN about_me text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_team_patient' AND column_name = 'photo_url') THEN
    ALTER TABLE cv_team_patient ADD COLUMN photo_url text DEFAULT '';
  END IF;
END $$;

-- 2. Create sync function: cv_team_patient → memory_book_identity
--    Called client-side after saving resident profile to keep Memory Book in sync.
CREATE OR REPLACE FUNCTION cv_sync_resident_to_memory_book_identity(p_team_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_book_id uuid;
  v_resident RECORD;
BEGIN
  -- Get resident data
  SELECT * INTO v_resident
  FROM cv_team_patient
  WHERE team_id = p_team_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get or create memory book
  SELECT id INTO v_book_id
  FROM memory_books
  WHERE team_id = p_team_id;

  IF v_book_id IS NULL THEN
    RETURN; -- Memory book not yet created, skip sync
  END IF;

  -- Upsert memory_book_identity from resident profile
  INSERT INTO memory_book_identity (
    memory_book_id,
    team_id,
    preferred_name,
    birthplace,
    address_preference,
    relationship_status,
    cultural_preferences,
    language_preferences,
    about_me,
    photo_url,
    created_by,
    updated_by
  )
  VALUES (
    v_book_id,
    p_team_id,
    COALESCE(v_resident.preferred_name, ''),
    COALESCE(v_resident.birthplace, ''),
    COALESCE(v_resident.address_preference, ''),
    COALESCE(v_resident.relationship_status, ''),
    COALESCE(v_resident.cultural_preferences, ''),
    COALESCE(v_resident.language_preferences, ''),
    COALESCE(v_resident.about_me, ''),
    COALESCE(v_resident.photo_url, ''),
    auth.uid(),
    auth.uid()
  )
  ON CONFLICT (memory_book_id) DO UPDATE SET
    preferred_name        = EXCLUDED.preferred_name,
    birthplace            = EXCLUDED.birthplace,
    address_preference    = EXCLUDED.address_preference,
    relationship_status   = EXCLUDED.relationship_status,
    cultural_preferences  = EXCLUDED.cultural_preferences,
    language_preferences  = EXCLUDED.language_preferences,
    about_me              = EXCLUDED.about_me,
    photo_url             = EXCLUDED.photo_url,
    updated_at            = now(),
    updated_by            = auth.uid();
END;
$$;

-- 3. Grant execute to authenticated users (owner of team can call this)
REVOKE ALL ON FUNCTION cv_sync_resident_to_memory_book_identity(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cv_sync_resident_to_memory_book_identity(uuid) TO authenticated;
