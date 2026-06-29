/*
  # Comprehensive Security Hardening

  ## Summary
  This migration fixes all issues identified in the production security audit.
  It addresses SECURITY DEFINER view misconfiguration, mutable search_path on
  functions, a role self-escalation vector via a missing WITH CHECK policy clause,
  a missing authenticated SELECT policy on the responses table, and a duplicate
  quota enforcement trigger.

  ## Changes

  ### 1. CRITICAL — v_plan_by_price: SECURITY DEFINER view → SECURITY INVOKER
  The view was created without `WITH (security_invoker = true)`, causing it to
  execute with the view owner's (postgres) privileges, bypassing RLS. Recreated
  with security_invoker so it runs as the calling user.

  ### 2. CRITICAL — enforce_team_observation_quota: SECURITY DEFINER with no search_path
  The function runs as postgres (SECURITY DEFINER) but had no pinned search_path,
  making it vulnerable to search_path injection from a malicious session that places
  shadowing objects in pg_temp. Fixed by recreating with SET search_path = public, pg_temp.

  ### 3. HIGH — community_on_reply_update: missing search_path
  The trigger function had no search_path set at all, inconsistent with all peer
  trigger functions. Fixed by pinning search_path = public, pg_temp.

  ### 4. HIGH — get_community_public_stats, reconcile_community_counters: incomplete search_path
  Both SECURITY DEFINER functions had search_path = public but were missing pg_temp,
  deviating from the safe pattern. Fixed by appending pg_temp to both.

  ### 5. CRITICAL — profiles_update_own: missing WITH CHECK enables role self-escalation
  The UPDATE policy for own-profile edits had USING (id = auth.uid()) but no
  WITH CHECK clause. Without it a user could write any value including escalating
  their own role to 'admin'. Fixed by adding WITH CHECK that locks id, role, and
  disabled to their existing values.

  ### 6. MEDIUM — responses: missing authenticated SELECT policy
  The responses table had RLS enabled but only an anon demo-data SELECT policy.
  Authenticated users had no policy to read their own responses directly. Added a
  policy allowing users to select responses linked to observations they authored or
  are a team member for.

  ### 7. MEDIUM — Duplicate quota trigger removed
  Two BEFORE INSERT triggers on observations (trg_enforce_observation_quota and
  trg_enforce_team_observation_quota) both called the same function, causing the
  quota check to run twice per insert. The older trg_enforce_observation_quota is
  dropped; the newer trg_enforce_team_observation_quota remains.

  ## Security Impact
  - Eliminates privilege escalation path through SECURITY DEFINER view
  - Closes search_path injection vector on a superuser-privilege trigger function
  - Prevents users from self-escalating to admin role
  - Fixes silent RLS gap on responses table for authenticated users
  - Removes double-enforcement of quota that could cause false quota errors
*/

-- ============================================================
-- 1. Fix v_plan_by_price — add security_invoker = true
-- ============================================================

DROP VIEW IF EXISTS public.v_plan_by_price;

CREATE VIEW public.v_plan_by_price
  WITH (security_invoker = true)
AS
SELECT
  id            AS plan_id,
  name,
  interval,
  price_cents,
  stripe_price_id
FROM public.subscription_plans
ORDER BY price_cents ASC;

GRANT SELECT ON public.v_plan_by_price TO anon, authenticated;


-- ============================================================
-- 2. Fix enforce_team_observation_quota — pin search_path
--    (SECURITY DEFINER function — most critical fix)
-- ============================================================

CREATE OR REPLACE FUNCTION public.enforce_team_observation_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_team_id     uuid;
  v_plan_id     text;
  v_obs_limit   int;
  v_used        int;
