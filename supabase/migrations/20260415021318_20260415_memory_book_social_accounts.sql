/*
  # Add memory_book_social_accounts table

  ## Summary
  Adds a new section to the Memory Book for tracking Social Media and Online Accounts.
  This allows caregivers to record the resident's social media profiles, email accounts,
  shopping accounts, banking portals, and any other online presence — enabling families
  to manage digital assets appropriately.

  ## New Tables

  ### memory_book_social_accounts
  - `id` (uuid, PK) – unique identifier
  - `memory_book_id` (uuid, FK → memory_books) – which memory book this belongs to
  - `team_id` (uuid, FK → cv_team) – owning team for RLS scoping
  - `platform` (text) – platform name, e.g. "Facebook", "Gmail", "Custom Service"
  - `username` (text) – username, handle, or email address used on the platform
  - `url` (text) – optional direct URL to the profile or login page
  - `notes` (text) – free-form notes (login hints, who manages it, etc.)
  - `sort_order` (integer) – display ordering
  - Standard audit columns: created_at, updated_at, created_by, updated_by

  ## Security

  ### RLS Policies
  - SELECT: any active team member can view social accounts
  - INSERT: only owners can add entries
  - UPDATE: only owners can edit entries
  - DELETE: only owners can remove entries
*/

CREATE TABLE IF NOT EXISTS public.memory_book_social_accounts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid        NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id        uuid        NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  platform       text        NOT NULL DEFAULT '',
  username       text        NOT NULL DEFAULT '',
  url            text        NOT NULL DEFAULT '',
  notes          text        NOT NULL DEFAULT '',
  sort_order     integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mb_social_accounts_book ON public.memory_book_social_accounts(memory_book_id);
CREATE INDEX IF NOT EXISTS idx_mb_social_accounts_team ON public.memory_book_social_accounts(team_id);

ALTER TABLE public.memory_book_social_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_social_accounts'
      AND policyname = 'Active members can view social accounts'
  ) THEN
    CREATE POLICY "Active members can view social accounts"
      ON public.memory_book_social_accounts FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_social_accounts.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memory_book_social_accounts'
      AND policyname = 'Owners can insert social accounts'
  ) THEN
    CREATE POLICY "Owners can insert social accounts"
      ON public.memory_book_social_accounts FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_social_accounts.team_id
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
    WHERE tablename = 'memory_book_social_accounts'
      AND policyname = 'Owners can update social accounts'
  ) THEN
    CREATE POLICY "Owners can update social accounts"
      ON public.memory_book_social_accounts FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_social_accounts.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_social_accounts.team_id
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
    WHERE tablename = 'memory_book_social_accounts'
      AND policyname = 'Owners can delete social accounts'
  ) THEN
    CREATE POLICY "Owners can delete social accounts"
      ON public.memory_book_social_accounts FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.cv_team_members
          WHERE cv_team_members.team_id = memory_book_social_accounts.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.role = 'owner'
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;
