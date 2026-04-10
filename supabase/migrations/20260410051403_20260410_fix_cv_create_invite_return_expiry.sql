/*
  # Fix cv_create_invite to return token and expires_at

  ## Summary
  Replaces the cv_create_invite function to return a JSON object containing
  both the plaintext token and the server-computed expires_at timestamp,
  instead of just the token string.

  This allows the frontend to display the accurate expiry time as set by
  the database, rather than guessing based on a hardcoded client-side offset.

  ## Changes
  - cv_create_invite: return type changed from text to jsonb
    - Returns: { "token": "<hex>", "expires_at": "<ISO timestamp>" }

  ## Notes
  - All callers (lib/cv.ts, TeamSettings.tsx) must be updated to read .token
    and .expires_at from the returned object
*/

DROP FUNCTION IF EXISTS public.cv_create_invite(uuid, text);

CREATE FUNCTION public.cv_create_invite(p_team uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
