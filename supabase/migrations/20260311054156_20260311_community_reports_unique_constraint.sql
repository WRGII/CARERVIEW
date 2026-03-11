/*
  # Add unique constraint to prevent duplicate reports

  ## Problem
  A user can submit unlimited reports on the same post or reply, flooding the
  moderation queue with duplicates. There is no deduplication.

  ## Changes
  1. Add a unique constraint on (reporter_user_id, post_id) for post reports
  2. Add a unique constraint on (reporter_user_id, reply_id) for reply reports

  Since post_id and reply_id are mutually exclusive (enforced by the existing
  community_reports_target_check constraint), partial unique indexes are the
  cleanest approach.

  ## Safety
  - Uses CREATE UNIQUE INDEX IF NOT EXISTS
  - No existing data is modified or deleted
*/

CREATE UNIQUE INDEX IF NOT EXISTS community_reports_unique_post_report
  ON public.community_reports (reporter_user_id, post_id)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS community_reports_unique_reply_report
  ON public.community_reports (reporter_user_id, reply_id)
  WHERE reply_id IS NOT NULL;
