/*
  # Family Circle invite QC fixes

  1. New Functions
    - `public.cv_peek_invite(p_token text)` - Public, SECURITY DEFINER helper that
      takes a raw invite token and returns a JSON object with the invited
      `email`, `expires_at`, `consumed`, `expired`, and `team_id`. Returns a
      `{ invalid: true }` payload when the token is unknown. Used by the
      invite-setup page to pre-fill (editable) the email field BEFORE the
      invitee signs up. Executable by both `anon` and `authenticated` roles.

  2. Updated Functions
    - `public.cv_accept_invite(p_token text)` - Replaced with a new version
      that additionally validates that the authenticated user's email
      (case-insensitively) matches the invite's recorded email. On mismatch it
      raises an exception but does NOT consume or invalidate the invite, so
      the intended recipient can still claim it. All prior checks (expiry,
      consumed, seat capacity, existing membership, free-plan provisioning)
      remain in place.

  3. Security
    - `cv_peek_invite` only returns the invited email/team_id/expiry, which
      are necessary for UX. It never returns the token hash or any other
      sensitive data.
    - Email comparison is lower-cased to avoid false mismatches on casing
      differences between the invite and the authenticated user's address.
*/

CREATE OR REPLACE FUNCTION public.cv_peek_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_token_hash bytea;
  v_invite record;
BEGIN
  IF p_token IS NULL OR length(p_token) = 0 THEN
    RETURN jsonb_build_object('invalid', true);
  END IF;

  v_token_hash := digest(p_token, 'sha256');

  SELECT id, team_id, email, expires_at, consumed_at
  INTO v_invite
  FROM public.cv_team_invites
  WHERE token_hash = v_token_hash;

  IF v_invite.id IS NULL THEN
    RETURN jsonb_build_object('invalid', true);
  END IF;

  RETURN jsonb_build_object(
    'team_id', v_invite.team_id,
    'email', v_invite.email,
    'expires_at', v_invite.expires_at,
    'consumed', v_invite.consumed_at IS NOT NULL,
    'expired', v_invite.expires_at < now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cv_peek_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cv_peek_invite(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cv_accept_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_token_hash bytea;
  v_invite record;
  v_team_id uuid;
  v_has_sub boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  v_token_hash := digest(p_token, 'sha256');

  SELECT id, team_id, email, expires_at, consumed_at
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

  IF lower(coalesce(v_user_email, '')) <> lower(coalesce(v_invite.email, '')) THEN
    RAISE EXCEPTION 'This invite was sent to a different email address. Please sign in with the address the invitation was sent to.';
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
