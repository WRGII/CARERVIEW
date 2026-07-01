-- RC1-02A: Revoke EXECUTE from anon/public on sensitive SECURITY DEFINER functions
-- These functions have no internal auth checks and must only be callable by service_role.

-- record_webhook_event: inserts into webhook_events, called only by stripe-webhook (service_role)
REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_webhook_event(text, text, text) TO service_role;

-- cv_apply_plan_to_owner_teams: modifies cv_team/cv_team_members, called only by stripe-webhook (service_role)
REVOKE EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) TO service_role;
