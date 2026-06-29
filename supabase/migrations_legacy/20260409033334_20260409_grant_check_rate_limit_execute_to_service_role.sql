/*
  # Grant EXECUTE on check_rate_limit to service_role

  ## Problem
  The check_rate_limit function has no EXECUTE grants assigned to any role.
  When the admin-bootstrap edge function calls srv.rpc('check_rate_limit', ...)
  using the service role key, Postgres denies the call with a permission error,
  causing the edge function to throw an exception and return a 500 error.

  ## Fix
  Grant EXECUTE permission on the function to service_role so the edge function
  can successfully perform rate-limit checks during admin login.
*/

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;
