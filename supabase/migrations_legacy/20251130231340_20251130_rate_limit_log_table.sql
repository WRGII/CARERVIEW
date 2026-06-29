/*
  # Rate Limit Logging Table

  1. New Tables
    - `rate_limit_log`
      - `id` (uuid, primary key)
      - `identifier` (text) - IP address or user identifier
      - `endpoint` (text) - API endpoint being rate limited
      - `request_count` (integer) - Number of requests in window
      - `window_start` (timestamptz) - Start of rate limit window
      - `window_end` (timestamptz) - End of rate limit window
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Purpose
    - Track rate limit usage per identifier/endpoint
    - Support check_rate_limit function
    - Prevent abuse of Edge Functions
    - Audit trail for security monitoring

  3. Security
    - Enable RLS
    - Only service_role can access
    - No user-facing policies (security audit data)

  4. Cleanup
    - Recommend scheduled job to delete records older than 7 days
*/

-- Create rate limit log table
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS (service_role only)
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Create composite index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_identifier_endpoint_window 
ON public.rate_limit_log(identifier, endpoint, window_end DESC);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_window_end 
ON public.rate_limit_log(window_end);

-- Grant access to service_role
GRANT ALL ON public.rate_limit_log TO service_role;
