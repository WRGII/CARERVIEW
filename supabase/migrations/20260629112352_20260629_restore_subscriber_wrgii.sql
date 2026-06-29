
-- Restore public-schema records for subscriber wrgii@yahoo.com
-- auth.users row inserted separately via execute_sql (required first due to FK)

INSERT INTO public.profiles (id, email, display_name, role, disabled, preferred_locale)
VALUES (
  '97197d82-ebcc-4e64-b9de-cd28ee015886',
  'wrgii@yahoo.com', 'William Griffith', 'caregiver', false, 'en'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stripe_customers (user_id, customer_id, created_at, updated_at)
VALUES (
  '97197d82-ebcc-4e64-b9de-cd28ee015886',
  'cus_UJ8iT93BlYfOCF',
  '2026-04-10 16:14:00+00', now()
)
ON CONFLICT (user_id) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  updated_at  = now();

-- user_subscriptions PK is (user_id, subscription_id)
INSERT INTO public.user_subscriptions (
  user_id, subscription_id, plan_id, status, price_id,
  current_period_start, current_period_end, cancel_at_period_end, updated_at
)
VALUES (
  '97197d82-ebcc-4e64-b9de-cd28ee015886',
  'sub_1TKWSOGiCMwtCdgyCVjNQNQZ',
  'family_qtr', 'active', 'price_1ThwvbGiCMwtCdgyyRZr2FME',
  '2026-04-10 16:14:00+00', '2026-07-10 16:14:00+00', false, now()
)
ON CONFLICT (user_id, subscription_id) DO UPDATE SET
  plan_id              = EXCLUDED.plan_id,
  status               = EXCLUDED.status,
  price_id             = EXCLUDED.price_id,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end   = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at           = now();
