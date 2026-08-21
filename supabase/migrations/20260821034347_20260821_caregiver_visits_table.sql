/*
# Caregiver Visits Table

1. New Tables
   - `caregiver_visits` — tracks scheduled and recorded caregiver visits
     - `id` (uuid, PK)
     - `team_id` (uuid, FK to cv_team.id)
     - `resident_id` (uuid, FK to cv_team_patient.team_id)
     - `created_by` (uuid, FK to auth.users.id, defaults to auth.uid())
     - `date`, `time_in`, `time_out` — visit timing
     - `caregiver_name`, `visit_type`, `notes` — visit details
     - `hourly_rate` — optional cost rate
     - `created_at`, `updated_at` — timestamps

2. Constraints
   - visit_type must be one of: Personal Care, Companionship, Medical Support, Other
   - time_out must be after time_in

3. Security (RLS)
   - SELECT: own entries or team membership via get_user_team_ids()
   - INSERT: own entries, team membership checked
   - UPDATE: own entries within 48 hours of creation only
   - DELETE: own entries within 48 hours of creation only
*/

CREATE TABLE IF NOT EXISTS caregiver_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES cv_team(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES cv_team_patient(team_id) ON DELETE SET NULL,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_in time NOT NULL,
  time_out time NOT NULL,
  caregiver_name text NOT NULL,
  visit_type text NOT NULL,
  notes text,
  hourly_rate numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_visit_type CHECK (visit_type IN ('Personal Care', 'Companionship', 'Medical Support', 'Other')),
  CONSTRAINT time_out_after_time_in CHECK (time_out > time_in)
);

CREATE INDEX IF NOT EXISTS idx_caregiver_visits_team_date ON caregiver_visits(team_id, date);
CREATE INDEX IF NOT EXISTS idx_caregiver_visits_created_by ON caregiver_visits(created_by);

ALTER TABLE caregiver_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_team_visits" ON caregiver_visits;
CREATE POLICY "select_team_visits" ON caregiver_visits FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR team_id IN (SELECT get_user_team_ids())
  );

DROP POLICY IF EXISTS "insert_own_visits" ON caregiver_visits;
CREATE POLICY "insert_own_visits" ON caregiver_visits FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (team_id IS NULL OR team_id IN (SELECT get_user_team_ids()))
  );

DROP POLICY IF EXISTS "update_own_visits_48h" ON caregiver_visits;
CREATE POLICY "update_own_visits_48h" ON caregiver_visits FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND created_at > (now() - interval '48 hours')
  )
  WITH CHECK (
    created_by = auth.uid()
    AND created_at > (now() - interval '48 hours')
  );

DROP POLICY IF EXISTS "delete_own_visits_48h" ON caregiver_visits;
CREATE POLICY "delete_own_visits_48h" ON caregiver_visits FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND created_at > (now() - interval '48 hours')
  );

CREATE OR REPLACE FUNCTION update_caregiver_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_caregiver_visits_updated_at ON caregiver_visits;
CREATE TRIGGER trg_caregiver_visits_updated_at
  BEFORE UPDATE ON caregiver_visits
  FOR EACH ROW EXECUTE FUNCTION update_caregiver_visits_updated_at();
