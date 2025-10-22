/*
  # Invitation System Functions

  1. Functions
    - cv_check_team_seats(p_team uuid): Check if team can add another member
    - cv_create_invite(p_team uuid, p_email text): Generate invite token
    - cv_accept_invite(p_token text): Accept invite and join team

  2. Security
    - Token generated using gen_random_bytes for cryptographic security
    - Token hashed using SHA-256 before storage
    - 7-day expiration window
    - Single-use tokens (marked consumed_at)
    - Seat limit validation before acceptance
*/

-- Check if team has available seats
CREATE OR REPLACE FUNCTION public.cv_check_team_seats(p_team uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_seat_limit integer;
  v_current_count integer;
BEGIN
  -- Get seat limit from cv_plan_limits via team's plan_id
  SELECT cpl.seats
  INTO v_seat_limit
  FROM public.cv_team t
  JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id
  WHERE t.id = p_team;

  -- If no limit found, deny
  IF v_seat_limit IS NULL THEN
    RETURN false;
  END IF;

  -- Count current active members
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.cv_team_members
  WHERE team_id = p_team
    AND state = 'active';

  -- Return whether there's room
  RETURN v_current_count < v_seat_limit;
END;
$$;

-- Create invite token
CREATE OR REPLACE FUNCTION public.cv_create_invite(p_team uuid, p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
  v_token_hash bytea;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is owner or active member of this team
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = v_user_id
      AND state = 'active'
  ) THEN
    RAISE EXCEPTION 'Not authorized to create invites for this team';
  END IF;

  -- Check if team has available seats
  IF NOT public.cv_check_team_seats(p_team) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  -- Generate random token (32 bytes = 64 hex chars)
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Hash token for storage
  v_token_hash := digest(v_token, 'sha256');

  -- Insert invite record
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
    now() + interval '7 days',
    v_user_id
  );

  -- Return plaintext token (only time it's visible)
  RETURN v_token;
END;
$$;

-- Accept invite token
CREATE OR REPLACE FUNCTION public.cv_accept_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_token_hash bytea;
  v_invite record;
  v_team_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Hash the provided token
  v_token_hash := digest(p_token, 'sha256');

  -- Find matching invite
  SELECT
    id,
    team_id,
    expires_at,
    consumed_at
  INTO v_invite
  FROM public.cv_team_invites
  WHERE token_hash = v_token_hash;

  -- Validate invite exists
  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;

  -- Check if already consumed
  IF v_invite.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite has already been used';
  END IF;

  -- Check if expired
  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invite has expired';
  END IF;

  v_team_id := v_invite.team_id;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = v_team_id
      AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;

  -- Verify team has available seats
  IF NOT public.cv_check_team_seats(v_team_id) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  -- Add user as team member
  INSERT INTO public.cv_team_members (team_id, user_id, role, state)
  VALUES (v_team_id, v_user_id, 'member', 'active');

  -- Mark invite as consumed
  UPDATE public.cv_team_invites
  SET consumed_at = now()
  WHERE id = v_invite.id;

  -- Set as user's active team
  UPDATE public.profiles
  SET active_team_id = v_team_id
  WHERE id = v_user_id;

  -- Return team ID
  RETURN v_team_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cv_check_team_seats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_create_invite(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_accept_invite(text) TO authenticated;
