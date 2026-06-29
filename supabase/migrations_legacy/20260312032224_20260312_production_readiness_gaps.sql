/*
  # Production Readiness Gaps — Community Feature

  ## Changes

  ### 1. community_reactions — Anonymous read access
  - Adds a SELECT policy for the `anon` role so public hub pages can
    display reaction counts to logged-out visitors.
  - The existing authenticated policy exists; anon had no access at all,
    breaking reaction counts on the public community hub.

  ### 2. community_bans — Composite index on (user_id, created_at)
  - The plan referenced a banned_until column that does not exist.
  - The ban table uses created_at as the time anchor.
  - Adds a composite index on (user_id, created_at) to speed up
    is_user_banned() style lookups that filter by user then time range.
  - The existing index covers user_id only; this adds the time dimension.

  ### Notes
  - Uses IF NOT EXISTS guards throughout.
  - No destructive changes; no data removed or altered.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_reactions'
      AND policyname = 'Anon users can read reactions'
  ) THEN
    EXECUTE 'CREATE POLICY "Anon users can read reactions"
      ON community_reactions
      FOR SELECT
      TO anon
      USING (true)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS community_bans_user_id_created_at_idx
  ON community_bans (user_id, created_at);
