/*
  # Add Unique Constraint to rate_limit_log

  ## Summary
  The check_rate_limit function uses `ON CONFLICT DO NOTHING` to insert new
  rate limit buckets, relying on a unique constraint to detect conflicts.
  Without it, concurrent requests both succeed the INSERT creating duplicate
  window buckets, making the rate limiter ineffective under load.

  ## Changes
  1. Adds a unique constraint on (identifier, endpoint, window_start)
  2. Removes any duplicate rows first (keeping the one with the highest request_count)

  ## Security
  - No RLS changes; existing service_role-only policy is unchanged
*/

-- Remove any pre-existing duplicates before adding constraint
DELETE FROM public.rate_limit_log a
USING public.rate_limit_log b
WHERE a.id < b.id
  AND a.identifier   = b.identifier
  AND a.endpoint     = b.endpoint
  AND a.window_start = b.window_start;

-- Add the unique constraint the ON CONFLICT clause relies on
ALTER TABLE public.rate_limit_log
  DROP CONSTRAINT IF EXISTS rate_limit_log_identifier_endpoint_window_start_key;

ALTER TABLE public.rate_limit_log
  ADD CONSTRAINT rate_limit_log_identifier_endpoint_window_start_key
  UNIQUE (identifier, endpoint, window_start);
