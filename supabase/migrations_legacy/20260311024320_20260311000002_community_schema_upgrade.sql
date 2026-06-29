/*
  # Caregiver Community - Schema Upgrade

  ## Overview
  Upgrades the existing partial community schema to the full required design.
  Existing tables were created with a simpler is_deleted boolean approach;
  this migration evolves them to a richer status model needed for moderation.

  ## Changes

  ### community_posts
  - Add post_status text column (active/hidden/removed/pending_review) replacing is_deleted
  - Add last_activity_at timestamp for sorting by latest reply
  - Add constraints: title length, body length, post_status check
  - Add missing indexes

  ### community_replies
  - Add reply_status text column (active/hidden/removed/pending_review) replacing is_deleted
  - Add constraints: body length, reply_status check
  - Add missing indexes

  ### community_profiles
  - Add post_count and reply_count denormalized counters
  - Add handle format/length constraints

  ### community_reports
  - Rename status -> report_status for clarity
  - Expand reason check constraint to include unsafe_advice, privacy_violation, inappropriate_content
  - Add mod_note column for moderation notes
  - Update ON DELETE to SET NULL for post_id/reply_id to preserve report record

  ### community_rooms
  - Add slug format constraint
  - Add sort index

  ### Triggers
  - Replace existing triggers with correct logic for new status columns
  - Add reply insert trigger that checks post lock state

  ## Security
  - Update RLS policies to use post_status/reply_status instead of is_deleted
  - All existing policies are replaced with correct versions
*/

-- ============================================================
-- community_posts: add post_status, last_activity_at
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'post_status'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN post_status text NOT NULL DEFAULT 'active';
    -- Migrate is_deleted -> post_status
    UPDATE public.community_posts SET post_status = 'removed' WHERE is_deleted = true;
    UPDATE public.community_posts SET post_status = 'active'  WHERE is_deleted = false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN last_activity_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Add check constraint for post_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_posts'::regclass AND conname = 'community_posts_status_check'
  ) THEN
    ALTER TABLE public.community_posts
      ADD CONSTRAINT community_posts_status_check
      CHECK (post_status IN ('active', 'hidden', 'removed', 'pending_review'));
  END IF;
END $$;

-- Add title length constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_posts'::regclass AND conname = 'community_posts_title_length'
  ) THEN
    ALTER TABLE public.community_posts
      ADD CONSTRAINT community_posts_title_length
      CHECK (char_length(title) BETWEEN 5 AND 200);
  END IF;
END $$;

-- Add body length constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_posts'::regclass AND conname = 'community_posts_body_length'
  ) THEN
    ALTER TABLE public.community_posts
      ADD CONSTRAINT community_posts_body_length
      CHECK (char_length(body) BETWEEN 10 AND 5000);
  END IF;
END $$;

-- ============================================================
-- community_replies: add reply_status
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_replies' AND column_name = 'reply_status'
  ) THEN
    ALTER TABLE public.community_replies ADD COLUMN reply_status text NOT NULL DEFAULT 'active';
    UPDATE public.community_replies SET reply_status = 'removed' WHERE is_deleted = true;
    UPDATE public.community_replies SET reply_status = 'active'  WHERE is_deleted = false;
  END IF;
END $$;

-- Add check constraint for reply_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_replies'::regclass AND conname = 'community_replies_status_check'
  ) THEN
    ALTER TABLE public.community_replies
      ADD CONSTRAINT community_replies_status_check
      CHECK (reply_status IN ('active', 'hidden', 'removed', 'pending_review'));
  END IF;
END $$;

-- Add body length constraint on replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_replies'::regclass AND conname = 'community_replies_body_length'
  ) THEN
    ALTER TABLE public.community_replies
      ADD CONSTRAINT community_replies_body_length
      CHECK (char_length(body) BETWEEN 1 AND 2000);
  END IF;
END $$;

-- ============================================================
-- community_profiles: add post_count, reply_count, constraints
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_profiles' AND column_name = 'post_count'
  ) THEN
    ALTER TABLE public.community_profiles ADD COLUMN post_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_profiles' AND column_name = 'reply_count'
  ) THEN
    ALTER TABLE public.community_profiles ADD COLUMN reply_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Handle constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_profiles'::regclass AND conname = 'community_profiles_handle_length'
  ) THEN
    ALTER TABLE public.community_profiles
      ADD CONSTRAINT community_profiles_handle_length
      CHECK (char_length(handle) BETWEEN 3 AND 30);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_profiles'::regclass AND conname = 'community_profiles_handle_format'
  ) THEN
    ALTER TABLE public.community_profiles
      ADD CONSTRAINT community_profiles_handle_format
      CHECK (handle ~ '^[a-zA-Z0-9_\-]+$');
  END IF;
END $$;

