/*
  # Fix user_subscriptions INSERT policy for free plan activation

  ## Problem
  The free plan activation in useFreePlan.ts calls supabase.from('user_subscriptions').insert(...)
  using the authenticated user's session. However, the only INSERT policy on user_subscriptions
  is restricted to service_role, causing an RLS violation for authenticated users trying to
  activate the free plan.

  ## Changes
  1. Add an INSERT policy allowing authenticated users to insert their own subscription row,
     but only for the 'free' plan (paid plans are always written by the webhook via service_role).

  ## Security
  - Users can only insert rows where user_id matches their own auth.uid()
  - Restricted to plan_id = 'free' so users cannot self-grant paid plan access
  - Paid subscriptions continue to be written exclusively by the webhook (service_role)
*/

DROP POLICY IF EXISTS "Users can activate free plan" ON public.user_subscriptions;

CREATE POLICY "Users can activate free plan"
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND plan_id = 'free'
  );
