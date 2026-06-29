/*
  Consolidated Schema - Part 3f: Grants and Permissions
*/

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION public.cv_get_active_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_set_active_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_invites(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_remaining(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_team_patient(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_check_team_seats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_create_invite(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_peek_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_accept_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_revoke_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_email_registered(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_solo_remaining() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.mb_get_or_create(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_sync_resident_to_memory_book_identity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_translations_for_locale(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_webhook_event(text, text, text) TO service_role;

-- Guest token functions: anon access for peek and submit (guest users aren't authenticated)
GRANT EXECUTE ON FUNCTION public.cv_create_guest_token(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_peek_guest_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cv_submit_guest_observation(text, text, text, date, text, text, jsonb) TO anon, authenticated;

-- Helper functions (used by RLS policies, already SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_team_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_team_ids() TO authenticated;

-- Grant usage on app schema
GRANT USAGE ON SCHEMA app TO authenticated, service_role;
