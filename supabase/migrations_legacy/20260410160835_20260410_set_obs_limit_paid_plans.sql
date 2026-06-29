/*
  # Set obs_limit for paid subscription plans

  ## Summary
  The `primary_qtr` and `family_qtr` subscription plans had NULL obs_limit values.
  The `enforce_team_observation_quota` trigger falls back to the free plan limit (3)
  when the paid plan lookup fails, but the fallback only applies when obs_limit IS NULL
  after the join. With NULL limits, paid users are unintentionally capped at 3 observations.

  ## Changes

  ### subscription_plans
  - `primary_qtr`: obs_limit set to 100 (generous annual allowance for solo caregivers)
  - `family_qtr`: obs_limit set to 200 (higher allowance for multi-member family teams)

  ## Notes
  1. These values are per-team, per-usage_window (year)
  2. Free plan remains at obs_limit = 3 (unchanged)
  3. The quota trigger reads the plan linked to the team owner's active subscription
*/

UPDATE public.subscription_plans
SET obs_limit = 100
WHERE id = 'primary_qtr' AND (obs_limit IS NULL OR obs_limit = 0);

UPDATE public.subscription_plans
SET obs_limit = 200
WHERE id = 'family_qtr' AND (obs_limit IS NULL OR obs_limit = 0);
