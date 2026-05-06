/*
  # Create user_onboarding table

  ## Summary
  Creates the user_onboarding table to persist tutorial and onboarding state
  per user. The useOnboarding hook references this table but it was never
  created — only a later ALTER TABLE migration existed (adding care_hub_visited).

  ## New Tables
  - `user_onboarding`
    - `user_id` (uuid, PK, FK → auth.users)
    - `tutorial_completed` (boolean, default false) — user finished all steps
    - `tutorial_step` (int, default 0) — current step index
    - `tutorial_dismissed` (boolean, default false) — user skipped tutorial
    - `welcome_dismissed` (boolean, default false) — first-time welcome banner dismissed
    - `care_hub_visited` (boolean, default false) — user accessed care plan feature
    - `created_at` (timestamptz, default now())
    - `updated_at` (timestamptz, default now())

  ## Security
  - RLS enabled; only the owning user can read/write their row
*/

CREATE TABLE IF NOT EXISTS user_onboarding (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_completed  boolean NOT NULL DEFAULT false,
  tutorial_step       integer NOT NULL DEFAULT 0,
  tutorial_dismissed  boolean NOT NULL DEFAULT false,
  welcome_dismissed   boolean NOT NULL DEFAULT false,
  care_hub_visited    boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_onboarding' AND policyname = 'Users can read own onboarding row'
  ) THEN
    CREATE POLICY "Users can read own onboarding row"
      ON user_onboarding FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_onboarding' AND policyname = 'Users can insert own onboarding row'
  ) THEN
    CREATE POLICY "Users can insert own onboarding row"
      ON user_onboarding FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_onboarding' AND policyname = 'Users can update own onboarding row'
  ) THEN
    CREATE POLICY "Users can update own onboarding row"
      ON user_onboarding FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
