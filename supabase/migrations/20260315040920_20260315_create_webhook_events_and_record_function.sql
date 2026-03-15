/*
  # Create webhook_events Table and record_webhook_event RPC Function

  ## Summary
  The stripe-webhook edge function calls `record_webhook_event` and queries
  `webhook_events` for idempotency. Neither the table nor the function existed,
  meaning every Stripe retry was being reprocessed (no deduplication).

  ## New Table: webhook_events
  - `event_id` (text, primary key) — Stripe event ID (evt_...)
  - `event_type` (text) — e.g. customer.subscription.updated
  - `status` (text) — 'completed' | 'failed'
  - `processed_at` (timestamptz)

  ## New Function: record_webhook_event(p_event_id, p_event_type, p_status)
  - Upserts a row into webhook_events
  - Called by the webhook handler after successfully processing an event
  - SECURITY DEFINER so service_role edge function client can call it

  ## Security
  - RLS enabled, service_role only
  - No user-facing access
*/

CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id     text PRIMARY KEY,
  event_type   text NOT NULL,
  status       text NOT NULL DEFAULT 'completed',
  processed_at timestamptz DEFAULT now()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.webhook_events;
CREATE POLICY "Service role can manage webhook events"
  ON public.webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.webhook_events TO service_role;

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON public.webhook_events(processed_at DESC);

CREATE OR REPLACE FUNCTION public.record_webhook_event(
  p_event_id   text,
  p_event_type text,
  p_status     text DEFAULT 'completed'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.webhook_events (event_id, event_type, status, processed_at)
  VALUES (p_event_id, p_event_type, p_status, now())
  ON CONFLICT (event_id) DO UPDATE
    SET status       = EXCLUDED.status,
        processed_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_webhook_event(text, text, text) TO service_role;
