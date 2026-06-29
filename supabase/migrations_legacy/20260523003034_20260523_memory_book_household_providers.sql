/*
  # Memory Book — Household Providers Table

  ## Purpose
  Adds a dedicated table for household service providers — utilities and maintenance
  contacts — distinct from the existing healthcare providers table. Caregivers can
  track electricity, water, gas, internet, phone, waste removal, plumbers,
  electricians, and lawn care services.

  ## New Table: memory_book_household_providers

  Columns:
  - id (uuid PK)
  - memory_book_id (uuid FK → memory_books)
  - team_id (uuid FK → cv_team, for RLS scoping)
  - category: "utility" | "maintenance"
  - sub_category: specific type (electricity, plumber, etc.)
  - provider_name: company/individual name
  - account_number: account or reference number
  - phone: contact phone
  - website: provider website URL
  - notes: freeform notes
  - sort_order: ordering within sub-category
  - standard audit fields

  ## Security
  - RLS enabled; locked by default
  - Active team members: SELECT
  - Active owners only: INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS memory_book_household_providers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id  uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id         uuid NOT NULL REFERENCES cv_team(id) ON DELETE CASCADE,
  category        text NOT NULL DEFAULT 'utility',
  sub_category    text NOT NULL DEFAULT 'other',
  provider_name   text NOT NULL DEFAULT '',
  account_number  text NOT NULL DEFAULT '',
  phone           text NOT NULL DEFAULT '',
  website         text NOT NULL DEFAULT '',
  notes           text NOT NULL DEFAULT '',
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_household_providers_book ON memory_book_household_providers(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_household_providers_team ON memory_book_household_providers(team_id);

ALTER TABLE memory_book_household_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view household providers"
  ON memory_book_household_providers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = memory_book_household_providers.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
    )
  );

CREATE POLICY "Owners can insert household providers"
  ON memory_book_household_providers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = memory_book_household_providers.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  );

CREATE POLICY "Owners can update household providers"
  ON memory_book_household_providers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = memory_book_household_providers.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = memory_book_household_providers.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete household providers"
  ON memory_book_household_providers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = memory_book_household_providers.team_id
        AND cv_team_members.user_id = auth.uid()
        AND cv_team_members.state = 'active'
        AND cv_team_members.role = 'owner'
    )
  );
