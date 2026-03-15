/*
  # Add Admin RLS Policies on profiles Table

  ## Summary
  Admin users need to list, update, and insert profiles for other users
  (the ActiveCaregiversPage queries all caregiver rows and toggles disabled status).
  Without these policies, admin users can only see their own profile row and the
  admin user list appears empty.

  ## Changes
  1. SELECT policy: admins can read all profiles
  2. UPDATE policy: admins can update any profile (for enable/disable)
  3. INSERT policy for admin: admins can insert profiles for newly created users

  ## Security
  - All policies check role = 'admin' against the caller's own profile row
  - Uses a correlated sub-select on profiles to avoid auth.jwt() dependency
  - Does NOT use USING (true) — scoped to admin role only
*/

DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = (SELECT auth.uid())
        AND me.role = 'admin'
    )
    OR id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = (SELECT auth.uid())
        AND me.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = (SELECT auth.uid())
        AND me.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can insert profiles for other users" ON public.profiles;
CREATE POLICY "Admin can insert profiles for other users"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = (SELECT auth.uid())
        AND me.role = 'admin'
    )
  );
