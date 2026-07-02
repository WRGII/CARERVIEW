-- Creates an RPC function that computes a user's effective plan,
-- considering both personal subscriptions and team membership inheritance.
-- Family Circle members inherit the owner's family_qtr plan.

CREATE OR REPLACE FUNCTION public.cv_get_effective_plan(p_user_id uuid)
RETURNS TABLE (
  plan_id text,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  source text,
  team_role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_own RECORD;
  v_team RECORD;
  v_free RECORD;
BEGIN
  -- 1. Check for personal active paid subscription
  SELECT us.plan_id, us.status, us.current_period_start, us.current_period_end
  INTO v_own
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
    AND us.plan_id <> 'free'
    AND us.current_period_end > now()
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_own.plan_id::text,
      v_own.status::text,
      v_own.current_period_start,
      v_own.current_period_end,
      'own'::text AS source,
      'owner'::text AS team_role;
    RETURN;
  END IF;

  -- 2. Check for team membership with owner who has active family_qtr
  SELECT
    ct.plan_id AS team_plan_id,
    ctm.role AS member_role,
    owner_sub.status AS owner_status,
    owner_sub.current_period_start AS owner_period_start,
    owner_sub.current_period_end AS owner_period_end
  INTO v_team
  FROM cv_team_members ctm
  JOIN cv_team ct ON ct.id = ctm.team_id
  JOIN user_subscriptions owner_sub
    ON owner_sub.user_id = ct.owner_user_id
    AND owner_sub.status IN ('active', 'trialing')
    AND owner_sub.plan_id = 'family_qtr'
    AND owner_sub.current_period_end > now()
  WHERE ctm.user_id = p_user_id
    AND ctm.state = 'active'
  ORDER BY owner_sub.current_period_end DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_team.team_plan_id::text,
      v_team.owner_status::text,
      v_team.owner_period_start,
      v_team.owner_period_end,
      'team'::text AS source,
      v_team.member_role::text AS team_role;
    RETURN;
  END IF;

  -- 3. Fallback: user's own free plan (if any)
  SELECT us.plan_id, us.status, us.current_period_start, us.current_period_end
  INTO v_free
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
    AND us.current_period_end > now()
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_free.plan_id::text,
      v_free.status::text,
      v_free.current_period_start,
      v_free.current_period_end,
      'own'::text AS source,
      NULL::text AS team_role;
    RETURN;
  END IF;

  -- 4. No plan at all
  RETURN;
END;
$$;

-- Grant execute only to authenticated users
REVOKE ALL ON FUNCTION public.cv_get_effective_plan(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cv_get_effective_plan(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.cv_get_effective_plan(uuid) TO authenticated;
