/*
  # Admin SELECT policies for community tables

  ## Summary
  Adds missing admin-scoped SELECT policies on community_posts, community_profiles,
  and community_replies so that admin users can read rows of all statuses
  (active, hidden, removed, pending_review) via the regular authenticated client.

  Without these policies, the existing non-admin SELECT policies restrict
  admins to only viewing active posts/replies and non-banned profiles —
  causing the "Failed to Load" error in the admin moderation dashboard's
  Members and All Posts tabs.

  ## Changes

  ### Modified Tables
  - `community_posts` — new admin SELECT policy (all statuses)
  - `community_profiles` — new admin SELECT policy (all profiles including banned)
  - `community_replies` — new admin SELECT policy (all statuses)

  ## Security
  All three policies are gated on `is_community_admin()`, which is a
  SECURITY DEFINER function checking `profiles.role = 'admin'` for the
  calling user. Only authenticated users with role = 'admin' in the
  profiles table can use these policies.

  ## Important Notes
  1. Uses `(SELECT auth.uid())` subselect form to prevent per-row re-evaluation
  2. Uses DROP POLICY IF EXISTS before CREATE POLICY for idempotency
  3. Follows the same naming convention and pattern as existing admin policies
*/

-- ─── community_posts: admin SELECT ───────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all posts" ON public.community_posts;
CREATE POLICY "Admins can read all posts"
  ON public.community_posts
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin()
  );

-- ─── community_profiles: admin SELECT ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all community profiles" ON public.community_profiles;
CREATE POLICY "Admins can read all community profiles"
  ON public.community_profiles
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin()
  );

-- ─── community_replies: admin SELECT ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all replies" ON public.community_replies;
CREATE POLICY "Admins can read all replies"
  ON public.community_replies
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin()
  );
