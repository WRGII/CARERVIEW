/*
  # Create check_rate_limit RPC Function

  ## Summary
  Creates the `check_rate_limit` PostgreSQL function that all edge functions call
  to enforce per-identifier, per-endpoint rate limits. The `rate_limit_log` table
  already exists; this migration adds the missing function body.

  ## Function: check_rate_limit(p_identifier, p_endpoint, p_max_requests, p_window_minutes)
  - Looks up or creates a sliding-window bucket in rate_limit_log
  - Returns a JSON object: { allowed, remaining, limit, reset_at }
  - Uses a fixed-window strategy aligned to p_window_minutes boundaries
  - Runs as SECURITY DEFINER so edge functions (service_role client) can call it

  ## Security
  - SECURITY DEFINER with explicit search_path
  - Only called via service_role in edge functions
  - No user-facing access
*/

DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);

CREATE FUNCTION public.check_rate_limit(
  p_identifier    text,
  p_endpoint      text,
  p_max_requests  integer,
  p_window_minutes integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window_start  timestamptz;
  v_window_end    timestamptz;
  v_current_count integer;
  v_allowed       boolean;
  v_remaining     integer;
  v_row           record;
BEGIN
  v_window_start := date_trunc('minute', now()) -
    (EXTRACT(MINUTE FROM now())::integer % p_window_minutes) * interval '1 minute';
  v_window_end := v_window_start + (p_window_minutes * interval '1 minute');

  SELECT * INTO v_row
  FROM public.rate_limit_log
  WHERE identifier   = p_identifier
    AND endpoint     = p_endpoint
    AND window_start = v_window_start
  FOR UPDATE SKIP LOCKED;

  IF v_row.id IS NULL THEN
    DELETE FROM public.rate_limit_log
    WHERE identifier = p_identifier
      AND endpoint   = p_endpoint
      AND window_end < now() - (p_window_minutes * 2 * interval '1 minute');

    INSERT INTO public.rate_limit_log
      (identifier, endpoint, request_count, window_start, window_end)
    VALUES
      (p_identifier, p_endpoint, 1, v_window_start, v_window_end)
    ON CONFLICT DO NOTHING;

    v_current_count := 1;
  ELSE
    UPDATE public.rate_limit_log
    SET request_count = request_count + 1,
        updated_at    = now()
    WHERE id = v_row.id;

    v_current_count := v_row.request_count + 1;
  END IF;

  v_allowed   := v_current_count <= p_max_requests;
  v_remaining := GREATEST(p_max_requests - v_current_count, 0);

  RETURN jsonb_build_object(
    'allowed',    v_allowed,
    'remaining',  v_remaining,
    'limit',      p_max_requests,
    'reset_at',   v_window_end
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;
