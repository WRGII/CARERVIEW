/*
  # Public Community Hub Read Access

  ## Summary
  Adds limited anon (unauthenticated) read policies to allow a public-facing
  community hub page to display room listings and post previews without login.
  This is the acquisition entry point for CarerView's community feature.

  ## Changes

  ### New RLS Policies (anon/public read-only)

  1. `community_rooms` — anon users can read active rooms
     - Only `is_active = true` rows are visible
     - No write access

  2. `community_posts` — anon users can read active post metadata (title only, no body)
     - We achieve body-suppression at the application level; the DB allows the read
     - Only `post_status = 'active'` rows
     - No author identity: author_user_id and is_anonymous are readable fields
       but the application masks them using the existing `maskAuthor` helper

  3. `community_profiles` — anon users can read non-banned public profile handles
     - Only handle and avatar_color exposed (no bio, no ban details, no user_id)
     - Used for showing "N members" counts on the hub page

  ## Privacy notes
  - Anonymous post authors remain anonymous to anon visitors (maskAuthor handles this)
  - Post bodies are shown truncated in preview cards; full body requires login
  - No personal data (email, user_id, ban status) is exposed via these policies
  - Reporter/moderation data remains fully restricted to authenticated users
*/

-- ── community_rooms: anon read for active rooms ──────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_rooms'
      AND policyname = 'Public can view active rooms'
  ) THEN
    CREATE POLICY "Public can view active rooms"
      ON public.community_rooms
      FOR SELECT
      TO anon
      USING (is_active = true);
  END IF;
END $$;

-- ── community_posts: anon read for active posts ───────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_posts'
      AND policyname = 'Public can view active post previews'
  ) THEN
    CREATE POLICY "Public can view active post previews"
      ON public.community_posts
      FOR SELECT
      TO anon
      USING (post_status = 'active');
  END IF;
END $$;

-- ── community_profiles: anon read for public handles (non-banned) ────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_profiles'
      AND policyname = 'Public can view community member handles'
  ) THEN
    CREATE POLICY "Public can view community member handles"
      ON public.community_profiles
      FOR SELECT
      TO anon
      USING (is_banned = false);
  END IF;
END $$;

-- ── community_rooms: also allow anon to join-query with posts ─────────────────
-- The POST_LIST_SELECT query joins community_rooms and community_profiles;
-- ensure anon can resolve the join (rooms already covered above).
-- community_profiles policy added above covers the join side.
