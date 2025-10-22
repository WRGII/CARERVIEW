/*
  # Update Observation RLS Policies for Team Access

  1. Updates
    - Modify SELECT policy to allow team members to view team observations
    - Modify INSERT policy to allow active team members to create observations
    - Modify UPDATE policy to allow team members to edit team observations
    - Modify DELETE policy to allow team members to delete team observations

  2. Security
    - Users can view their own observations OR observations from teams they belong to
    - Users can only create observations if they're active team members (not frozen)
    - Preserves existing user_id-based access for non-team observations
*/

-- Drop existing policies to recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "observations_select_policy" ON public.observations;
  DROP POLICY IF EXISTS "Users can view their own observations" ON public.observations;
  DROP POLICY IF EXISTS "observations_insert_policy" ON public.observations;
  DROP POLICY IF EXISTS "Users can create observations" ON public.observations;
  DROP POLICY IF EXISTS "observations_update_policy" ON public.observations;
  DROP POLICY IF EXISTS "Users can update own observations" ON public.observations;
  DROP POLICY IF EXISTS "observations_delete_policy" ON public.observations;
  DROP POLICY IF EXISTS "Users can delete own observations" ON public.observations;
  DROP POLICY IF EXISTS "users_can_delete_own_observations" ON public.observations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- SELECT policy: View own observations OR team observations
CREATE POLICY "observations_select_policy"
  ON public.observations
  FOR SELECT
  TO authenticated
  USING (
    -- Own observations
    user_id = auth.uid()
    OR
    -- Team observations where user is a member
    (
      team_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.cv_team_members m
        WHERE m.team_id = observations.team_id
          AND m.user_id = auth.uid()
      )
    )
  );

-- INSERT policy: Create own observations OR team observations as active member
CREATE POLICY "observations_insert_policy"
  ON public.observations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be current user's observation
    user_id = auth.uid()
    AND
    (
      -- Non-team observation (always allowed if has active subscription)
      team_id IS NULL
      OR
      -- Team observation: must be active member
      (
        team_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.cv_team_members m
          WHERE m.team_id = observations.team_id
            AND m.user_id = auth.uid()
            AND m.state = 'active'
        )
      )
    )
  );

-- UPDATE policy: Update own observations OR team observations as member
CREATE POLICY "observations_update_policy"
  ON public.observations
  FOR UPDATE
  TO authenticated
  USING (
    -- Own observations
    user_id = auth.uid()
    OR
    -- Team observations where user is an active member
    (
      team_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.cv_team_members m
        WHERE m.team_id = observations.team_id
          AND m.user_id = auth.uid()
          AND m.state = 'active'
      )
    )
  )
  WITH CHECK (
    -- User ID must remain unchanged
    user_id = auth.uid()
    OR
    (
      team_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.cv_team_members m
        WHERE m.team_id = observations.team_id
          AND m.user_id = auth.uid()
          AND m.state = 'active'
      )
    )
  );

-- DELETE policy: Delete own observations OR team observations as owner/member
CREATE POLICY "observations_delete_policy"
  ON public.observations
  FOR DELETE
  TO authenticated
  USING (
    -- Own observations
    user_id = auth.uid()
    OR
    -- Team observations where user is an active member
    (
      team_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.cv_team_members m
        WHERE m.team_id = observations.team_id
          AND m.user_id = auth.uid()
          AND m.state = 'active'
      )
    )
  );
