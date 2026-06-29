/*
  # Revoke PUBLIC EXECUTE grants on all SECURITY DEFINER functions

  ## Summary
  Previous revoke migrations only revoked from the named roles `anon` and
  `authenticated` but left grants to the `PUBLIC` pseudo-role in place.
  Because `PUBLIC` covers every role (including `anon`), the Supabase security
  scanner still reports these functions as callable by anonymous users.

  This migration revokes the `PUBLIC` grant for every affected function,
  then re-grants EXECUTE to only the specific roles that legitimately need
  to call each function:

  - Trigger functions         → no role (Postgres fires triggers as the owner)
  - Internal/webhook helpers  → service_role only
  - Admin helpers             → service_role only
  - Authenticated-user RPCs   → authenticated only
  - Public RPCs               → anon + authenticated (unchanged)

  ## Functions addressed

  ### Group A — Trigger & internal lifecycle functions
  No role should call these via /rest/v1/rpc. Revoke PUBLIC; do NOT re-grant.

  ### Group B — Internal maintenance / webhook helpers
  Called only from Edge Functions using the service_role key.

  ### Group C — Authenticated-user RPCs
  Legitimate REST RPC calls but only for logged-in users.

  ### Group D — Public RPCs (intentionally kept open)
  cv_peek_invite, get_community_public_stats, get_translations_for_locale
  — these are already correctly granted and are left untouched.
*/

-- ============================================================
-- GROUP A: Trigger & internal lifecycle — revoke PUBLIC, no re-grant
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.community_on_post_insert()         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.community_on_post_update()         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.community_on_reaction_delete()     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.community_on_reaction_insert()     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.community_on_reply_insert()        FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.community_on_reply_update()        FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.community_set_updated_at()         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_community_profile_for_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_team_patient_set_updated_at()   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_community_reply_count()  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_team_observation_quota()   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_care_plan_updated_at()         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at()                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_admin_role_to_profile()       FROM PUBLIC;

-- ============================================================
-- GROUP B: Internal maintenance / webhook — service_role only
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits()                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_webhook_events()                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, jsonb, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, text)         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.webhook_event_exists(text)                     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reconcile_community_counters()                 FROM PUBLIC;

-- Re-grant to service_role (these are called from Edge Functions)
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits()                      TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_webhook_events()                   TO service_role;
GRANT EXECUTE ON FUNCTION public.record_webhook_event(text, text, jsonb, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_webhook_event(text, text, text)         TO service_role;
GRANT EXECUTE ON FUNCTION public.webhook_event_exists(text)                     TO service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_community_counters()                 TO service_role;

-- ============================================================
-- GROUP C: Admin helpers — service_role only
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) FROM PUBLIC;
-- is_admin() no-arg overload: remove PUBLIC, keep authenticated
REVOKE EXECUTE ON FUNCTION public.is_admin()           FROM PUBLIC;
-- is_admin(uuid) parameterised overload: admin Edge Function only
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid)       FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid)       FROM authenticated;

GRANT EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin()            TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid)        TO service_role;

-- ============================================================
-- GROUP D: Authenticated-user RPCs — revoke PUBLIC, keep authenticated
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.cv_accept_invite(text)                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_check_team_seats(uuid)                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_create_invite(uuid, text)                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_get_active_team()                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_get_remaining(uuid)                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_get_team_patient(uuid)                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_list_invites(uuid)                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_list_members(uuid)                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid)             FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid)                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_revoke_invite(uuid)                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cv_set_active_team(uuid)                       FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_active_team_ids()                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_team_ids()                            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_community_admin()                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid)                           FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_team_owner(uuid)                            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mb_get_or_create(uuid)                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_own_profile_immutable_fields()             FROM PUBLIC;

-- Ensure authenticated still has access (some were already granted; idempotent)
GRANT EXECUTE ON FUNCTION public.cv_accept_invite(text)                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_check_team_seats(uuid)                      TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_create_invite(uuid, text)                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_active_team()                           TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_remaining(uuid)                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_team_patient(uuid)                      TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_invites(uuid)                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members(uuid)                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_remove_member(uuid, uuid)                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_revoke_invite(uuid)                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_set_active_team(uuid)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_team_ids()                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_team_ids()                            TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_community_admin()                           TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid)                           TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_owner(uuid)                            TO authenticated;
GRANT EXECUTE ON FUNCTION public.mb_get_or_create(uuid)                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_own_profile_immutable_fields()             TO authenticated;
