
/*
  # Fix Infinite Recursion in profiles RLS Policies

  ## Problem
  The "Admin can read all profiles", "Admin can insert profiles for other users",
  and "Admin can update any profile" policies all check admin status by running a
  sub-SELECT back into the profiles table. This causes infinite recursion when
  Postgres evaluates the policy — the sub-query triggers the same policies, which
  trigger another sub-query, and so on indefinitely.

  This is most visible during user registration: the INSERT policy fires, its
  WITH CHECK sub-selects from profiles to verify admin status, which hits the
  SELECT policy, which sub-selects from profiles again → infinite recursion.

  ## Solution
  1. Create a SECURITY DEFINER function `is_admin()` that checks the caller's
     role by querying profiles with RLS bypassed (runs as function owner).
  2. Replace all three self-referencing admin policies with versions that call
     is_admin() instead of containing an inline sub-SELECT on profiles.

  ## Changes
  - New function: `public.is_admin()` (SECURITY DEFINER, stable)
  - Replaced policy: "Admin can read all profiles" (SELECT)
  - Replaced policy: "Admin can insert profiles for other users" (INSERT)
  - Replaced policy: "Admin can update any profile" (UPDATE)

  ## Security
  - is_admin() is owned by postgres/service role, bypassing RLS safely
  - Only checks role = 'admin' for the currently authenticated user
  - All other RLS behaviour is preserved exactly
*/

-- Step 1: Create the SECURITY DEFINER helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users so policies can call it
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 2: Replace the three self-referencing admin policies

-- SELECT policy
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Admin can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR id = (SELECT auth.uid())
  );

-- INSERT policy
DROP POLICY IF EXISTS "Admin can insert profiles for other users" ON profiles;
CREATE POLICY "Admin can insert profiles for other users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
  );

-- UPDATE policy
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
CREATE POLICY "Admin can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
