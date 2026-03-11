/*
  # Community Security Hardening

  ## Overview
  Addresses four security issues identified in the community feature:

  1. Missing search_path on SECURITY DEFINER functions
     - is_community_admin(), community_on_post_insert(), community_on_post_update(),
       community_on_reply_insert(), community_on_reply_update(),
       community_on_reaction_insert(), community_on_reaction_delete()
     - Without a locked search_path, an attacker who can create objects in another
       schema could shadow public.profiles and cause is_community_admin() to return
       true for any user (schema-shadowing attack vector).

  2. Duplicate/conflicting SELECT policy on community_profiles
     - "Community members can read all profiles" used USING (true), which completely
       neutralised the "Public can view community member handles" restriction.
     - Policies are additive (OR logic), so banned users' profiles were fully readable
       by all authenticated users despite the intent to hide them.
     - Fixed by replacing the unrestricted policy with one that allows users to always
       read their own profile, and others only if not banned.

  ## Tables Modified
  - community_profiles: replaced permissive SELECT policy

  ## Functions Modified (search_path locked)
  - public.is_community_admin
  - public.community_on_post_insert
  - public.community_on_post_update
  - public.community_on_reply_insert
  - public.community_on_reply_update
  - public.community_on_reaction_insert
  - public.community_on_reaction_delete

  ## Security Changes
  - All SECURITY DEFINER community functions now have SET search_path = public, pg_temp
    to prevent schema-shadowing attacks.
  - Banned users' community profiles are no longer readable by other authenticated users.

  ## Notes
  - No data is dropped or modified; only function metadata and RLS policies are changed.
  - The anon-role public SELECT policy ("Public can view community member handles") is
    left unchanged as it already correctly filters out banned users.
*/

-- =====================================================
-- 1. LOCK search_path ON ALL SECURITY DEFINER FUNCTIONS
-- =====================================================

ALTER FUNCTION public.is_community_admin()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.community_on_post_insert()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.community_on_post_update()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.community_on_reply_insert()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.community_on_reply_update()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.community_on_reaction_insert()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.community_on_reaction_delete()
  SET search_path = public, pg_temp;

-- =====================================================
-- 2. FIX DUPLICATE/CONFLICTING SELECT POLICY ON community_profiles
-- =====================================================

-- Drop the over-permissive policy that allowed any authenticated user to read
-- all profiles (including banned ones), neutralising the other SELECT policy.
DROP POLICY IF EXISTS "Community members can read all profiles" ON public.community_profiles;

-- Replace with a policy that:
--   - Always lets a user read their own profile (needed for profile management)
--   - Lets authenticated users read other profiles only if they are not banned
CREATE POLICY "Authenticated users can read non-banned profiles or own profile"
  ON public.community_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR is_banned = false
  );
