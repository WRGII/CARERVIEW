/*
  Phase 4.1 Security Remediation — Part 2
  
  The initial REVOKE from anon/authenticated was masked by default
  PUBLIC grant. PostgreSQL grants EXECUTE to PUBLIC by default on
  all functions. We must revoke from PUBLIC first, then re-grant
  only to service_role.
*/

-- Revoke default PUBLIC execute privilege
REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_webhook_event(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_log() FROM PUBLIC;

-- Re-grant only to service_role
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_webhook_event(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_log() TO service_role;
