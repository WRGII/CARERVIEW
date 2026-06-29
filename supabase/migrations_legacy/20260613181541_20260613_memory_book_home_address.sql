
-- memory_book_home_address: one row per memory book
CREATE TABLE IF NOT EXISTS memory_book_home_address (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id    uuid NOT NULL REFERENCES memory_books(id) ON DELETE CASCADE,
  team_id           uuid NOT NULL REFERENCES cv_team(id) ON DELETE CASCADE,
  street_number     text,
  street_name       text,
  apt_unit          text,
  building_name     text,
  city              text,
  county_township   text,
  state_province    text,
  country           text,
  postal_code       text,
  history_description text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (memory_book_id)
);

ALTER TABLE memory_book_home_address ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_home_address' AND policyname = 'select_own_home_address'
  ) THEN
    CREATE POLICY "select_own_home_address" ON memory_book_home_address
      FOR SELECT TO authenticated
      USING (
        team_id IN (
          SELECT team_id FROM cv_team_members
          WHERE user_id = auth.uid() AND state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_home_address' AND policyname = 'insert_own_home_address'
  ) THEN
    CREATE POLICY "insert_own_home_address" ON memory_book_home_address
      FOR INSERT TO authenticated
      WITH CHECK (
        team_id IN (
          SELECT team_id FROM cv_team_members
          WHERE user_id = auth.uid() AND state = 'active' AND role = 'owner'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_home_address' AND policyname = 'update_own_home_address'
  ) THEN
    CREATE POLICY "update_own_home_address" ON memory_book_home_address
      FOR UPDATE TO authenticated
      USING (
        team_id IN (
          SELECT team_id FROM cv_team_members
          WHERE user_id = auth.uid() AND state = 'active' AND role = 'owner'
        )
      )
      WITH CHECK (
        team_id IN (
          SELECT team_id FROM cv_team_members
          WHERE user_id = auth.uid() AND state = 'active' AND role = 'owner'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_home_address' AND policyname = 'delete_own_home_address'
  ) THEN
    CREATE POLICY "delete_own_home_address" ON memory_book_home_address
      FOR DELETE TO authenticated
      USING (
        team_id IN (
          SELECT team_id FROM cv_team_members
          WHERE user_id = auth.uid() AND state = 'active' AND role = 'owner'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memory_book_home_address_book_id
  ON memory_book_home_address (memory_book_id);

CREATE INDEX IF NOT EXISTS idx_memory_book_home_address_team_id
  ON memory_book_home_address (team_id);
