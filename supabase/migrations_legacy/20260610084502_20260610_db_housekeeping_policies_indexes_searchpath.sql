-- DB housekeeping: duplicate policies, missing indexes, SECURITY DEFINER search_path

-- 1. Remove duplicate user_onboarding RLS policies (the "_row" variants are duplicates)
DROP POLICY IF EXISTS "Users can insert own onboarding row" ON user_onboarding;
DROP POLICY IF EXISTS "Users can read own onboarding row" ON user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding row" ON user_onboarding;

-- 2. Add missing indexes on community_notifications foreign keys
--    (these back high-traffic per-user notification queries on every dashboard load)
CREATE INDEX IF NOT EXISTS idx_community_notifications_user_id
  ON community_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_community_notifications_post_id
  ON community_notifications(post_id)
  WHERE post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_notifications_reply_id
  ON community_notifications(reply_id)
  WHERE reply_id IS NOT NULL;

-- 3. Add SET search_path to community SECURITY DEFINER trigger functions
--    to prevent pg_temp schema injection attacks.

CREATE OR REPLACE FUNCTION community_on_post_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE community_rooms
  SET post_count = post_count + 1,
      last_post_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION community_on_post_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.post_status = 'active' AND NEW.post_status != 'active' THEN
    UPDATE community_rooms
    SET post_count = GREATEST(post_count - 1, 0)
    WHERE id = NEW.room_id;
  ELSIF OLD.post_status != 'active' AND NEW.post_status = 'active' THEN
    UPDATE community_rooms
    SET post_count = post_count + 1,
        last_post_at = NOW()
    WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION community_on_reply_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE community_posts
  SET reply_count = reply_count + 1,
      last_reply_at = NOW()
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION community_on_reply_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.reply_status = 'active' AND NEW.reply_status != 'active' THEN
    UPDATE community_posts
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = NEW.post_id;
  ELSIF OLD.reply_status != 'active' AND NEW.reply_status = 'active' THEN
    UPDATE community_posts
    SET reply_count = reply_count + 1,
        last_reply_at = NOW()
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION community_on_reaction_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE community_posts
  SET reaction_count = reaction_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION community_on_reaction_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE community_posts
  SET reaction_count = GREATEST(reaction_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

-- 4. Add rate_limit_log automatic cleanup: delete entries older than 24 hours.
--    Without this the table grows unbounded and degrades check_rate_limit performance.
CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  DELETE FROM rate_limit_log WHERE created_at < NOW() - INTERVAL '24 hours';
$$;

-- Schedule cleanup via a trigger on insert so old rows are pruned automatically.
-- Runs cleanup probabilistically (1 in 100 inserts) to avoid overhead on every call.
CREATE OR REPLACE FUNCTION rate_limit_log_cleanup_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF random() < 0.01 THEN
    PERFORM cleanup_rate_limit_log();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rate_limit_log_cleanup ON rate_limit_log;
CREATE TRIGGER trg_rate_limit_log_cleanup
  AFTER INSERT ON rate_limit_log
  FOR EACH ROW EXECUTE FUNCTION rate_limit_log_cleanup_trigger();
