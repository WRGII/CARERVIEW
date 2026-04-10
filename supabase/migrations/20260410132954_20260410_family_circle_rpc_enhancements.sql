/*
  # Family Circle RPC Enhancements

  ## Summary
  Adds new database functions to support a fully-featured Family Circle
  management page. The existing `cv_list_members` only returns raw user_id values
  with no profile info, making it impossible to display member names/emails.
  Similarly, owners had no way to view pending invitations or remove members.

  ## New Functions

  ### 1. cv_list_members_with_profile(p_team uuid)
  - Returns all team members with their display_name and email from profiles
  - Columns: user_id, role, state, joined_at, display_name, email
  - Ordered: owner first, then by join date
  - Access: any member of the team

  ### 2. cv_list_invites(p_team uuid)
  - Returns all invitations for the team (excluding the secret token_hash)
  - Columns: id, email, created_at, expires_at, consumed_at
  - Only accessible to team members

  ### 3. cv_remove_member(p_team, p_user)
  - Allows team owner to remove a non-owner member
  - Clears active_team_id on the removed member's profile

  ### 4. cv_get_team_patient(p_team uuid)
  - Returns the patient record for a team
  - Used on the management page to display who the circle is for

  ## Security
  - All functions use SECURITY DEFINER with explicit membership/ownership checks
  - Token hashes are never exposed
*/

-- Function: cv_list_members_with_profile
CREATE OR REPLACE FUNCTION public.cv_list_members_with_profile(p_team uuid)
RETURNS TABLE(
  user_id      uuid,
  role         public.cv_member_role,
  state        public.cv_member_state,
  joined_at    timestamptz,
  display_name text,
  email        text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    m.user_id,
    m.role,
    m.state,
    m.joined_at,
    COALESCE(p.display_name, p.email, 'Unknown') AS display_name,
    COALESCE(p.email, '') AS email
  FROM public.cv_team_members m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.team_id = p_team
  ORDER BY
    CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END,
    m.joined_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid) TO authenticated;


-- Function: cv_list_invites
CREATE OR REPLACE FUNCTION public.cv_list_invites(p_team uuid)
RETURNS TABLE(
  id           uuid,
  email        text,
  created_at   timestamptz,
  expires_at   timestamptz,
  consumed_at  timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.email,
    i.created_at,
    i.expires_at,
    i.consumed_at
  FROM public.cv_team_invites i
  WHERE i.team_id = p_team
  ORDER BY i.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_list_invites(uuid) TO authenticated;


-- Function: cv_remove_member
CREATE OR REPLACE FUNCTION public.cv_remove_member(p_team uuid, p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_caller      uuid;
  v_target_role public.cv_member_role;
BEGIN
  v_caller := auth.uid();

  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team
    WHERE id = p_team
      AND owner_user_id = v_caller
  ) THEN
    RAISE EXCEPTION 'Only the team owner can remove members';
  END IF;

  IF p_user = v_caller THEN
    RAISE EXCEPTION 'Owner cannot remove themselves';
  END IF;

  SELECT role INTO v_target_role
  FROM public.cv_team_members
  WHERE team_id = p_team AND user_id = p_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User is not a member of this team';
  END IF;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove another owner';
  END IF;

  DELETE FROM public.cv_team_members
  WHERE team_id = p_team AND user_id = p_user;

  UPDATE public.profiles
  SET active_team_id = NULL
  WHERE id = p_user AND active_team_id = p_team;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid) TO authenticated;


-- Function: cv_get_team_patient
CREATE OR REPLACE FUNCTION public.cv_get_team_patient(p_team uuid)
RETURNS TABLE(
  full_name text,
  gender    text,
  notes     text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    tp.full_name,
    tp.gender::text,
    tp.notes
  FROM public.cv_team_patient tp
  WHERE tp.team_id = p_team;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_get_team_patient(uuid) TO authenticated;
