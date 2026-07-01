-- RC1-02A addendum: Also revoke EXECUTE from authenticated on these functions.
-- They are only called by stripe-webhook using service_role; no end-user should invoke them directly.
REVOKE EXECUTE ON FUNCTION public.record_webhook_event(text, text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) FROM authenticated;
