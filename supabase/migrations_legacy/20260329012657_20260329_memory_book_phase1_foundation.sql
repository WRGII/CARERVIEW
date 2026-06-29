/*
  # Memory Book + Scheduler — Phase 1 Foundation

  ## Overview
  Creates the foundational tables for the Memory Book module, anchored to the
  existing cv_team and cv_team_patient tables. All access is team-scoped only;
  app-level admin role grants NO special access to this module.

  ## New Tables

  ### memory_books
  - One record per team/patient pair
  - Anchors all memory book sections
  - team_id → cv_team, patient_id → cv_team_patient

  ### memory_book_identity
  - One record per memory book
  - Stores preferred name, birthplace, address preference, relationship status,
    cultural/language preferences, about-me summary
  - Owner-only write access

  ### memory_book_contacts
  - Multiple contact records per memory book
  - Stores name, relationship, phone, email, notes, role tag
  - Owner-only write access

  ### memory_book_medical
  - One record per memory book
  - Stores conditions, allergies, hearing notes, vision notes, medication notes
  - Owner-only write access

  ### memory_book_preferences
  - One record per memory book
  - Stores likes, dislikes, food preferences, music, conversation topics,
    comforts, fears, sensory preferences
  - Owner-only write access

  ## Security
  - RLS enabled on all tables
  - SELECT: any active team member (cv_team_members.state = 'active')
  - INSERT/UPDATE/DELETE: team owner only (cv_team_members.role = 'owner')
  - NO access based on profiles.role = 'admin'

  ## Notes
  1. patient_id references cv_team_patient(team_id) which is a 1:1 PK relationship
  2. memory_books has a unique constraint on (team_id, patient_id)
  3. All tables include created_by and updated_by for auditability
*/

-- ============================================================
-- memory_books (anchor table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memory_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.cv_team_patient(team_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (team_id, patient_id)
);

ALTER TABLE public.memory_books ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS memory_books_team_id_idx ON public.memory_books(team_id);
CREATE INDEX IF NOT EXISTS memory_books_patient_id_idx ON public.memory_books(patient_id);

-- SELECT: active team members
CREATE POLICY "Team members can view their memory book"
  ON public.memory_books FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_books.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.state = 'active'
    )
  );

-- INSERT: team owners only
CREATE POLICY "Team owners can create memory book"
  ON public.memory_books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_books.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- UPDATE: team owners only
CREATE POLICY "Team owners can update memory book"
  ON public.memory_books FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_books.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_books.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- DELETE: team owners only
CREATE POLICY "Team owners can delete memory book"
  ON public.memory_books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_books.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- ============================================================
-- memory_book_identity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memory_book_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  preferred_name text DEFAULT '' NOT NULL,
  birthplace text DEFAULT '' NOT NULL,
  address_preference text DEFAULT '' NOT NULL,
  relationship_status text DEFAULT '' NOT NULL,
  cultural_preferences text DEFAULT '' NOT NULL,
  language_preferences text DEFAULT '' NOT NULL,
  about_me text DEFAULT '' NOT NULL,
  photo_url text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (memory_book_id)
);

ALTER TABLE public.memory_book_identity ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS memory_book_identity_team_id_idx ON public.memory_book_identity(team_id);
CREATE INDEX IF NOT EXISTS memory_book_identity_memory_book_id_idx ON public.memory_book_identity(memory_book_id);

CREATE POLICY "Team members can view identity"
  ON public.memory_book_identity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_identity.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can insert identity"
  ON public.memory_book_identity FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_identity.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can update identity"
  ON public.memory_book_identity FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_identity.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_identity.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can delete identity"
  ON public.memory_book_identity FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_identity.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- ============================================================
-- memory_book_contacts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memory_book_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  full_name text DEFAULT '' NOT NULL,
  relationship text DEFAULT '' NOT NULL,
  role_tag text DEFAULT '' NOT NULL,
  phone text DEFAULT '' NOT NULL,
  email text DEFAULT '' NOT NULL,
  notes text DEFAULT '' NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.memory_book_contacts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS memory_book_contacts_memory_book_id_idx ON public.memory_book_contacts(memory_book_id);
