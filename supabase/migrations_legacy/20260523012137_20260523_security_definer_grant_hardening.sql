/*
  # Security Definer Function Grant Hardening

  ## Summary
  Revokes unintended EXECUTE grants on SECURITY DEFINER functions for the anon role.
  All authenticated-only functions are already correctly configured from prior migrations.

  ## Changes

  ### Revoke anon access where it was never intended

  1. cv_sync_resident_to_memory_book_identity
     - Was: anon + authenticated
     - Now: authenticated only
     - Reason: Syncs resident profile fields into memory_book_identity. Requires
       authentication and team membership. Anon users have no resident profile to sync.

  ## Intentionally retained anon grants (documented here for clarity)

  - cv_email_registered(text)
      Anon access is INTENTIONAL. The invite-setup page (/join-setup) is shown to
      unauthenticated invitees before they create an account or sign in. The function
      returns only a boolean (does the email exist?) — no PII is returned.

  - cv_peek_invite(text)
      Anon access is INTENTIONAL. The same pre-login invite-setup page calls this to
      validate the invite token and pre-fill the invited email address before the user
      authenticates. The token hash is never returned.

  - get_community_public_stats()
      Anon access is INTENTIONAL. The public community hub landing page displays
      aggregate member and post counts as a social-proof element. No user data is
      returned — only scalar counts.
*/

-- Revoke anon from cv_sync_resident_to_memory_book_identity
-- (was inadvertently granted to anon via GRANT ... TO authenticated which on older
--  Supabase project configurations inherits from PUBLIC; this revoke is explicit)
REVOKE EXECUTE ON FUNCTION public.cv_sync_resident_to_memory_book_identity(uuid) FROM anon;

-- Verify authenticated still has it (re-grant to be safe — idempotent)
GRANT EXECUTE ON FUNCTION public.cv_sync_resident_to_memory_book_identity(uuid) TO authenticated;

-- Explicit belt-and-suspenders revoke of anon from all authenticated-only helpers
-- (most already correctly have anon=false, but explicit is better than implicit)
REVOKE EXECUTE ON FUNCTION public.cv_accept_invite(text)                                                          FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_check_team_seats(uuid)                                                       FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_create_invite(uuid, text)                                                    FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text)     FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_get_active_team()                                                            FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_get_remaining(uuid)                                                          FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_get_team_patient(uuid)                                                       FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_list_invites(uuid)                                                           FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_list_members(uuid)                                                           FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid)                                              FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid)                                                    FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_revoke_invite(uuid)                                                          FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_set_active_team(uuid)                                                        FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_active_team_ids()                                                           FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_own_profile_immutable_fields()                                              FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_team_ids()                                                             FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin()                                                                      FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_community_admin()                                                            FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid)                                                            FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_team_owner(uuid)                                                             FROM anon;
REVOKE EXECUTE ON FUNCTION public.mb_get_or_create(uuid)                                                         FROM anon;
