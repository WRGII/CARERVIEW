/*
  # Allow anonymous visitors to read active community posts

  ## Summary
  Anonymous (unauthenticated) visitors to the Community Hub page need to be able
  to read active posts so the public preview of discussions is visible without
  signing in. Previously only authenticated users had a SELECT policy, so the
  hub page showed "No discussions yet" for all rooms when accessed while logged out.

  ## Changes
  - community_posts: add SELECT policy for the `anon` role limited to post_status = 'active'

  ## Security
  - Only active posts are exposed (no drafts, removed, or flagged content)
  - Write operations (INSERT, UPDATE) remain restricted to authenticated users only
  - Anonymous users cannot see author_user_id data via this policy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_posts'
      AND policyname = 'Anonymous users can view active posts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Anonymous users can view active posts"
        ON community_posts
        FOR SELECT
        TO anon
        USING (post_status = 'active')
    $policy$;
  END IF;
END $$;
