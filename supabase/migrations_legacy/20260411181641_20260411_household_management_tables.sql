/*
  # Household Management Tables — Memory Book Phase 2

  ## Overview
  Adds five new structured sections to the Memory Book feature, enabling
  family and in-home caregivers to record and manage household management
  information for their care recipient.

  ## New Tables

  ### 1. memory_book_providers
  - Multiple records per memory book (list pattern, like contacts)
  - Stores healthcare providers: doctors, dentists, pharmacies, specialists
  - Fields: name, specialty_label, practice_name, phone, address, notes, is_primary, sort_order

  ### 2. memory_book_insurance
  - One record per memory book (single-record pattern, like medical)
  - Stores health insurance details: primary, secondary, dental/vision
  - Fields: primary_insurer, primary_plan, primary_member_id, primary_coverage_type,
            secondary_insurer, secondary_plan, secondary_member_id, secondary_coverage_type,
            dental_vision_insurer, dental_vision_plan, notes

  ### 3. memory_book_finances
  - One record per memory book (single-record pattern)
  - Owner-only SELECT (unlike other sections where members can read)
  - Fields: bank_name, income_sources, auto_pay_bills, investment_notes

  ### 4. memory_book_subscriptions
  - Multiple records per memory book (list pattern)
  - Tracks TV/streaming, magazines, memberships, and other subscriptions
  - Fields: name, category, notes, sort_order

  ### 5. memory_book_vehicle
  - Multiple records per memory book (list pattern)
  - Tracks vehicle details, registration, service, and parking
  - Fields: make_model_year, license_plate, registration_due, service_provider,
            parking_location, notes, sort_order

  ## Security
  - RLS enabled on all tables
  - SELECT: active team members (except finances: owner only)
  - INSERT/UPDATE/DELETE: team owner only
  - All policies use auth.uid() and cv_team_members role checks
*/

-- ============================================================
-- 1. memory_book_providers
-- ============================================================

CREATE TABLE IF NOT EXISTS public.memory_book_providers (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id   uuid        NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id          uuid        NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  name             text        NOT NULL DEFAULT '',
  specialty_label  text        NOT NULL DEFAULT '',
  practice_name    text        NOT NULL DEFAULT '',
  phone            text        NOT NULL DEFAULT '',
  address          text        NOT NULL DEFAULT '',
  notes            text        NOT NULL DEFAULT '',
  is_primary       boolean     NOT NULL DEFAULT false,
  sort_order       integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_providers_book ON public.memory_book_providers(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_providers_team ON public.memory_book_providers(team_id);

ALTER TABLE public.memory_book_providers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_providers' AND policyname = 'Active members can view providers'
  ) THEN
    CREATE POLICY "Active members can view providers"
      ON public.memory_book_providers FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_providers.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_providers' AND policyname = 'Owners can insert providers'
  ) THEN
    CREATE POLICY "Owners can insert providers"
      ON public.memory_book_providers FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_providers.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_providers' AND policyname = 'Owners can update providers'
  ) THEN
    CREATE POLICY "Owners can update providers"
      ON public.memory_book_providers FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_providers.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_providers.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_providers' AND policyname = 'Owners can delete providers'
  ) THEN
    CREATE POLICY "Owners can delete providers"
      ON public.memory_book_providers FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_providers.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- ============================================================
-- 2. memory_book_insurance
-- ============================================================

CREATE TABLE IF NOT EXISTS public.memory_book_insurance (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id           uuid        NOT NULL UNIQUE REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id                  uuid        NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  primary_insurer          text        NOT NULL DEFAULT '',
  primary_plan             text        NOT NULL DEFAULT '',
  primary_member_id        text        NOT NULL DEFAULT '',
  primary_coverage_type    text        NOT NULL DEFAULT '',
  secondary_insurer        text        NOT NULL DEFAULT '',
  secondary_plan           text        NOT NULL DEFAULT '',
  secondary_member_id      text        NOT NULL DEFAULT '',
  secondary_coverage_type  text        NOT NULL DEFAULT '',
  dental_vision_insurer    text        NOT NULL DEFAULT '',
  dental_vision_plan       text        NOT NULL DEFAULT '',
  notes                    text        NOT NULL DEFAULT '',
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  created_by               uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by               uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_insurance_book ON public.memory_book_insurance(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_insurance_team ON public.memory_book_insurance(team_id);

ALTER TABLE public.memory_book_insurance ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_insurance' AND policyname = 'Active members can view insurance'
  ) THEN
    CREATE POLICY "Active members can view insurance"
      ON public.memory_book_insurance FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_insurance' AND policyname = 'Owners can insert insurance'
  ) THEN
    CREATE POLICY "Owners can insert insurance"
      ON public.memory_book_insurance FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_insurance' AND policyname = 'Owners can update insurance'
  ) THEN
    CREATE POLICY "Owners can update insurance"
      ON public.memory_book_insurance FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_insurance' AND policyname = 'Owners can delete insurance'
  ) THEN
    CREATE POLICY "Owners can delete insurance"
      ON public.memory_book_insurance FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_insurance.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- ============================================================
