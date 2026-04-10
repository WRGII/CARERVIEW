/*
  # Fix cv_create_invite mutable search_path security warning

  ## Summary
  Re-creates the cv_create_invite SECURITY DEFINER function with an explicit
  SET search_path = '' to prevent search_path injection attacks.

  ## Problem
  SECURITY DEFINER functions run with elevated privileges. Without a pinned
  search_path, a malicious schema object earlier in the session's search_path
  could potentially intercept calls to unqualified identifiers inside the
  function body.

  ## Changes
  - cv_create_invite: adds SET search_path = '' to lock the search path
  - Function body and signature are unchanged
  - All internal references are already fully schema-qualified (public.*, auth.*)
    so the behaviour is identical after this change

  ## Security
  - Eliminates the Supabase "Function Search Path Mutable" advisory
  - No application code changes required
*/

CREATE OR REPLACE FUNCTION public.cv_create_invite(p_team uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
