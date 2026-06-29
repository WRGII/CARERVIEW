/*
  # Fix RLS Policy for rate_limit_log Table

  1. Problem
    - Table has RLS enabled but no policies
    - Triggers security warning in Supabase dashboard
    - Only service_role should access this table

  2. Changes
    - Add service_role policy for ALL operations
    - Follows same pattern as admin_events table

  3. Security
    - Table contains rate limit audit data
    - Used by check_rate_limit() function in Edge Functions
    - No user-facing access required
    - Only service_role can read/write

  4. Impact
    - Resolves RLS warning
    - No functional changes (service_role already has GRANT ALL)
    - Explicit policy makes intent clear
*/

-- Add service role policy for rate_limit_log
DROP POLICY IF EXISTS "Service role can manage rate limit logs" ON public.rate_limit_log;

CREATE POLICY "Service role can manage rate limit logs"
  ON public.rate_limit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment explaining policy
COMMENT ON POLICY "Service role can manage rate limit logs" ON public.rate_limit_log IS
  'Allows service_role to manage rate limit audit logs. Used by check_rate_limit() function in Edge Functions. Users should never access this table.';
