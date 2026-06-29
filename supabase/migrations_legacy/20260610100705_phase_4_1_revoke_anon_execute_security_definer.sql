/*
  Phase 4.1 Security Remediation — three launch-blocking fixes
  from Phase 4 Certification Audit.

  1. delete_user_account(uuid, text) — CRITICAL: anon could delete any user
  2. claim_webhook_event(text, text) — HIGH: anon could block webhook processing
  3. cleanup_rate_limit_log()        — HIGH: anon could reset all rate limits

  All three are SECURITY DEFINER and only called by edge functions
  using service_role. No client code calls these directly.
*/

-- Revoke from anon AND authenticated (neither should call these)
REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid, text) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.claim_webhook_event(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_webhook_event(text, text) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_log() FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_log() FROM authenticated;

-- Belt-and-suspenders: ensure service_role retains access
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_webhook_event(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_log() TO service_role;
