-- Targeted security fixes for remaining scanner warnings
-- Three genuine issues; all other warnings are intentional by design.

-- Fix 1: v_auth_email_hook_status — SECURITY DEFINER view (Error)
-- The view contains only hardcoded setup-instruction strings (no real data).
-- Recreate with security_invoker = true and restrict to service_role only.
DROP VIEW IF EXISTS public.v_auth_email_hook_status;
CREATE VIEW public.v_auth_email_hook_status
  WITH (security_invoker = true)
AS
  SELECT
    'auth-hook-send-email'::text AS hook_name,
    'https://<project>.supabase.co/functions/v1/auth-hook-send-email'::text AS target_uri,
    'Register in: Supabase Dashboard → Authentication → Hooks → Send email hook'::text AS setup_note,
    now() AS checked_at;

-- Restrict view access: only service_role needs this diagnostic view
REVOKE ALL ON public.v_auth_email_hook_status FROM anon, authenticated;
GRANT SELECT ON public.v_auth_email_hook_status TO service_role;

-- Fix 2: rate_limit_log_cleanup_trigger() — trigger function callable via RPC
-- Trigger functions should only be invoked by the database engine, never via /rpc/.
REVOKE EXECUTE ON FUNCTION public.rate_limit_log_cleanup_trigger() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_log_cleanup_trigger() TO service_role;

-- Fix 3: cv_create_guest_token — anon should not be able to create guest tokens
-- Only authenticated team owners may generate guest observation links.
REVOKE EXECUTE ON FUNCTION public.cv_create_guest_token(uuid, text, text, text, text) FROM anon;
