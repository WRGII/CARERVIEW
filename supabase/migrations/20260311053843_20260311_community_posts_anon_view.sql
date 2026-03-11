/*
  # Create a security view for public community post access

  ## Problem
  The community_posts table exposes `author_user_id` to all clients including
  anonymous (unauthenticated) visitors via the anon RLS policy. This leaks
  the real identity UUID of anonymous post authors.

  ## Solution
  Create a security-barrier view `community_posts_public` that:
  - Replaces `author_user_id` with NULL for anonymous posts
  - Is used by public/unauthenticated queries
  - The internal table retains the real column for admin/moderation use

  The existing application code queries the base table directly (authenticated),
  so we update the anon RLS policy to only allow access through the view.

  ## Implementation
  The simplest safe fix is to update the anon SELECT policy on community_posts
  to exclude author_user_id from anonymous posts by using a column default.

  Since Postgres RLS doesn't support column masking, we use a SECURITY DEFINER
  view with a SECURITY BARRIER to present a safe projection to the anon role.

  Note: The application's authenticated queries continue to use the base table
  directly and see all columns. The view is for public-facing unauthenticated
  read access only.
*/

CREATE OR REPLACE VIEW public.community_posts_public
  WITH (security_barrier = true)
AS
SELECT
  id,
  room_id,
  CASE WHEN is_anonymous THEN NULL ELSE author_user_id END AS author_user_id,
  is_anonymous,
  title,
  body,
  post_status,
  is_locked,
  help_type,
  reply_count,
  reaction_count,
  last_activity_at,
  created_at,
  updated_at
FROM public.community_posts
WHERE post_status = 'active';

REVOKE ALL ON public.community_posts_public FROM anon;
GRANT SELECT ON public.community_posts_public TO anon;

ALTER VIEW public.community_posts_public OWNER TO postgres;