BEGIN
  v_team_id := COALESCE(NEW.team_id, (
    SELECT tm.team_id
    FROM public.cv_team_members tm
    WHERE tm.user_id = NEW.user_id
      AND tm.state = 'active'
    LIMIT 1
  ));

  IF v_team_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('obs_quota:' || v_team_id::text));

  SELECT sp.obs_limit
  INTO   v_obs_limit
  FROM   public.cv_team          t
  JOIN   public.user_subscriptions us ON us.user_id = t.owner_user_id
  JOIN   public.subscription_plans  sp ON sp.id       = us.plan_id
  WHERE  t.id = v_team_id
    AND  us.status IN ('active', 'trialing')
    AND  (us.current_period_end IS NULL OR us.current_period_end > now())
  ORDER  BY us.current_period_end DESC NULLS LAST
  LIMIT  1;

  IF v_obs_limit IS NULL THEN
    SELECT obs_limit INTO v_obs_limit
    FROM public.subscription_plans WHERE id = 'free'
    LIMIT 1;
  END IF;

  IF v_obs_limit IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_used
  FROM public.observations
  WHERE team_id = v_team_id;

  IF v_used >= v_obs_limit THEN
    RAISE EXCEPTION 'observation_quota_exceeded'
      USING DETAIL = format('Team has used %s of %s allowed observations', v_used, v_obs_limit);
  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================
-- 3. Fix community_on_reply_update — pin search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.community_on_reply_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.reply_status = 'active' AND NEW.reply_status != 'active' THEN
    UPDATE public.community_posts
    SET reply_count      = GREATEST(reply_count - 1, 0),
        last_activity_at = now()
    WHERE id = NEW.post_id;

    UPDATE public.community_profiles
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE user_id = NEW.author_user_id;

  ELSIF OLD.reply_status != 'active' AND NEW.reply_status = 'active' THEN
    UPDATE public.community_posts
    SET reply_count      = reply_count + 1,
        last_activity_at = now()
    WHERE id = NEW.post_id;

    UPDATE public.community_profiles
    SET reply_count = reply_count + 1
    WHERE user_id = NEW.author_user_id;
  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================
-- 4. Fix get_community_public_stats — append pg_temp
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_community_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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


-- ============================================================
-- 4b. Fix reconcile_community_counters — append pg_temp
-- ============================================================

CREATE OR REPLACE FUNCTION public.reconcile_community_counters()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_posts_fixed   int := 0;
  v_replies_fixed int := 0;
  v_rooms_fixed   int := 0;
BEGIN
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
    'posts_fixed',    v_posts_fixed,
    'rooms_fixed',    v_rooms_fixed,
    'profiles_fixed', v_replies_fixed
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_community_counters() TO authenticated;


-- ============================================================
-- 5. Fix profiles_update_own — add WITH CHECK to prevent
--    role self-escalation and id tampering
-- ============================================================

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = ( SELECT auth.uid() AS uid))
  WITH CHECK (
    id       = ( SELECT auth.uid() AS uid)
    AND role = (SELECT role FROM public.profiles WHERE id = ( SELECT auth.uid() AS uid))
    AND disabled = (SELECT disabled FROM public.profiles WHERE id = ( SELECT auth.uid() AS uid))
  );


-- ============================================================
-- 6. Add responses SELECT policy for authenticated users
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'responses'
      AND policyname = 'responses_select_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "responses_select_own"
        ON public.responses
        FOR SELECT
        TO authenticated
        USING (
          observation_id IN (
            SELECT o.id
            FROM public.observations o
            WHERE o.user_id = ( SELECT auth.uid() AS uid)
               OR (
                 o.team_id IS NOT NULL
                 AND EXISTS (
                   SELECT 1 FROM public.cv_team_members tm
                   WHERE tm.team_id = o.team_id
                     AND tm.user_id = ( SELECT auth.uid() AS uid)
                     AND tm.state IN ('active', 'frozen')
                 )
               )
          )
        )
    $policy$;
  END IF;
END $$;


-- ============================================================
-- 7. Remove duplicate quota trigger
--    trg_enforce_observation_quota is the old duplicate;
--    trg_enforce_team_observation_quota is the canonical one.
-- ============================================================

DROP TRIGGER IF EXISTS trg_enforce_observation_quota ON public.observations;
