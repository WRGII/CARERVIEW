/*
  # Production Readiness: Final Fixes

  ## Summary
  This migration addresses data integrity gaps found during the systematic
  production-readiness audit. It does NOT drop or destroy any data.

  ## Changes

  ### 1. community_profiles — add ON DELETE CASCADE for user_id FK
  - When a user's auth record (profiles row) is deleted, their community profile
    should be automatically removed instead of leaving an orphaned row with no owner.
  - Implemented by dropping the existing FK constraint and re-adding it with CASCADE.

  ### 2. community_reports — reporter_user_id should SET NULL on profile delete
  - When a reporter's profile is deleted the report itself (moderation record) should
    be retained for audit purposes but the reporter identity should be nullified.
  - reporter_user_id is already nullable — this just makes the FK behaviour explicit.

  ### 3. Add missing index on community_profiles.user_id
  - Ensures lookups by user_id (used on every community page load) are fast.

  ### 4. Add missing index on community_posts.author_user_id
  - Supports efficient moderation and user-deletion cleanup queries.

  ### Notes
  - All operations use IF EXISTS / IF NOT EXISTS to be idempotent.
  - No data is deleted or modified by this migration.
*/

-- 1. community_profiles: ensure FK to profiles cascades on delete
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'community_profiles'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%user_id%'
  ) THEN
    ALTER TABLE community_profiles
      DROP CONSTRAINT IF EXISTS community_profiles_user_id_fkey;
  END IF;
END $$;

ALTER TABLE community_profiles
  ADD CONSTRAINT community_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. community_reports: SET NULL on reporter delete (retain moderation record)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_reports'
      AND column_name = 'reporter_user_id'
  ) THEN
    ALTER TABLE community_reports
      DROP CONSTRAINT IF EXISTS community_reports_reporter_user_id_fkey;

    ALTER TABLE community_reports
      ADD CONSTRAINT community_reports_reporter_user_id_fkey
      FOREIGN KEY (reporter_user_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Index: community_profiles.user_id
CREATE INDEX IF NOT EXISTS idx_community_profiles_user_id
  ON community_profiles (user_id);

-- 4. Index: community_posts.author_user_id
CREATE INDEX IF NOT EXISTS idx_community_posts_author_user_id
  ON community_posts (author_user_id);
