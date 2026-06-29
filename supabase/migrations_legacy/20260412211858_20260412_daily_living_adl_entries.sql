/*
  # Daily Living ADL Entries Table

  ## Purpose
  Adds structured Activities of Daily Living (ADL) and Instrumental Activities of Daily Living (IADL)
  tracking to the Memory Book feature.

  ## New Tables
  - `memory_book_daily_living_entries`
    - `id` (uuid, primary key)
    - `memory_book_id` (uuid, FK to memory_books)
    - `team_id` (uuid, for RLS performance)
    - `section` (text) — "adl" or "iadl"
    - `category` (text) — e.g. "bathing", "dressing", "meal_prep"
    - `label` (text) — custom label or pre-filled from category
    - `independence_level` (text) — "independent" | "needs_reminders" | "supervision" | "assistance" | "fully_dependent"
    - `notes` (text)
    - `sort_order` (int)
    - Audit columns: created_by, updated_by, created_at, updated_at

  ## Security
  - RLS enabled
  - All active cv_team_members can SELECT
  - Only team owners can INSERT, UPDATE, DELETE

  ## Notes
  - Uses cv_team_members table (state = 'active', role = 'owner' for owner check)
*/

CREATE TABLE IF NOT EXISTS memory_book_daily_living_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL,
  section text NOT NULL DEFAULT 'adl',
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL DEFAULT '',
  independence_level text NOT NULL DEFAULT 'independent',
  notes text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT memory_book_daily_living_section_check CHECK (section IN ('adl', 'iadl')),
  CONSTRAINT memory_book_daily_living_level_check CHECK (
    independence_level IN ('independent', 'needs_reminders', 'supervision', 'assistance', 'fully_dependent')
  )
);

ALTER TABLE memory_book_daily_living_entries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_mb_daily_living_memory_book_id
  ON memory_book_daily_living_entries(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_daily_living_team_id
  ON memory_book_daily_living_entries(team_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_daily_living_entries'
      AND policyname = 'Active team members can view daily living entries'
  ) THEN
    CREATE POLICY "Active team members can view daily living entries"
      ON memory_book_daily_living_entries FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members tm
          WHERE tm.team_id = memory_book_daily_living_entries.team_id
            AND tm.user_id = auth.uid()
            AND tm.state = 'active'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_daily_living_entries'
      AND policyname = 'Team owners can insert daily living entries'
  ) THEN
    CREATE POLICY "Team owners can insert daily living entries"
      ON memory_book_daily_living_entries FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members tm
          WHERE tm.team_id = memory_book_daily_living_entries.team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'owner'
            AND tm.state = 'active'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_daily_living_entries'
      AND policyname = 'Team owners can update daily living entries'
  ) THEN
    CREATE POLICY "Team owners can update daily living entries"
      ON memory_book_daily_living_entries FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members tm
          WHERE tm.team_id = memory_book_daily_living_entries.team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'owner'
            AND tm.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members tm
          WHERE tm.team_id = memory_book_daily_living_entries.team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'owner'
            AND tm.state = 'active'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_daily_living_entries'
      AND policyname = 'Team owners can delete daily living entries'
  ) THEN
    CREATE POLICY "Team owners can delete daily living entries"
      ON memory_book_daily_living_entries FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members tm
          WHERE tm.team_id = memory_book_daily_living_entries.team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'owner'
            AND tm.state = 'active'
        )
      );
  END IF;
END $$;
