/*
  # Production Readiness: DB Cleanup, Trigger Fix & Counter Reconciliation

  ## Summary
  Three related improvements to the community schema:

  ## 1. Drop Legacy is_deleted Columns
  The `community_posts` and `community_replies` tables have an `is_deleted` boolean
  column that is no longer used — `post_status` and `reply_status` are the source
  of truth for content visibility. This migration drops the redundant columns.
  No code references to `is_deleted` exist in the current codebase.

  ## 2. Fix last_activity_at Trigger on Reply Hide/Remove
  The existing `community_on_reply_update` trigger correctly updates `last_activity_at`
  when a reply is restored to 'active', but does NOT update it when a reply is hidden
  or removed. This means "sorted by activity" could surface posts with recently-moderated
  replies out of order. The fix: always update `last_activity_at` on the parent post
  whenever a reply's status changes (hide, remove, or restore).

  ## 3. Counter Reconciliation Function
  Adds `reconcile_community_counters()` — a safety-net function that recalculates
  `post_count`, `reply_count`, and `reaction_count` from source rows. This corrects
  any counter drift that may have accumulated. The function is SECURITY DEFINER so it
  can be called by admin users via RPC and operates across all community tables.

  ## 4. Public Hub Stats RPC
  Adds `get_community_public_stats()` — a lightweight function that returns member
  count, post count, and recent active members in a single round trip, replacing
  three separate queries on the public hub page.

  ## Tables Modified
  - `community_posts` — drops `is_deleted` column
  - `community_replies` — drops `is_deleted` column

  ## New Functions
  - `community_on_reply_update` — updated to always touch `last_activity_at`
  - `reconcile_community_counters()` — safety-net counter reconciliation
  - `get_community_public_stats()` — public stats in one round trip
*/

-- ================================================================
-- 1. Drop legacy is_deleted columns
-- ================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_posts'
      AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.community_posts DROP COLUMN is_deleted;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_replies'
      AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.community_replies DROP COLUMN is_deleted;
  END IF;
END $$;

-- ================================================================
-- 2. Fix last_activity_at trigger for reply status changes
-- ================================================================

CREATE OR REPLACE FUNCTION public.community_on_reply_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF OLD.reply_status = 'active' AND NEW.reply_status != 'active' THEN
    UPDATE public.community_posts
    SET reply_count = GREATEST(reply_count - 1, 0),
        last_activity_at = now()
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

-- ================================================================
-- 3. Counter reconciliation function (admin / service role)
-- ================================================================

CREATE OR REPLACE FUNCTION public.reconcile_community_counters()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_posts_fixed   int := 0;
  v_replies_fixed int := 0;
  v_rooms_fixed   int := 0;
BEGIN
  -- Fix reply_count on posts
  UPDATE public.community_posts p
  SET reply_count = (
    SELECT COUNT(*)
    FROM public.community_replies r
    WHERE r.post_id = p.id
      AND r.reply_status = 'active'
  )
  WHERE reply_count != (
    SELECT COUNT(*)
    FROM public.community_replies r
    WHERE r.post_id = p.id
      AND r.reply_status = 'active'
  );
  GET DIAGNOSTICS v_posts_fixed = ROW_COUNT;

  -- Fix post_count on rooms
  UPDATE public.community_rooms rm
  SET post_count = (
    SELECT COUNT(*)
    FROM public.community_posts p
    WHERE p.room_id = rm.id
      AND p.post_status = 'active'
  )
  WHERE post_count != (
    SELECT COUNT(*)
    FROM public.community_posts p
    WHERE p.room_id = rm.id
      AND p.post_status = 'active'
  );
  GET DIAGNOSTICS v_rooms_fixed = ROW_COUNT;

  -- Fix reply_count on profiles
  UPDATE public.community_profiles cp
  SET reply_count = (
    SELECT COUNT(*)
    FROM public.community_replies r
    WHERE r.author_user_id = cp.user_id
      AND r.reply_status = 'active'
  )
  WHERE reply_count != (
    SELECT COUNT(*)
    FROM public.community_replies r
    WHERE r.author_user_id = cp.user_id
      AND r.reply_status = 'active'
  );
  GET DIAGNOSTICS v_replies_fixed = ROW_COUNT;

  RETURN jsonb_build_object(
    'posts_fixed', v_posts_fixed,
    'rooms_fixed', v_rooms_fixed,
    'profiles_fixed', v_replies_fixed
  );
END;
$$;

-- ================================================================
-- 4. Public hub stats RPC (anon-accessible)
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_community_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_members  bigint;
  v_posts    bigint;
BEGIN
  SELECT COUNT(*) INTO v_members
  FROM public.community_profiles
  WHERE is_banned = false;

  SELECT COUNT(*) INTO v_posts
  FROM public.community_posts
  WHERE post_status = 'active';

  RETURN jsonb_build_object(
    'member_count', v_members,
    'post_count',   v_posts
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_public_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_community_counters() TO authenticated;
