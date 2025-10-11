/*
  # Plan Enforcement Function

  1. Function
    - cv_apply_plan_to_owner_teams(p_owner uuid, p_plan_id text)
    - Updates all teams owned by user to match new plan
    - Enforces seat limits by freezing excess members

  2. Behavior
    - Updates cv_team.plan_id for all owned teams
    - If new plan has fewer seats, freezes most recently joined members
    - Owner always stays active
    - Called by Stripe webhook after subscription changes

  3. Edge Cases
    - If plan_id='free' or 'primary_qtr', no team support (logs warning)
    - Keeps owner and earliest members active when downsizing
    - Frozen members can still view observations (read-only)
*/

CREATE OR REPLACE FUNCTION public.cv_apply_plan_to_owner_teams(
  p_owner uuid,
  p_plan_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team record;
  v_seat_limit integer;
  v_current_count integer;
  v_members_to_freeze integer;
BEGIN
  -- Get seat limit for new plan (NULL if not a team plan)
  SELECT seats
  INTO v_seat_limit
  FROM public.cv_plan_limits
  WHERE plan_id = p_plan_id;

  -- If plan doesn't support teams, log and exit
  IF v_seat_limit IS NULL THEN
    RAISE NOTICE 'Plan % does not support teams, no action taken', p_plan_id;
    RETURN;
  END IF;

  -- Update plan_id for all teams owned by this user
  UPDATE public.cv_team
  SET plan_id = p_plan_id
  WHERE owner_user_id = p_owner;

  -- For each team, enforce seat limits
  FOR v_team IN
    SELECT id
    FROM public.cv_team
    WHERE owner_user_id = p_owner
  LOOP
    -- Count current active members
    SELECT COUNT(*)
    INTO v_current_count
    FROM public.cv_team_members
    WHERE team_id = v_team.id
      AND state = 'active';

    -- If over limit, freeze excess members
    IF v_current_count > v_seat_limit THEN
      v_members_to_freeze := v_current_count - v_seat_limit;

      -- Freeze most recently joined members (excluding owner)
      UPDATE public.cv_team_members
      SET state = 'frozen'
      WHERE team_id = v_team.id
        AND role != 'owner'
        AND state = 'active'
        AND user_id IN (
          SELECT user_id
          FROM public.cv_team_members
          WHERE team_id = v_team.id
            AND role != 'owner'
            AND state = 'active'
          ORDER BY joined_at DESC
          LIMIT v_members_to_freeze
        );

      RAISE NOTICE 'Froze % members on team % due to plan downgrade', v_members_to_freeze, v_team.id;
    END IF;
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) TO service_role;
