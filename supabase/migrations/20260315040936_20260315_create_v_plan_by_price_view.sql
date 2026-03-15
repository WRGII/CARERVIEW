/*
  # Create v_plan_by_price View

  ## Summary
  The `usePlans` hook and `usePrefetchStatic` hook both query
  `.from('v_plan_by_price')` which did not exist, causing a query
  error on every page load.

  ## New View: v_plan_by_price
  A simple ordered view of subscription_plans exposing the columns
  expected by the frontend:
    - plan_id, name, interval, price_cents, stripe_price_id

  ## Security
  - View inherits RLS from the underlying subscription_plans table
  - subscription_plans already has a public SELECT policy
*/

CREATE OR REPLACE VIEW public.v_plan_by_price AS
SELECT
  id            AS plan_id,
  name,
  interval,
  price_cents,
  stripe_price_id
FROM public.subscription_plans
ORDER BY price_cents ASC;

GRANT SELECT ON public.v_plan_by_price TO anon, authenticated;