-- 3. memory_book_finances (owner-only SELECT)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.memory_book_finances (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id     uuid        NOT NULL UNIQUE REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id            uuid        NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  bank_name          text        NOT NULL DEFAULT '',
  income_sources     text        NOT NULL DEFAULT '',
  auto_pay_bills     text        NOT NULL DEFAULT '',
  investment_notes   text        NOT NULL DEFAULT '',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by         uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_finances_book ON public.memory_book_finances(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_finances_team ON public.memory_book_finances(team_id);

ALTER TABLE public.memory_book_finances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_finances' AND policyname = 'Owners can view finances'
  ) THEN
    CREATE POLICY "Owners can view finances"
      ON public.memory_book_finances FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_finances.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_finances' AND policyname = 'Owners can insert finances'
  ) THEN
    CREATE POLICY "Owners can insert finances"
      ON public.memory_book_finances FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_finances.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_finances' AND policyname = 'Owners can update finances'
  ) THEN
    CREATE POLICY "Owners can update finances"
      ON public.memory_book_finances FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_finances.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_finances.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_finances' AND policyname = 'Owners can delete finances'
  ) THEN
    CREATE POLICY "Owners can delete finances"
      ON public.memory_book_finances FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_finances.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- ============================================================
-- 4. memory_book_subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.memory_book_subscriptions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid        NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id        uuid        NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  name           text        NOT NULL DEFAULT '',
  category       text        NOT NULL DEFAULT 'Other',
  notes          text        NOT NULL DEFAULT '',
  sort_order     integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_subscriptions_book ON public.memory_book_subscriptions(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_subscriptions_team ON public.memory_book_subscriptions(team_id);

ALTER TABLE public.memory_book_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_subscriptions' AND policyname = 'Active members can view subscriptions'
  ) THEN
    CREATE POLICY "Active members can view subscriptions"
      ON public.memory_book_subscriptions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_subscriptions.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_subscriptions' AND policyname = 'Owners can insert subscriptions'
  ) THEN
    CREATE POLICY "Owners can insert subscriptions"
      ON public.memory_book_subscriptions FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_subscriptions.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_subscriptions' AND policyname = 'Owners can update subscriptions'
  ) THEN
    CREATE POLICY "Owners can update subscriptions"
      ON public.memory_book_subscriptions FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_subscriptions.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_subscriptions.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_subscriptions' AND policyname = 'Owners can delete subscriptions'
  ) THEN
    CREATE POLICY "Owners can delete subscriptions"
      ON public.memory_book_subscriptions FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_subscriptions.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- ============================================================
-- 5. memory_book_vehicle
-- ============================================================

CREATE TABLE IF NOT EXISTS public.memory_book_vehicle (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id    uuid        NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id           uuid        NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  make_model_year   text        NOT NULL DEFAULT '',
  license_plate     text        NOT NULL DEFAULT '',
  registration_due  text        NOT NULL DEFAULT '',
  service_provider  text        NOT NULL DEFAULT '',
  parking_location  text        NOT NULL DEFAULT '',
  notes             text        NOT NULL DEFAULT '',
  sort_order        integer     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_vehicle_book ON public.memory_book_vehicle(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_vehicle_team ON public.memory_book_vehicle(team_id);

ALTER TABLE public.memory_book_vehicle ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_vehicle' AND policyname = 'Active members can view vehicles'
  ) THEN
    CREATE POLICY "Active members can view vehicles"
      ON public.memory_book_vehicle FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_vehicle' AND policyname = 'Owners can insert vehicles'
  ) THEN
    CREATE POLICY "Owners can insert vehicles"
      ON public.memory_book_vehicle FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_vehicle' AND policyname = 'Owners can update vehicles'
  ) THEN
    CREATE POLICY "Owners can update vehicles"
      ON public.memory_book_vehicle FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memory_book_vehicle' AND policyname = 'Owners can delete vehicles'
  ) THEN
    CREATE POLICY "Owners can delete vehicles"
      ON public.memory_book_vehicle FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_vehicle.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;
