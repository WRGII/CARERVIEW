/*
  # Seed Subscription Plans and Team Limits

  1. Seed Data
    - Insert Family Circle quarterly plan (family_qtr)
      - 3 seats, 100 observations/year, $25.50/quarter
      - Stripe price: price_1SCMJVGiqZeZmBYJkoSNcopS

    - Insert Primary Caregiver quarterly plan (primary_qtr)
      - Solo (no team), 30 observations/year, $12.50/quarter
      - Stripe price: price_1SCMJYGiqZeZmBYJo31EKRFG

    - Insert Free plan if not exists
      - Solo (no team), 3 observations/year

    - Populate cv_plan_limits for family_qtr only
      - Primary Caregiver does not use teams

  2. Notes
    - Uses ON CONFLICT to make migration idempotent
    - Primary Caregiver (primary_qtr) intentionally has NULL seats_limit (not team-based)
    - Only family_qtr gets cv_plan_limits entry
*/

-- Insert subscription plans
INSERT INTO public.subscription_plans (
  id,
  name,
  interval,
  price_cents,
  currency,
  obs_limit,
  usage_window,
  stripe_price_id,
  observations_quota_year,
  seats_limit
) VALUES
  (
    'family_qtr',
    'Family Circle',
    'quarter',
    2550,
    'USD',
    NULL,
    'year',
    'price_1SCMJVGiqZeZmBYJkoSNcopS',
    100,
    3
  ),
  (
    'primary_qtr',
    'Primary Caregiver',
    'quarter',
    1250,
    'USD',
    NULL,
    'year',
    'price_1SCMJYGiqZeZmBYJo31EKRFG',
    30,
    NULL
  ),
  (
    'free',
    'Free',
    'none',
    0,
    'USD',
    3,
    'year',
    NULL,
    3,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  interval = EXCLUDED.interval,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  obs_limit = EXCLUDED.obs_limit,
  usage_window = EXCLUDED.usage_window,
  stripe_price_id = EXCLUDED.stripe_price_id,
  observations_quota_year = EXCLUDED.observations_quota_year,
  seats_limit = EXCLUDED.seats_limit;

-- Insert cv_plan_limits for family_qtr only
INSERT INTO public.cv_plan_limits (
  plan_id,
  seats,
  team_quota_year
) VALUES
  (
    'family_qtr',
    3,
    100
  )
ON CONFLICT (plan_id) DO UPDATE SET
  seats = EXCLUDED.seats,
  team_quota_year = EXCLUDED.team_quota_year;
