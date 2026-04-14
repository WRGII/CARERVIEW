/*
  # Fix cv_accept_invite — correct ON CONFLICT target for user_subscriptions

  ## Problem
  The cv_accept_invite function uses:
    ON CONFLICT (subscription_id) DO UPDATE SET ...

  However, user_subscriptions has a composite PRIMARY KEY (user_id, subscription_id).
  There is no unique constraint on subscription_id alone, so PostgreSQL throws:
    "there is no unique or exclusion constraint matching the ON CONFLICT specification"

  This prevents invited members from completing the join flow.

  ## Fix
  Change the ON CONFLICT target from (subscription_id) to (user_id, subscription_id)
  to match the actual composite primary key of the user_subscriptions table.

  ## Notes
  - Only the ON CONFLICT clause changes; all other logic is identical
  - No RLS or schema changes
*/

CREATE OR REPLACE FUNCTION public.cv_accept_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user_id uuid;
  v_token_hash bytea;
  v_invite record;
  v_team_id uuid;
  v_has_sub boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_token_hash := digest(p_token, 'sha256');

  SELECT id, team_id, expires_at, consumed_at
  INTO v_invite
  FROM public.cv_team_invites
  WHERE token_hash = v_token_hash;

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;

  IF v_invite.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite has already been used';
  END IF;

  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invite has expired';
  END IF;

  v_team_id := v_invite.team_id;

  IF EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = v_team_id
      AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;

  IF NOT public.cv_check_team_seats(v_team_id) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  INSERT INTO public.cv_team_members (team_id, user_id, role, state)
  VALUES (v_team_id, v_user_id, 'member', 'active');

  UPDATE public.cv_team_invites
  SET consumed_at = now()
  WHERE id = v_invite.id;

  UPDATE public.profiles
  SET active_team_id = v_team_id
  WHERE id = v_user_id;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = v_user_id
      AND status IN ('active', 'trialing')
      AND current_period_end > now()
  ) INTO v_has_sub;

  IF NOT v_has_sub THEN
    INSERT INTO public.user_subscriptions (
      user_id,
      subscription_id,
      plan_id,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      v_user_id,
      'free_' || v_user_id::text,
      'free',
      'active',
      now(),
      now() + interval '1 year'
    )
    ON CONFLICT (user_id, subscription_id) DO UPDATE SET
      status = 'active',
      current_period_start = now(),
      current_period_end = now() + interval '1 year';
  END IF;

  RETURN v_team_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_accept_invite(text) TO authenticated;
