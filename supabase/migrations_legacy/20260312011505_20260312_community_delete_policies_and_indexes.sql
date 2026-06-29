/*
  # Community: Missing DELETE policies and performance indexes

  ## Overview
  Addresses two gaps found in the production readiness audit:
  1. Authors cannot delete their own posts or replies — no DELETE RLS policy existed
  2. Admins/service_role cannot remove bans (no DELETE on community_bans)
  3. Missing composite index on community_bans(user_id) for ban-check queries

  ## Tables Modified

  ### community_posts
  - Add DELETE policy: authors can delete their own active posts

  ### community_replies
  - Add DELETE policy: authors can delete their own active replies

  ### community_bans
  - Add DELETE policy: admins can remove bans (unban operation)
  - Add index on (user_id) for fast ban lookup per user

  ## Security Changes
  - Authors retain control over their own content (delete own active posts/replies)
  - Admin moderation flows can now fully manage ban records
  - Policies are scoped: authors can only delete active content (not already-moderated content)

  ## Notes
  - Uses IF NOT EXISTS to be safe if re-run
  - Indexes use CONCURRENTLY equivalent via IF NOT EXISTS guard
*/

-- ======================================================
-- 1. DELETE policy: authors can delete own active posts
-- ======================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_posts'
      AND policyname = 'Authors can delete own posts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authors can delete own posts"
        ON public.community_posts FOR DELETE
        TO authenticated
        USING (author_user_id = auth.uid() AND post_status = 'active')
    $policy$;
  END IF;
END $$;

-- ======================================================
-- 2. DELETE policy: authors can delete own active replies
-- ======================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_replies'
      AND policyname = 'Authors can delete own replies'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authors can delete own replies"
        ON public.community_replies FOR DELETE
        TO authenticated
        USING (author_user_id = auth.uid() AND reply_status = 'active')
    $policy$;
  END IF;
END $$;

-- ======================================================
-- 3. DELETE policy: admins can remove ban records
-- ======================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_bans'
      AND policyname = 'Admins can delete bans'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can delete bans"
        ON public.community_bans FOR DELETE
        TO authenticated
        USING (public.is_community_admin())
    $policy$;
  END IF;
END $$;

-- ======================================================
-- 4. Index: community_bans(user_id) for ban-check lookups
-- ======================================================
CREATE INDEX IF NOT EXISTS community_bans_user_id_idx
  ON public.community_bans (user_id);

-- ======================================================
-- 5. Index: community_bans(banned_by) for audit queries
-- ======================================================
CREATE INDEX IF NOT EXISTS community_bans_banned_by_idx
  ON public.community_bans (banned_by);
