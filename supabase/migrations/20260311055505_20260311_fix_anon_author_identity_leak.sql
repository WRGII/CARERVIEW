/*
  # Fix: Close anonymous author identity leak on community_posts

  ## Problem
  The `anon` role has a SELECT RLS policy ("Public can view active post previews")
  on the base `community_posts` table. This exposes the real `author_user_id` UUID
  for every post including anonymous ones, leaking the author's identity to
  unauthenticated visitors.

  The `community_posts_public` security-barrier view already exists and masks
  `author_user_id` to NULL for anonymous posts, but it was never made the
  *exclusive* anon access path — the base table remained accessible.

  ## Solution
  1. Drop the anon SELECT policy from the base `community_posts` table.
  2. Revoke all direct privileges from `anon` on the base table.
  3. Confirm the view is the only anon read path (it already has GRANT SELECT
     and the security_barrier flag set from the prior migration).

  ## Impact
  - Unauthenticated visitors now read only through `community_posts_public`.
  - `author_user_id` is NULL for anonymous posts in the public view.
  - Authenticated users and admins continue to query the base table directly
     with all policies intact — no application code changes needed.
  - The `community_replies` anon privileges are also removed since replies
    should only be visible to authenticated members; the public hub pages
    can use authenticated calls or the app can gate reply display behind login.

  ## Security changes
  - Drops policy: "Public can view active post previews" on community_posts (anon)
  - Revokes INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER on
    community_posts FROM anon
  - Revokes INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER on
    community_replies FROM anon
*/

-- 1. Drop the anon SELECT policy on the base table
DROP POLICY IF EXISTS "Public can view active post previews" ON public.community_posts;

-- 2. Revoke all privileges from anon on the base community_posts table
REVOKE ALL ON public.community_posts FROM anon;

-- 3. Revoke all privileges from anon on community_replies
--    (replies should only be readable by authenticated members)
REVOKE ALL ON public.community_replies FROM anon;

-- 4. Confirm the view still grants SELECT to anon (idempotent)
GRANT SELECT ON public.community_posts_public TO anon;
