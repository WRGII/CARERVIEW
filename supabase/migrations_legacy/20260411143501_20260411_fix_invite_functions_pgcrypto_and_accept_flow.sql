/*
  # Fix invite functions — pgcrypto access + auto-provision invited member subscription

  ## Problem 1: cv_create_invite
  The function's search_path was set to "" (empty string) by a prior migration.
  pgcrypto lives in the `extensions` schema, so gen_random_bytes() and digest()
  cannot be resolved.

  ## Problem 2: cv_accept_invite
  The function has search_path = 'public, pg_temp' which also can't find
  digest() in the extensions schema.

  ## Problem 3: Invited users have no subscription
  When a user accepts a team invite, they become a team member but have no
  user_subscriptions row.  CaregiverGuard checks hasActivePlan() and
  redirects users without a subscription to /create-account.  This blocks
  invited members from accessing the app.

  ## Fix
  1. Recreate cv_create_invite with search_path = 'public, extensions, pg_temp'
  2. Recreate cv_accept_invite with search_path = 'public, extensions, pg_temp'
     AND auto-provision a free subscription for the invited user if they don't
     have one yet.

  ## Security
  - Both functions remain SECURITY DEFINER with restricted search_path
  - Free subscription is only created if the user has no active subscription
  - No changes to RLS policies
*/

-- ============================================================
-- 1. Fix cv_create_invite — add extensions to search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.cv_create_invite(p_team uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_token text;
  v_token_hash bytea;
  v_user_id uuid;
  v_expires_at timestamptz;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = v_user_id
      AND role = 'owner'
      AND state = 'active'
  ) THEN
    RAISE EXCEPTION 'Not authorized to create invites for this team';
  END IF;

  IF NOT public.cv_check_team_seats(p_team) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := digest(v_token, 'sha256');
  v_expires_at := now() + interval '7 days';

  INSERT INTO public.cv_team_invites (
    team_id,
    email,
    token_hash,
    expires_at,
    created_by
  ) VALUES (
    p_team,
    p_email,
    v_token_hash,
    v_expires_at,
    v_user_id
  );

  RETURN jsonb_build_object('token', v_token, 'expires_at', v_expires_at);
END;
$$;

-- ============================================================
-- 2. Fix cv_accept_invite — add extensions + auto-provision free sub
-- ============================================================

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
    ON CONFLICT (subscription_id) DO UPDATE SET
      status = 'active',
      current_period_start = now(),
      current_period_end = now() + interval '1 year';
  END IF;

  RETURN v_team_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_create_invite(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_accept_invite(text) TO authenticated;
