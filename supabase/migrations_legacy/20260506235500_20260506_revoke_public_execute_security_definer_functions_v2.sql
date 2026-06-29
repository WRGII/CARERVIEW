/*
  # Revoke PUBLIC/ANON EXECUTE on SECURITY DEFINER Functions

  ## Summary
  All flagged functions are legitimately SECURITY DEFINER — they access tables
  that callers cannot reach directly (cv_plan_limits, cv_team_invites, auth.users,
  profiles cross-user, etc.) or are used inside RLS policies to prevent infinite
  recursion. Changing them to SECURITY INVOKER would break those access patterns.

  The correct fix is to revoke the default PUBLIC EXECUTE grant and re-grant
  EXECUTE only to the roles that legitimately need each function:

  - anon: cv_peek_invite, get_community_public_stats (intentionally public)
  - authenticated: all cv_* action functions + helper predicates
  - Internal-only helpers (used only in RLS policies / other functions):
    get_active_team_ids, get_user_team_ids, is_admin, is_community_admin,
    is_team_member, is_team_owner, get_own_profile_immutable_fields
    — these should NOT be callable via /rest/v1/rpc by end users.
    Grant only to authenticated (they are called transparently by the DB engine
    via RLS, not directly by the client).

  ## Changes
  - REVOKE EXECUTE FROM PUBLIC on all 24 functions
  - Re-grant EXECUTE to appropriate roles only
*/

-- ── Revoke PUBLIC execute on all flagged functions ────────────────────────────

REVOKE EXECUTE ON FUNCTION public.cv_peek_invite(text)                                                                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_community_public_stats()                                                                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_accept_invite(text)                                                                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_check_team_seats(uuid)                                                                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_create_invite(uuid, text)                                                                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_get_active_team()                                                                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_get_remaining(uuid)                                                                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_get_team_patient(uuid)                                                                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_list_invites(uuid)                                                                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_list_members(uuid)                                                                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid)                                                             FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid)                                                                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_revoke_invite(uuid)                                                                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_set_active_team(uuid)                                                                       FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_active_team_ids()                                                                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_own_profile_immutable_fields()                                                             FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_team_ids()                                                                            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin()                                                                                     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_community_admin()                                                                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid)                                                                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_team_owner(uuid)                                                                            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mb_get_or_create(uuid)                                                                         FROM PUBLIC;

-- cv_create_team_with_patient signature includes the enum type
DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) FROM PUBLIC';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- ── Re-grant to anon: intentionally public-facing functions ───────────────────

-- cv_peek_invite: anon needs this to validate an invite token on the /join page
-- before the user is authenticated.
GRANT EXECUTE ON FUNCTION public.cv_peek_invite(text) TO anon;

-- get_community_public_stats: anon needs this for the public community hub page.
GRANT EXECUTE ON FUNCTION public.get_community_public_stats() TO anon;

-- ── Re-grant to authenticated: client-callable action functions ───────────────

-- Invite/team join flow
GRANT EXECUTE ON FUNCTION public.cv_accept_invite(text)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_peek_invite(text)               TO authenticated;

-- Team management (owner actions)
GRANT EXECUTE ON FUNCTION public.cv_create_invite(uuid, text)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_revoke_invite(uuid)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_invites(uuid)              TO authenticated;

-- Team data reads (member-gated)
GRANT EXECUTE ON FUNCTION public.cv_list_members(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_team_patient(uuid)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_remaining(uuid)             TO authenticated;

-- Active team management
GRANT EXECUTE ON FUNCTION public.cv_get_active_team()               TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_set_active_team(uuid)           TO authenticated;

-- Team + patient bootstrap (onboarding)
DO $$
BEGIN
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) TO authenticated';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Memory book bootstrap
GRANT EXECUTE ON FUNCTION public.mb_get_or_create(uuid)             TO authenticated;

-- Community stats (authenticated users can also call this)
GRANT EXECUTE ON FUNCTION public.get_community_public_stats()       TO authenticated;

-- Profile immutable fields (used by client auth checks)
GRANT EXECUTE ON FUNCTION public.get_own_profile_immutable_fields() TO authenticated;

-- ── RLS-policy helper functions ───────────────────────────────────────────────
-- These are called transparently by the DB engine via RLS policies, not by the
-- client directly. Granting to authenticated lets the engine invoke them on the
-- caller's behalf. They should NOT be called directly via /rest/v1/rpc.

GRANT EXECUTE ON FUNCTION public.get_active_team_ids()   TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_team_ids()     TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin()              TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_community_admin()    TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_owner(uuid)     TO authenticated;

-- cv_check_team_seats is an internal helper only — called by cv_create_invite
-- and cv_accept_invite. Do not expose to the client.
-- (No grant needed; the SECURITY DEFINER callers run as postgres/owner.)
