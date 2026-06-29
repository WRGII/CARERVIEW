/*
  # Revoke unnecessary public EXECUTE grants on SECURITY DEFINER functions

  ## Summary
  All SECURITY DEFINER functions in the public schema were inadvertently
  granting EXECUTE to the `anon` role (unauthenticated visitors) and, in
  some cases, should not be callable by `authenticated` users directly via
  /rest/v1/rpc/ either. This migration revokes those excess grants without
  changing any function logic.

  ## Groups addressed

  ### Group A — Trigger functions (no role should call these via RPC)
  Revoke EXECUTE from both anon and authenticated:
    community_on_post_insert, community_on_post_update,
    community_on_reaction_delete, community_on_reaction_insert,
    community_on_reply_insert, create_community_profile_for_new_user,
    cv_team_patient_set_updated_at, decrement_community_reply_count,
    enforce_team_observation_quota, sync_admin_role_to_profile

  ### Group B — Internal maintenance / webhook functions (service_role only)
  Revoke EXECUTE from both anon and authenticated:
    check_rate_limit, cleanup_old_rate_limits, cleanup_old_webhook_events,
    record_webhook_event (both overloads), webhook_event_exists,
    reconcile_community_counters

  ### Group C — Admin/Edge Function helpers (service_role only)
  Revoke EXECUTE from both anon and authenticated:
    cv_apply_plan_to_owner_teams, is_admin(uuid)
  Revoke EXECUTE from anon only:
    get_own_profile_immutable_fields

  ### Group D — Authenticated-user RPCs (keep authenticated, revoke anon only)
  Revoke EXECUTE from anon only:
    cv_accept_invite, cv_check_team_seats, cv_create_invite,
    cv_create_team_with_patient, cv_get_active_team, cv_get_remaining,
    cv_get_team_patient, cv_list_invites, cv_list_members,
    cv_list_members_with_profile, cv_remove_member, cv_revoke_invite,
    cv_set_active_team, get_active_team_ids, get_user_team_ids,
    is_admin(), is_community_admin, is_team_member, is_team_owner,
    mb_get_or_create

  ### Intentionally unchanged (correct as-is)
  cv_peek_invite        — needs anon (invite preview before login)
  get_community_public_stats — needs anon (public marketing stats widget)
*/

-- ============================================================
-- GROUP A: Trigger functions — revoke anon + authenticated
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.community_on_post_insert()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.community_on_post_update()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.community_on_reaction_delete()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.community_on_reaction_insert()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.community_on_reply_insert()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.create_community_profile_for_new_user()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.cv_team_patient_set_updated_at()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.decrement_community_reply_count()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.enforce_team_observation_quota()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_admin_role_to_profile()
  FROM anon, authenticated;

-- ============================================================
-- GROUP B: Internal maintenance / webhook — revoke anon + authenticated
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer)
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_webhook_events()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, jsonb, text, text)
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, text)
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.webhook_event_exists(text)
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.reconcile_community_counters()
  FROM anon, authenticated;

-- ============================================================
-- GROUP C: Admin / Edge Function helpers
-- ============================================================

-- Called only by Stripe webhook Edge Function (service_role)
REVOKE EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text)
  FROM anon, authenticated;

-- The parameterised overload is an admin lookup used only in Edge Functions
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid)
  FROM anon, authenticated;

-- Anon has no authenticated session to look up, safe to keep for authenticated
REVOKE EXECUTE ON FUNCTION public.get_own_profile_immutable_fields()
  FROM anon;

-- ============================================================
-- GROUP D: Authenticated-user RPCs — revoke anon only
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.cv_accept_invite(text)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_check_team_seats(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_create_invite(uuid, text)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_get_active_team()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_get_remaining(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_get_team_patient(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_list_invites(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_list_members(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_revoke_invite(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.cv_set_active_team(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.get_active_team_ids()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.get_user_team_ids()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_admin()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_community_admin()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_team_owner(uuid)
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.mb_get_or_create(uuid)
  FROM anon;
