/*
  # Fix community_reports FK cascade rules

  ## Problem
  The community_reports table has ON DELETE CASCADE for post_id and reply_id foreign keys.
  This means when a reported post or reply is deleted (e.g. by a moderator), all moderation
  reports against it are silently destroyed, wiping the audit trail.

  ## Fix
  Change post_id and reply_id FK constraints from ON DELETE CASCADE to ON DELETE SET NULL.
  This preserves moderation report records even when the reported content is deleted,
  maintaining a complete audit history for admin review.

  ## Changes
  - community_reports.post_id FK: CASCADE → SET NULL
  - community_reports.reply_id FK: CASCADE → SET NULL

  ## Notes
  - post_id and reply_id are already nullable (by design, per CHECK constraint)
  - The target_check constraint ensures exactly one is non-null at insert time
  - After content deletion, a report may have both post_id and reply_id as NULL —
    this is acceptable because the report body and reason are still preserved
*/

DO $$
BEGIN
  -- Fix post_id FK: drop CASCADE, add SET NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'community_reports_post_id_fkey'
    AND table_name = 'community_reports'
  ) THEN
    ALTER TABLE public.community_reports
      DROP CONSTRAINT community_reports_post_id_fkey;
  END IF;

  ALTER TABLE public.community_reports
    ADD CONSTRAINT community_reports_post_id_fkey
    FOREIGN KEY (post_id)
    REFERENCES public.community_posts(id)
    ON DELETE SET NULL;

  -- Fix reply_id FK: drop CASCADE, add SET NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'community_reports_reply_id_fkey'
    AND table_name = 'community_reports'
  ) THEN
    ALTER TABLE public.community_reports
      DROP CONSTRAINT community_reports_reply_id_fkey;
  END IF;

  ALTER TABLE public.community_reports
    ADD CONSTRAINT community_reports_reply_id_fkey
    FOREIGN KEY (reply_id)
    REFERENCES public.community_replies(id)
    ON DELETE SET NULL;
END $$;