CREATE INDEX IF NOT EXISTS memory_book_contacts_team_id_idx ON public.memory_book_contacts(team_id);

CREATE POLICY "Team members can view contacts"
  ON public.memory_book_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_contacts.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can insert contacts"
  ON public.memory_book_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_contacts.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can update contacts"
  ON public.memory_book_contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_contacts.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_contacts.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can delete contacts"
  ON public.memory_book_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_contacts.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- ============================================================
-- memory_book_medical
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memory_book_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  conditions text DEFAULT '' NOT NULL,
  allergies text DEFAULT '' NOT NULL,
  hearing_notes text DEFAULT '' NOT NULL,
  vision_notes text DEFAULT '' NOT NULL,
  medication_notes text DEFAULT '' NOT NULL,
  other_medical_notes text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (memory_book_id)
);

ALTER TABLE public.memory_book_medical ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS memory_book_medical_memory_book_id_idx ON public.memory_book_medical(memory_book_id);
CREATE INDEX IF NOT EXISTS memory_book_medical_team_id_idx ON public.memory_book_medical(team_id);

CREATE POLICY "Team members can view medical"
  ON public.memory_book_medical FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_medical.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can insert medical"
  ON public.memory_book_medical FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_medical.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can update medical"
  ON public.memory_book_medical FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_medical.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_medical.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can delete medical"
  ON public.memory_book_medical FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_medical.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- ============================================================
-- memory_book_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memory_book_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  likes text DEFAULT '' NOT NULL,
  dislikes text DEFAULT '' NOT NULL,
  foods_liked text DEFAULT '' NOT NULL,
  foods_disliked text DEFAULT '' NOT NULL,
  music_preferences text DEFAULT '' NOT NULL,
  conversation_topics text DEFAULT '' NOT NULL,
  comforts text DEFAULT '' NOT NULL,
  fears text DEFAULT '' NOT NULL,
  sensory_preferences text DEFAULT '' NOT NULL,
  things_to_avoid text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (memory_book_id)
);

ALTER TABLE public.memory_book_preferences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS memory_book_preferences_memory_book_id_idx ON public.memory_book_preferences(memory_book_id);
CREATE INDEX IF NOT EXISTS memory_book_preferences_team_id_idx ON public.memory_book_preferences(team_id);

CREATE POLICY "Team members can view preferences"
  ON public.memory_book_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_preferences.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can insert preferences"
  ON public.memory_book_preferences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_preferences.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can update preferences"
  ON public.memory_book_preferences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_preferences.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_preferences.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

CREATE POLICY "Team owners can delete preferences"
  ON public.memory_book_preferences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cv_team_members ctm
      WHERE ctm.team_id = memory_book_preferences.team_id
        AND ctm.user_id = auth.uid()
        AND ctm.role = 'owner'
        AND ctm.state = 'active'
    )
  );

-- ============================================================
-- Helper function: get or create memory book for a team
-- ============================================================
CREATE OR REPLACE FUNCTION public.mb_get_or_create(
  p_team_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_book_id uuid;
  v_patient_id uuid;
  v_is_member boolean;
BEGIN
  -- Verify caller is an active team member
  SELECT EXISTS (
    SELECT 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND state = 'active'
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  -- Get patient_id (cv_team_patient PK = team_id)
  SELECT team_id INTO v_patient_id
  FROM public.cv_team_patient
  WHERE team_id = p_team_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'No patient found for this team';
  END IF;

  -- Try to get existing
  SELECT id INTO v_book_id
  FROM public.memory_books
  WHERE team_id = p_team_id AND patient_id = v_patient_id;

  -- Create if not exists (only owners can trigger creation)
  IF v_book_id IS NULL THEN
    -- Check owner role for creation
    PERFORM 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND state = 'active';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Only team owners can initialize the memory book';
    END IF;

    INSERT INTO public.memory_books (team_id, patient_id, created_by, updated_by)
    VALUES (p_team_id, v_patient_id, auth.uid(), auth.uid())
    RETURNING id INTO v_book_id;
  END IF;

  RETURN v_book_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.mb_get_or_create(uuid) TO authenticated;
