/*
  # Add RLS Policies for user_subscriptions Table

  1. Purpose
    - Enable authenticated users to read their own subscription data
    - Allow service role to insert and update subscription records from Stripe webhooks
    - Fix billing panel error caused by missing RLS policies

  2. Security Policies
    - SELECT: Authenticated users can view their own subscriptions
    - INSERT: Service role can create subscription records (for Stripe webhooks)
    - UPDATE: Service role can update subscription status (for Stripe webhooks)
    - DELETE: No delete policy (subscriptions should not be deleted, only updated)

  3. Performance
    - Add indexes for common query patterns
    - Index on user_id for fast user lookups
    - Index on status for filtering active subscriptions
    - Composite index on (user_id, status, current_period_end) for useUserPlan hook

  4. Notes
    - Table already exists with proper structure
    - Foreign keys already configured to profiles(id) and subscription_plans(id)
    - Primary key: (user_id, subscription_id)
*/

-- Enable RLS on user_subscriptions table if not already enabled
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own subscription data
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role to insert subscription records (for Stripe webhooks)
CREATE POLICY "Service role can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update subscription records (for Stripe webhooks)
CREATE POLICY "Service role can update subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create performance indexes
-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON public.user_subscriptions(status);

-- Composite index for the useUserPlan query pattern
-- Query filters by user_id, status IN ('active', 'trialing'), orders by current_period_end and updated_at
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status_period
  ON public.user_subscriptions(user_id, status, current_period_end DESC, updated_at DESC);

-- Add helpful comment to table
COMMENT ON TABLE public.user_subscriptions IS 'Stores user subscription data synchronized from Stripe. Queried by authenticated users to display billing status.';
