/*
  # Fix observations INSERT RLS policy — eliminate cv_team_members recursion

  ## Problem
  The existing INSERT policy on `observations` contains a direct subquery against
  `cv_team_members`. Because RLS is enabled on `cv_team_members`, evaluating that
  subquery fires cv_team_members' own SELECT policy, which calls `is_team_member()`,
  which queries `cv_team_members` again — causing a recursive RLS evaluation that
  silently blocks all inserts for authenticated users.

  ## Fix
  Replace the raw `cv_team_members` subquery with a call to the existing
  `get_active_team_ids()` SECURITY DEFINER function, which bypasses RLS entirely.
  We create `get_active_team_ids()` as a focused SECURITY DEFINER helper that
  filters by `state = 'active'` (unlike `get_user_team_ids()` which does not).

  ## Changes
  - Create `get_active_team_ids()` SECURITY DEFINER function
  - Drop and recreate `observations_insert_policy` using the new function
*/

-- 1. Create a SECURITY DEFINER helper that returns active team IDs for the current user
CREATE OR REPLACE FUNCTION public.get_active_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT team_id
  FROM public.cv_team_members
  WHERE user_id = auth.uid()
    AND state = 'active';
$$;

-- 2. Replace the broken INSERT policy
DROP POLICY IF EXISTS "observations_insert_policy" ON public.observations;

CREATE POLICY "observations_insert_policy"
  ON public.observations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      team_id IS NULL
      OR team_id IN (SELECT public.get_active_team_ids())
    )
  );