-- ============================================================
-- community_reports: add report_status alias, mod_note, expand reasons
-- ============================================================
-- Add report_status column (renamed from status for clarity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_reports' AND column_name = 'report_status'
  ) THEN
    ALTER TABLE public.community_reports ADD COLUMN report_status text NOT NULL DEFAULT 'pending';
    UPDATE public.community_reports SET report_status = status;
  END IF;
END $$;

-- Add check constraint for report_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_reports'::regclass AND conname = 'community_reports_report_status_check'
  ) THEN
    ALTER TABLE public.community_reports
      ADD CONSTRAINT community_reports_report_status_check
      CHECK (report_status IN ('pending', 'reviewed', 'dismissed'));
  END IF;
END $$;

-- Drop old reason constraint and add expanded version
ALTER TABLE public.community_reports DROP CONSTRAINT IF EXISTS community_reports_reason_check;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'community_reports'::regclass AND conname = 'community_reports_reason_check_v2'
  ) THEN
    ALTER TABLE public.community_reports
      ADD CONSTRAINT community_reports_reason_check_v2
      CHECK (reason IN (
        'harassment',
        'unsafe_advice',
        'privacy_violation',
        'spam',
        'inappropriate_content',
        'other'
      ));
  END IF;
END $$;

-- Add mod_note column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_reports' AND column_name = 'mod_note'
  ) THEN
    ALTER TABLE public.community_reports ADD COLUMN mod_note text;
  END IF;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS community_profiles_handle_idx
  ON public.community_profiles (lower(handle));

CREATE INDEX IF NOT EXISTS community_rooms_sort_idx
  ON public.community_rooms (sort_order, is_active);

