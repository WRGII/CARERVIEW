/*
  # Fix Profiles Table INSERT Policy

  1. Problem
    - Users unable to register due to missing INSERT policy on profiles table
    - Current policies only allow SELECT and UPDATE
    - Frontend code attempts to upsert profile after auth.signUp() but RLS blocks it

  2. Changes
    - Add INSERT policy allowing authenticated users to insert their own profile
    - Policy checks: id = auth.uid() (user can only insert their own profile)
    - WITH CHECK ensures user_id matches authenticated user

  3. Security
    - Users can only create profile for themselves
    - Cannot create profiles for other users
    - id must match their authenticated user ID
    - Maintains existing SELECT and UPDATE policies

  4. Impact
    - Unblocks new user registration on all pages
    - Fixes: CreateAccountPage, WhyCarerView, ActiveCaregiversPage
    - No changes needed to existing code
*/

-- Add INSERT policy for profiles table
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
