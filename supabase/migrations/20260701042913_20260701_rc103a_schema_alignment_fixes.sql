/*
  RC1-03A Schema Alignment Fixes
  Resolves four release-blocking schema gaps identified in RC1-03 audit.
  
  Work Item 1: user_subscriptions.trial_end
  Work Item 3: community_notifications (subject, message, rename read->is_read)
  Work Item 4: community_profiles (is_banned, ban_reason)
  
  Work Item 2 (admin_events) resolved via Edge Function code change (Option B).
*/

-- ===== WORK ITEM 1: user_subscriptions.trial_end =====
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS trial_end timestamptz DEFAULT NULL;

-- ===== WORK ITEM 3: community_notifications =====
-- Add subject and message columns
ALTER TABLE public.community_notifications
  ADD COLUMN IF NOT EXISTS subject text DEFAULT '',
  ADD COLUMN IF NOT EXISTS message text DEFAULT '';

-- Rename 'read' to 'is_read' (preserves existing values)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_notifications'
      AND column_name = 'read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_notifications'
      AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.community_notifications RENAME COLUMN "read" TO is_read;
  END IF;
END$$;

-- ===== WORK ITEM 4: community_profiles ban fields =====
ALTER TABLE public.community_profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text DEFAULT NULL;
