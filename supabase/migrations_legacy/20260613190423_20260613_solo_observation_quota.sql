/*
  # Solo observation quota for Community Members (free plan)

  Community Members have no team (team_id IS NULL). This migration:

  1. Creates cv_get_solo_remaining() — returns how many solo observations the
     calling user can still create in the rolling 12-month window.
     Reads obs_limit from subscription_plans via user_subscriptions.

  2. Extends enforce_team_observation_quota() to also enforce the rolling
     12-month quota for solo (teamless) observations.

  3. Grants EXECUTE on the new function to authenticated only.
*/

-- 1. Solo remaining RPC callable from the frontend
CREATE OR REPLACE FUNCTION public.cv_get_solo_remaining()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_plan_id   text;
  v_obs_limit integer;
  v_used      integer;
BEGIN
  -- Look up the user's active plan
  SELECT us.plan_id
  INTO v_plan_id
  FROM public.user_subscriptions us
  WHERE us.user_id = auth.uid()
    AND us.status IN ('active', 'trialing')
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Get the obs_limit for that plan
  SELECT sp.obs_limit
  INTO v_obs_limit
  FROM public.subscription_plans sp
  WHERE sp.id = v_plan_id;

  IF v_obs_limit IS NULL OR v_obs_limit = 0 THEN
    RETURN 0;
  END IF;

  -- Count solo observations in rolling 12-month window
  SELECT COUNT(*)::integer
  INTO v_used
  FROM public.observations o
  WHERE o.user_id = auth.uid()
    AND o.team_id IS NULL
    AND o.observation_date >= (CURRENT_DATE - INTERVAL '12 months');

  RETURN GREATEST(0, v_obs_limit - v_used);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_get_solo_remaining() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.cv_get_solo_remaining() FROM anon, public;

-- 2. Extend the observation quota trigger to cover solo observations
CREATE OR REPLACE FUNCTION public.enforce_team_observation_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_remaining integer;
  v_plan_id   text;
  v_obs_limit integer;
  v_used      integer;
BEGIN
  -- ── Team-based quota (existing logic) ──────────────────────────────────────
  IF NEW.team_id IS NOT NULL THEN
    SELECT remaining
    INTO v_remaining
    FROM public.cv_v_team_remaining
    WHERE team_id = NEW.team_id;

    IF v_remaining IS NULL THEN
      RAISE EXCEPTION 'Unable to determine observation quota for team';
    END IF;

    IF v_remaining <= 0 THEN
      RAISE EXCEPTION 'Team has reached observation limit for this year. Remaining: 0';
    END IF;

    RETURN NEW;
  END IF;

  -- ── Solo quota (rolling 12-month window for teamless observations) ─────────
  -- Look up the inserting user's active plan
  SELECT us.plan_id
  INTO v_plan_id
  FROM public.user_subscriptions us
  WHERE us.user_id = NEW.user_id
    AND us.status IN ('active', 'trialing')
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  -- No plan row → no quota to enforce (admin inserts, etc.)
  IF v_plan_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get the per-user obs_limit for this plan
  SELECT sp.obs_limit
  INTO v_obs_limit
  FROM public.subscription_plans sp
  WHERE sp.id = v_plan_id;

  -- Plan has no limit defined → allow
  IF v_obs_limit IS NULL OR v_obs_limit = 0 THEN
    RETURN NEW;
  END IF;

  -- Count existing solo observations in rolling 12-month window
  SELECT COUNT(*)::integer
  INTO v_used
  FROM public.observations o
  WHERE o.user_id = NEW.user_id
    AND o.team_id IS NULL
    AND o.observation_date >= (CURRENT_DATE - INTERVAL '12 months');

  IF v_used >= v_obs_limit THEN
    RAISE EXCEPTION 'You have reached your % observation limit for the past 12 months.', v_obs_limit;
  END IF;

  RETURN NEW;
END;
$$;
