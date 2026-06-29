/*
  # Care Plan Tables

  ## Summary
  Creates the foundation for the Care Plan Builder — a team-centred strategic planning tool
  that lives inside Care Hub. This is deliberately separate from the Memory Book (which is
  resident-centred) and does not duplicate any Memory Book or Observations data.

  ## New Tables

  ### care_plans
  - One care plan per team (team_id UNIQUE)
  - `id`           uuid primary key
  - `team_id`      FK → cv_team (the owning care team)
  - `created_by`   FK → auth.users (user who created the plan)
  - `status`       'draft' | 'active'
  - `created_at`   timestamptz
  - `updated_at`   timestamptz

  ### care_plan_sections
  - One row per section per care plan
  - `id`                uuid primary key
  - `care_plan_id`      FK → care_plans
  - `section_key`       text — one of: situation, authority, responsibilities,
                        living_arrangement, sustainability, review
  - `content_json`      jsonb — all saved form data for this section
  - `completion_status` 'not_started' | 'in_progress' | 'complete'
  - `created_at`        timestamptz
  - `updated_at`        timestamptz
  - UNIQUE (care_plan_id, section_key)

  ## Security
  - RLS enabled on both tables
  - SELECT: any active team member (role owner or member)
  - INSERT/UPDATE: team owner only
  - DELETE: team owner only
  - Follows the exact same RLS pattern as all memory_book_* tables

  ## Notes
  - No data from Memory Book or Observations is duplicated here
  - Care Plan sections reference existing data by linking back to those tools
  - updated_at auto-updated via trigger on both tables
*/

-- ── care_plans ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS care_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid NOT NULL REFERENCES cv_team(id) ON DELETE CASCADE,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id)
);

ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

-- SELECT: any active member of the team
CREATE POLICY "Active team members can view care plan"
  ON care_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = care_plans.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
    )
  );

-- INSERT: team owner only
CREATE POLICY "Team owner can create care plan"
  ON care_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = care_plans.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  );

-- UPDATE: team owner only
CREATE POLICY "Team owner can update care plan"
  ON care_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = care_plans.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = care_plans.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  );

-- DELETE: team owner only
CREATE POLICY "Team owner can delete care plan"
  ON care_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = care_plans.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  );

-- ── care_plan_sections ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS care_plan_sections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id      uuid NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  section_key       text NOT NULL CHECK (
    section_key IN (
      'situation',
      'authority',
      'responsibilities',
      'living_arrangement',
      'sustainability',
      'review'
    )
  ),
  content_json      jsonb NOT NULL DEFAULT '{}',
  completion_status text NOT NULL DEFAULT 'not_started' CHECK (
    completion_status IN ('not_started', 'in_progress', 'complete')
  ),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (care_plan_id, section_key)
);

ALTER TABLE care_plan_sections ENABLE ROW LEVEL SECURITY;

-- SELECT: any active member of the team (via care_plans join)
CREATE POLICY "Active team members can view care plan sections"
  ON care_plan_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_plans cp
      JOIN cv_team_members tm ON tm.team_id = cp.team_id
      WHERE cp.id = care_plan_sections.care_plan_id
        AND tm.user_id = auth.uid()
        AND tm.state = 'active'
    )
  );

-- INSERT: team owner only
CREATE POLICY "Team owner can create care plan sections"
  ON care_plan_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_plans cp
      JOIN cv_team_members tm ON tm.team_id = cp.team_id
      WHERE cp.id = care_plan_sections.care_plan_id
        AND tm.user_id = auth.uid()
        AND tm.state = 'active'
        AND tm.role = 'owner'
    )
  );

-- UPDATE: team owner only
CREATE POLICY "Team owner can update care plan sections"
  ON care_plan_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_plans cp
      JOIN cv_team_members tm ON tm.team_id = cp.team_id
      WHERE cp.id = care_plan_sections.care_plan_id
        AND tm.user_id = auth.uid()
        AND tm.state = 'active'
        AND tm.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_plans cp
      JOIN cv_team_members tm ON tm.team_id = cp.team_id
      WHERE cp.id = care_plan_sections.care_plan_id
        AND tm.user_id = auth.uid()
        AND tm.state = 'active'
        AND tm.role = 'owner'
    )
  );

-- DELETE: team owner only
CREATE POLICY "Team owner can delete care plan sections"
  ON care_plan_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_plans cp
      JOIN cv_team_members tm ON tm.team_id = cp.team_id
      WHERE cp.id = care_plan_sections.care_plan_id
        AND tm.user_id = auth.uid()
        AND tm.state = 'active'
        AND tm.role = 'owner'
    )
  );

-- ── updated_at triggers ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_care_plan_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_care_plans_updated_at'
  ) THEN
    CREATE TRIGGER trg_care_plans_updated_at
      BEFORE UPDATE ON care_plans
      FOR EACH ROW EXECUTE FUNCTION set_care_plan_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_care_plan_sections_updated_at'
  ) THEN
    CREATE TRIGGER trg_care_plan_sections_updated_at
      BEFORE UPDATE ON care_plan_sections
      FOR EACH ROW EXECUTE FUNCTION set_care_plan_updated_at();
  END IF;
END $$;

-- ── indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_care_plans_team_id ON care_plans (team_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_sections_care_plan_id ON care_plan_sections (care_plan_id);
