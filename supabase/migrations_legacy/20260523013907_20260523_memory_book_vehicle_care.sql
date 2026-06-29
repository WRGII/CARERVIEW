/*
  # Memory Book — Vehicle Care Providers Table

  ## Purpose
  Adds a table to track auto and vehicle maintenance service providers for each
  memory book. Caregivers can record mechanics, tire shops, detailers, body shops,
  and other vehicle service contacts alongside the vehicles themselves.

  ## New Table: memory_book_vehicle_care

  Columns:
  - id (uuid PK)
  - memory_book_id (uuid FK → memory_books)
  - team_id (uuid FK → cv_team, for RLS scoping)
  - provider_name: company or individual name (required)
  - sub_category: type of service (oil_change, tires, brakes, detailing, inspection, body_work, other)
  - phone: contact phone number
  - website: provider website URL
  - notes: freeform notes (preferred contact, service schedule, etc.)
  - sort_order: ordering within the list
  - Standard audit fields (created_at, updated_at, created_by, updated_by)

  ## Security
  - RLS enabled; locked by default
  - Active team members: SELECT
  - Active owners only: INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS memory_book_vehicle_care (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id  uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id         uuid NOT NULL REFERENCES cv_team(id) ON DELETE CASCADE,
  provider_name   text NOT NULL DEFAULT '',
  sub_category    text NOT NULL DEFAULT 'other',
  phone           text NOT NULL DEFAULT '',
  website         text NOT NULL DEFAULT '',
  notes           text NOT NULL DEFAULT '',
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_vehicle_care_book ON memory_book_vehicle_care(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_vehicle_care_team ON memory_book_vehicle_care(team_id);

ALTER TABLE memory_book_vehicle_care ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_vehicle_care'
      AND policyname = 'Team members can view vehicle care providers'
  ) THEN
    CREATE POLICY "Team members can view vehicle care providers"
      ON memory_book_vehicle_care FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle_care.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_vehicle_care'
      AND policyname = 'Owners can insert vehicle care providers'
  ) THEN
    CREATE POLICY "Owners can insert vehicle care providers"
      ON memory_book_vehicle_care FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle_care.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
            AND cv_team_members.role = 'owner'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_vehicle_care'
      AND policyname = 'Owners can update vehicle care providers'
  ) THEN
    CREATE POLICY "Owners can update vehicle care providers"
      ON memory_book_vehicle_care FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle_care.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
            AND cv_team_members.role = 'owner'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle_care.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
            AND cv_team_members.role = 'owner'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_vehicle_care'
      AND policyname = 'Owners can delete vehicle care providers'
  ) THEN
    CREATE POLICY "Owners can delete vehicle care providers"
      ON memory_book_vehicle_care FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle_care.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
            AND cv_team_members.role = 'owner'
        )
      );
  END IF;
END $$;
