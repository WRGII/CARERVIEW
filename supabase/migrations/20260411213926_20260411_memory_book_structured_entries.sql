/*
  # Memory Book Structured Entry Tables

  ## Summary
  Replaces bulk free-text fields in Insurance, Finances, Medical, and Preferences
  sections with normalized, per-entry row tables. Each table stores one labeled
  entry per row, allowing caregivers to add, edit, and delete individual items
  rather than editing one large textarea.

  ## New Tables

  ### memory_book_insurance_entries
  - One row per insurance policy (e.g. "Health - Primary", "Auto", "Home & Contents")
  - Fields: label, insurer, policy_number, member_id, coverage_type, notes
  - Many-to-one with memory_books

  ### memory_book_finance_entries
  - One row per finance item (e.g. "Bank - Checking", "Income - Social Security")
  - Fields: label, category (bank/income/auto_pay/investment), value, notes
  - Many-to-one with memory_books; owner-only access

  ### memory_book_medical_entries
  - One row per medical item (e.g. "Condition - Diabetes", "Allergy - Penicillin")
  - Fields: label, category (condition/allergy/medication/hearing/vision/other), value, notes
  - Many-to-one with memory_books

  ### memory_book_preference_entries
  - One row per preference item (e.g. "Likes - Gardening", "Fear - Loud Noises")
  - Fields: label, category (likes/dislikes/food_liked/food_disliked/music/conversation/comfort/fear/sensory/avoid), value
  - Many-to-one with memory_books

  ## Security
  - RLS enabled on all tables
  - SELECT: any active team member (cv_team_members.state = 'active')
  - INSERT/UPDATE/DELETE: team owner only (cv_team_members.role = 'owner')
  - Finance entries: owner-only even for SELECT

  ## Notes
  - Existing tables (memory_book_insurance, memory_book_finances, etc.) are preserved
  - All tables include sort_order for manual ordering
  - Audit columns: created_by, updated_by, created_at, updated_at
*/

-- Insurance entries
CREATE TABLE IF NOT EXISTS memory_book_insurance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  insurer text NOT NULL DEFAULT '',
  policy_number text NOT NULL DEFAULT '',
  member_id text NOT NULL DEFAULT '',
  coverage_type text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_mb_insurance_entries_book ON memory_book_insurance_entries(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_insurance_entries_team ON memory_book_insurance_entries(team_id);

ALTER TABLE memory_book_insurance_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_insurance_entries' AND policyname = 'Team members can view insurance entries'
  ) THEN
    CREATE POLICY "Team members can view insurance entries"
      ON memory_book_insurance_entries FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_insurance_entries' AND policyname = 'Team owners can insert insurance entries'
  ) THEN
    CREATE POLICY "Team owners can insert insurance entries"
      ON memory_book_insurance_entries FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_insurance_entries' AND policyname = 'Team owners can update insurance entries'
  ) THEN
    CREATE POLICY "Team owners can update insurance entries"
      ON memory_book_insurance_entries FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_insurance_entries' AND policyname = 'Team owners can delete insurance entries'
  ) THEN
    CREATE POLICY "Team owners can delete insurance entries"
      ON memory_book_insurance_entries FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- Finance entries (owner-only for all operations)
CREATE TABLE IF NOT EXISTS memory_book_finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'bank',
  value text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_mb_finance_entries_book ON memory_book_finance_entries(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_finance_entries_team ON memory_book_finance_entries(team_id);

ALTER TABLE memory_book_finance_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_finance_entries' AND policyname = 'Team owners can view finance entries'
  ) THEN
    CREATE POLICY "Team owners can view finance entries"
      ON memory_book_finance_entries FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_finance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_finance_entries' AND policyname = 'Team owners can insert finance entries'
  ) THEN
    CREATE POLICY "Team owners can insert finance entries"
      ON memory_book_finance_entries FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_finance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_finance_entries' AND policyname = 'Team owners can update finance entries'
  ) THEN
    CREATE POLICY "Team owners can update finance entries"
      ON memory_book_finance_entries FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_finance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_finance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_finance_entries' AND policyname = 'Team owners can delete finance entries'
  ) THEN
    CREATE POLICY "Team owners can delete finance entries"
      ON memory_book_finance_entries FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_finance_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- Medical entries
CREATE TABLE IF NOT EXISTS memory_book_medical_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'condition',
  value text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_mb_medical_entries_book ON memory_book_medical_entries(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_medical_entries_team ON memory_book_medical_entries(team_id);

ALTER TABLE memory_book_medical_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_medical_entries' AND policyname = 'Team members can view medical entries'
  ) THEN
    CREATE POLICY "Team members can view medical entries"
      ON memory_book_medical_entries FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_medical_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_medical_entries' AND policyname = 'Team owners can insert medical entries'
  ) THEN
    CREATE POLICY "Team owners can insert medical entries"
      ON memory_book_medical_entries FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_medical_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_medical_entries' AND policyname = 'Team owners can update medical entries'
  ) THEN
    CREATE POLICY "Team owners can update medical entries"
      ON memory_book_medical_entries FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_medical_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_medical_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_medical_entries' AND policyname = 'Team owners can delete medical entries'
  ) THEN
    CREATE POLICY "Team owners can delete medical entries"
      ON memory_book_medical_entries FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_medical_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- Preference entries
CREATE TABLE IF NOT EXISTS memory_book_preference_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'likes',
  value text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_mb_preference_entries_book ON memory_book_preference_entries(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_preference_entries_team ON memory_book_preference_entries(team_id);

ALTER TABLE memory_book_preference_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_preference_entries' AND policyname = 'Team members can view preference entries'
  ) THEN
    CREATE POLICY "Team members can view preference entries"
      ON memory_book_preference_entries FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_preference_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_preference_entries' AND policyname = 'Team owners can insert preference entries'
  ) THEN
    CREATE POLICY "Team owners can insert preference entries"
      ON memory_book_preference_entries FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_preference_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_preference_entries' AND policyname = 'Team owners can update preference entries'
  ) THEN
    CREATE POLICY "Team owners can update preference entries"
      ON memory_book_preference_entries FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_preference_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_preference_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_preference_entries' AND policyname = 'Team owners can delete preference entries'
  ) THEN
    CREATE POLICY "Team owners can delete preference entries"
      ON memory_book_preference_entries FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = memory_book_preference_entries.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;
