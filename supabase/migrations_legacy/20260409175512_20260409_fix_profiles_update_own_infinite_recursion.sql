/*
  # Fix: Infinite Recursion in profiles_update_own RLS Policy

  ## Problem
  The `profiles_update_own` UPDATE policy contained an inline WITH CHECK clause that
  ran a raw subquery directly against the `profiles` table:

      role = (SELECT role FROM profiles WHERE id = auth.uid())
      AND
      disabled = (SELECT disabled FROM profiles WHERE id = auth.uid())

  Because this subquery is not wrapped in a SECURITY DEFINER function, Postgres
  evaluates it under the caller's RLS context — which means it re-triggers all
  SELECT policies on `profiles`, which again evaluate the same policies, causing
  infinite recursion for any authenticated user who performs an UPDATE on profiles.

  This affected:
    - cv_set_active_team() → UPDATE profiles SET active_team_id = ...
    - cv_accept_invite()   → UPDATE profiles SET active_team_id = ...
    - cv_create_team_with_patient() → UPDATE profiles SET active_team_id = ...
    - Any direct profile update from the caregiver dashboard

  ## Fix
  1. Create a SECURITY DEFINER helper function `get_own_profile_immutable_fields()`
     that reads role and disabled from profiles for the current user WITHOUT
     triggering RLS (because SECURITY DEFINER runs as the function owner, a superuser).
  2. Drop and recreate the `profiles_update_own` policy using this helper function
     instead of the raw inline subquery.

  ## Security Intent Preserved
  Users still cannot change their own `role` or `disabled` fields — the WITH CHECK
  continues to enforce that those columns match what is stored in the database.

  ## Tables Modified
  - `profiles` — UPDATE policy replaced

  ## New Functions
  - `get_own_profile_immutable_fields()` — SECURITY DEFINER, returns (role text, disabled boolean)
*/

-- Step 1: Create a SECURITY DEFINER helper that reads profiles without triggering RLS
CREATE OR REPLACE FUNCTION public.get_own_profile_immutable_fields()
RETURNS TABLE(profile_role text, profile_disabled boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role, disabled
  FROM public.profiles
  WHERE id = (SELECT auth.uid());
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.get_own_profile_immutable_fields() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_own_profile_immutable_fields() TO authenticated;

-- Step 2: Drop the offending policy
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Step 3: Recreate it using the SECURITY DEFINER helper (breaks the recursion)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (
    (id = (SELECT auth.uid()))
    AND (role    = (SELECT f.profile_role     FROM public.get_own_profile_immutable_fields() f))
    AND (disabled = (SELECT f.profile_disabled FROM public.get_own_profile_immutable_fields() f))
  );
