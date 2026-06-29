/*
  # QC DB Integrity Fixes

  ## Summary
  Two targeted integrity improvements surfaced during the Primary Caregiver flow QC audit.

  ## Changes

  ### 1. CHECK constraint on cv_team.plan_id
  - Restricts `plan_id` to valid team-eligible plans: 'family_qtr' and 'free'
  - Prevents edge cases where an invalid plan could be assigned to a team
  - Applied with IF NOT EXISTS guard to be safe on re-run

  ### 2. updated_at timestamp on cv_team_patient
  - Adds an `updated_at` column with a default of `now()` for basic audit trail
  - Adds a trigger to auto-update the column whenever the row changes
  - Uses IF NOT EXISTS guard so migration is idempotent

  ## Security
  - No RLS changes; existing policies on cv_team and cv_team_patient remain intact
*/

-- 1. Add CHECK constraint on cv_team.plan_id (guard against re-running)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'cv_team'
      AND constraint_name = 'cv_team_plan_id_check'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE cv_team
      ADD CONSTRAINT cv_team_plan_id_check
      CHECK (plan_id IN ('family_qtr', 'free'));
  END IF;
END $$;

-- 2. Add updated_at to cv_team_patient if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cv_team_patient'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE cv_team_patient
      ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- 3. Create trigger function to auto-update updated_at (idempotent)
CREATE OR REPLACE FUNCTION cv_team_patient_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Attach trigger to cv_team_patient (drop first to be idempotent)
DROP TRIGGER IF EXISTS trg_cv_team_patient_updated_at ON cv_team_patient;

CREATE TRIGGER trg_cv_team_patient_updated_at
  BEFORE UPDATE ON cv_team_patient
  FOR EACH ROW
  EXECUTE FUNCTION cv_team_patient_set_updated_at();
