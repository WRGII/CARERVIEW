/*
  # Restore user_onboarding RLS Policies

  ## Problem
  Migration 20260610084502 dropped all three RLS policies on user_onboarding,
  describing them as duplicates. They were not duplicates — they were the only
  access policies on the table. With RLS enabled and zero policies, every
  authenticated user is locked out of their own onboarding row, breaking the
  tutorial flow, welcome banner, and care hub visited tracking.

  ## Fix
  Recreate all three policies (SELECT, INSERT, UPDATE) scoped to the
  authenticated user's own row via auth.uid() = user_id.
*/

DROP POLICY IF EXISTS "Users can read own onboarding" ON user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding" ON user_onboarding;

-- Also drop the original names in case they somehow still exist
DROP POLICY IF EXISTS "Users can read own onboarding row" ON user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding row" ON user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding row" ON user_onboarding;

CREATE POLICY "Users can read own onboarding"
  ON user_onboarding FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON user_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON user_onboarding FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