CREATE INDEX IF NOT EXISTS community_posts_room_status_idx
  ON public.community_posts (room_id, post_status, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_author_idx
  ON public.community_posts (author_user_id);

CREATE INDEX IF NOT EXISTS community_posts_created_at_idx
  ON public.community_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS community_replies_post_status_idx
  ON public.community_replies (post_id, reply_status, created_at ASC);

CREATE INDEX IF NOT EXISTS community_replies_author_idx
  ON public.community_replies (author_user_id);

CREATE INDEX IF NOT EXISTS community_reports_status_idx
  ON public.community_reports (report_status, created_at DESC);

CREATE INDEX IF NOT EXISTS community_reports_reporter_idx
  ON public.community_reports (reporter_user_id);

CREATE INDEX IF NOT EXISTS community_reactions_post_idx
  ON public.community_reactions (post_id);

CREATE INDEX IF NOT EXISTS community_reactions_user_idx
  ON public.community_reactions (user_id);

-- ============================================================
-- ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================
ALTER TABLE public.community_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_rooms     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bans      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- REPLACE RLS POLICIES - community_posts
-- Uses post_status instead of is_deleted
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read non-deleted posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can view active posts"      ON public.community_posts;

CREATE POLICY "Authenticated users can view active posts"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (
    post_status = 'active'
    OR author_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Non-banned users can create posts" ON public.community_posts;

CREATE POLICY "Non-banned users can create posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.community_profiles cp
      WHERE cp.user_id = auth.uid() AND cp.is_banned = true
    )
    AND EXISTS (
      SELECT 1 FROM public.community_profiles cp2
      WHERE cp2.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can update own posts" ON public.community_posts;

CREATE POLICY "Authors can update own posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (author_user_id = auth.uid() AND post_status = 'active')
  WITH CHECK (author_user_id = auth.uid());

-- Keep admin update policy as-is (it exists already)

-- ============================================================
-- REPLACE RLS POLICIES - community_replies
-- Uses reply_status instead of is_deleted
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read non-deleted replies" ON public.community_replies;
DROP POLICY IF EXISTS "Authenticated users can view active replies"      ON public.community_replies;

CREATE POLICY "Authenticated users can view active replies"
  ON public.community_replies FOR SELECT
  TO authenticated
  USING (
    reply_status = 'active'
    OR author_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Non-banned users can create replies" ON public.community_replies;

CREATE POLICY "Non-banned users can create replies"
  ON public.community_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.community_profiles cp
      WHERE cp.user_id = auth.uid() AND cp.is_banned = true
    )
    AND EXISTS (
      SELECT 1 FROM public.community_profiles cp2
      WHERE cp2.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.community_posts p
      WHERE p.id = post_id
        AND p.post_status = 'active'
        AND p.is_locked = false
    )
  );

DROP POLICY IF EXISTS "Authors can update own replies" ON public.community_replies;

CREATE POLICY "Authors can update own replies"
  ON public.community_replies FOR UPDATE
  TO authenticated
  USING (author_user_id = auth.uid() AND reply_status = 'active')
  WITH CHECK (author_user_id = auth.uid());

-- ============================================================
-- REPLACE RLS POLICIES - community_reports
-- Add policy for users to view own submitted reports
-- ============================================================
DROP POLICY IF EXISTS "Users can view own reports" ON public.community_reports;

CREATE POLICY "Users can view own reports"
  ON public.community_reports FOR SELECT
  TO authenticated
  USING (reporter_user_id = auth.uid());

-- ============================================================
-- REPLACE TRIGGERS WITH CORRECT STATUS-AWARE VERSIONS
-- ============================================================

-- Remove old triggers
DROP TRIGGER IF EXISTS trg_community_post_room_count   ON public.community_posts;
DROP TRIGGER IF EXISTS trg_community_reaction_sync     ON public.community_reactions;
DROP TRIGGER IF EXISTS trg_community_reply_added       ON public.community_replies;

-- Drop old functions
DROP FUNCTION IF EXISTS sync_room_post_count();
DROP FUNCTION IF EXISTS sync_community_reaction_count();
DROP FUNCTION IF EXISTS increment_community_reply_count();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.community_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_profiles_updated_at ON public.community_profiles;
CREATE TRIGGER community_profiles_updated_at
  BEFORE UPDATE ON public.community_profiles
  FOR EACH ROW EXECUTE FUNCTION public.community_set_updated_at();

DROP TRIGGER IF EXISTS community_posts_updated_at ON public.community_posts;
CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_set_updated_at();

DROP TRIGGER IF EXISTS community_replies_updated_at ON public.community_replies;
CREATE TRIGGER community_replies_updated_at
  BEFORE UPDATE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_set_updated_at();

-- Post insert: bump room post_count and profile post_count
CREATE OR REPLACE FUNCTION public.community_on_post_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_rooms
    SET post_count = post_count + 1 WHERE id = NEW.room_id;
  UPDATE public.community_profiles
    SET post_count = post_count + 1 WHERE user_id = NEW.author_user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_posts_insert_trigger ON public.community_posts;
CREATE TRIGGER community_posts_insert_trigger
  AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_on_post_insert();

-- Post status change: adjust counters
CREATE OR REPLACE FUNCTION public.community_on_post_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.post_status = 'active' AND NEW.post_status != 'active' THEN
    UPDATE public.community_rooms
      SET post_count = GREATEST(post_count - 1, 0) WHERE id = NEW.room_id;
    UPDATE public.community_profiles
      SET post_count = GREATEST(post_count - 1, 0) WHERE user_id = NEW.author_user_id;
  ELSIF OLD.post_status != 'active' AND NEW.post_status = 'active' THEN
    UPDATE public.community_rooms
      SET post_count = post_count + 1 WHERE id = NEW.room_id;
    UPDATE public.community_profiles
      SET post_count = post_count + 1 WHERE user_id = NEW.author_user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_posts_update_trigger ON public.community_posts;
CREATE TRIGGER community_posts_update_trigger
  AFTER UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_on_post_update();

-- Reply insert: bump reply_count on post and profile
CREATE OR REPLACE FUNCTION public.community_on_reply_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_posts
    SET reply_count = reply_count + 1,
        last_activity_at = now()
    WHERE id = NEW.post_id;
  UPDATE public.community_profiles
    SET reply_count = reply_count + 1
    WHERE user_id = NEW.author_user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_replies_insert_trigger ON public.community_replies;
CREATE TRIGGER community_replies_insert_trigger
  AFTER INSERT ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reply_insert();

-- Reply status change: adjust reply_count on post and profile
CREATE OR REPLACE FUNCTION public.community_on_reply_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.reply_status = 'active' AND NEW.reply_status != 'active' THEN
    UPDATE public.community_posts
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE id = NEW.post_id;
    UPDATE public.community_profiles
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE user_id = NEW.author_user_id;
  ELSIF OLD.reply_status != 'active' AND NEW.reply_status = 'active' THEN
    UPDATE public.community_posts
      SET reply_count = reply_count + 1, last_activity_at = now()
      WHERE id = NEW.post_id;
    UPDATE public.community_profiles
      SET reply_count = reply_count + 1
      WHERE user_id = NEW.author_user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_replies_update_trigger ON public.community_replies;
CREATE TRIGGER community_replies_update_trigger
  AFTER UPDATE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reply_update();

-- Reaction insert: bump reaction_count on post
CREATE OR REPLACE FUNCTION public.community_on_reaction_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_posts
    SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_reactions_insert_trigger ON public.community_reactions;
CREATE TRIGGER community_reactions_insert_trigger
  AFTER INSERT ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reaction_insert();

-- Reaction delete: decrement reaction_count on post
CREATE OR REPLACE FUNCTION public.community_on_reaction_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_posts
    SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS community_reactions_delete_trigger ON public.community_reactions;
CREATE TRIGGER community_reactions_delete_trigger
  AFTER DELETE ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reaction_delete();
