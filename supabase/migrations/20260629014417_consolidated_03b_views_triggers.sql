/*
  Consolidated Schema - Part 3b: Views, Community Trigger Functions, and Triggers
*/

-- ===== VIEW: cv_v_team_remaining =====

CREATE OR REPLACE VIEW public.cv_v_team_remaining AS
SELECT
  t.id        AS team_id,
  t.plan_id,
  COALESCE(cpl.team_quota_year, 0) AS quota,
  COALESCE(
    (SELECT COUNT(*) FROM public.observations o
     WHERE o.team_id = t.id
       AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)),
    0
  ) AS used,
  GREATEST(
    0,
    COALESCE(cpl.team_quota_year, 0) - COALESCE(
      (SELECT COUNT(*) FROM public.observations o
       WHERE o.team_id = t.id
         AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)),
      0
    )
  ) AS remaining
FROM public.cv_team t
LEFT JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id;

-- ===== COMMUNITY TRIGGER FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.community_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.community_on_reaction_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE public.community_posts
      SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.community_on_reaction_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.post_id IS NOT NULL THEN
    UPDATE public.community_posts
      SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN OLD;
END;
$$;

-- Also update create_community_profile_for_new_user to use user_id column
CREATE OR REPLACE FUNCTION public.create_community_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base        text;
  v_handle      text;
  v_attempt     int := 0;
  v_email       text;
  v_display     text;
BEGIN
  v_display := COALESCE(NEW.display_name, '');
  v_base := lower(regexp_replace(split_part(trim(v_display), ' ', 1), '[^a-zA-Z0-9_]', '', 'g'));

  IF length(v_base) < 2 THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
    v_base := lower(regexp_replace(split_part(COALESCE(v_email, 'caregiver'), '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));
    v_base := left(v_base, 20);
  END IF;

  IF length(v_base) < 2 THEN
    v_base := 'caregiver';
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    v_handle := v_base || '_' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

    BEGIN
      INSERT INTO public.community_profiles (
        user_id, handle, bio, avatar_color, handle_is_auto_generated
      ) VALUES (
        NEW.id, v_handle, '', '#00BCD4', true
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 10 THEN
        v_handle := v_base || '_' || extract(epoch from clock_timestamp())::bigint % 100000;
        INSERT INTO public.community_profiles (
          user_id, handle, bio, avatar_color, handle_is_auto_generated
        ) VALUES (
          NEW.id, v_handle, '', '#00BCD4', true
        );
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$;

-- ===== CARE PLAN TRIGGER FUNCTION =====

CREATE OR REPLACE FUNCTION public.set_care_plan_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===== TRIGGERS =====

-- Core updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_observations ON public.observations;
CREATE TRIGGER set_updated_at_observations
  BEFORE UPDATE ON public.observations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_responses ON public.responses;
CREATE TRIGGER set_updated_at_responses
  BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Community triggers
DROP TRIGGER IF EXISTS community_profiles_updated_at ON public.community_profiles;
CREATE TRIGGER community_profiles_updated_at
  BEFORE UPDATE ON public.community_profiles
  FOR EACH ROW EXECUTE FUNCTION public.community_set_updated_at();

DROP TRIGGER IF EXISTS community_posts_updated_at ON public.community_posts;
CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_set_updated_at();

DROP TRIGGER IF EXISTS community_posts_insert_trigger ON public.community_posts;
CREATE TRIGGER community_posts_insert_trigger
  AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_on_post_insert();

DROP TRIGGER IF EXISTS community_posts_update_trigger ON public.community_posts;
CREATE TRIGGER community_posts_update_trigger
  AFTER UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_on_post_update();

DROP TRIGGER IF EXISTS community_replies_updated_at ON public.community_replies;
CREATE TRIGGER community_replies_updated_at
  BEFORE UPDATE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_set_updated_at();

DROP TRIGGER IF EXISTS community_replies_insert_trigger ON public.community_replies;
CREATE TRIGGER community_replies_insert_trigger
  AFTER INSERT ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reply_insert();

DROP TRIGGER IF EXISTS community_replies_update_trigger ON public.community_replies;
CREATE TRIGGER community_replies_update_trigger
  AFTER UPDATE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reply_update();

DROP TRIGGER IF EXISTS community_reactions_insert_trigger ON public.community_reactions;
CREATE TRIGGER community_reactions_insert_trigger
  AFTER INSERT ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reaction_insert();

DROP TRIGGER IF EXISTS community_reactions_delete_trigger ON public.community_reactions;
CREATE TRIGGER community_reactions_delete_trigger
  AFTER DELETE ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.community_on_reaction_delete();

-- Community profile auto-creation trigger (fires on profiles insert)
DROP TRIGGER IF EXISTS create_community_profile_trigger ON public.profiles;
CREATE TRIGGER create_community_profile_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_community_profile_for_new_user();

-- Care plan triggers
DROP TRIGGER IF EXISTS trg_care_plans_updated_at ON public.care_plans;
CREATE TRIGGER trg_care_plans_updated_at
  BEFORE UPDATE ON public.care_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_care_plan_updated_at();

DROP TRIGGER IF EXISTS trg_care_plan_sections_updated_at ON public.care_plan_sections;
CREATE TRIGGER trg_care_plan_sections_updated_at
  BEFORE UPDATE ON public.care_plan_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_care_plan_updated_at();

-- Observation quota enforcement trigger
DROP TRIGGER IF EXISTS enforce_observation_quota ON public.observations;
CREATE TRIGGER enforce_observation_quota
  BEFORE INSERT ON public.observations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_team_observation_quota();
