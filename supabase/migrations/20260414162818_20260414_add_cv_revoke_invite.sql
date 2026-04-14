/*
  # Add cv_revoke_invite function

  ## Summary
  Allows a team owner to delete a pending (unconsumed) invite for their team.

  ## New Functions
  - `cv_revoke_invite(p_invite_id uuid)` — deletes a pending invite row owned by
    the caller's team. Raises an error if the invite has already been consumed or
    if the caller is not the team owner.

  ## Security
  - SECURITY DEFINER so it can bypass RLS on cv_team_invites
  - Validates ownership via cv_team.owner_user_id
  - Refuses to revoke already-consumed invites
  - Restricted to authenticated role

  ## Notes
  - Hard deletes the row; consumed (accepted) invites are intentionally kept for audit
*/

CREATE OR REPLACE FUNCTION public.cv_revoke_invite(p_invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_invite  record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT i.id, i.team_id, i.consumed_at
  INTO v_invite
  FROM public.cv_team_invites i
  WHERE i.id = p_invite_id;

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF v_invite.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot revoke an invite that has already been accepted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team
    WHERE id = v_invite.team_id
      AND owner_user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Only the team owner can revoke invites';
  END IF;

  DELETE FROM public.cv_team_invites WHERE id = p_invite_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cv_revoke_invite(uuid) TO authenticated;
