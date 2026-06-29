/*
  # Add care_hub_visited to user_onboarding

  ## Summary
  Adds a boolean column `care_hub_visited` to the `user_onboarding` table.

  ## Purpose
  When a user upgrades to a paid plan, they are redirected to Care Hub once
  to orient them. This flag records that the redirect has happened so it only
  fires once per user. Default is false so existing rows are unaffected.

  ## Changes
  - `user_onboarding`: add column `care_hub_visited` (boolean, default false)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_onboarding' AND column_name = 'care_hub_visited'
  ) THEN
    ALTER TABLE public.user_onboarding ADD COLUMN care_hub_visited boolean NOT NULL DEFAULT false;
  END IF;
END $$;
