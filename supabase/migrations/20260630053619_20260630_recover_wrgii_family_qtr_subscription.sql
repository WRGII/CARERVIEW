-- Manually recover family_qtr subscription for wrgii@icloud.com
-- Payment went through (stripe_customers updated 2026-06-30 05:19) but
-- webhook was never processed so no paid subscription row was written.
-- This row will be superseded by the real Stripe sub when the webhook
-- is re-delivered; the upsert key is (user_id, subscription_id).
INSERT INTO public.user_subscriptions (
  user_id,
  subscription_id,
  plan_id,
  status,
  price_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  updated_at
)
VALUES (
  '11de42b7-1f24-4c86-b22a-6b095f812414',
  'sub_manual_recovery_20260630',
  'family_qtr',
  'active',
  'price_1ThwvbGiCMwtCdgyyRZr2FME',
  '2026-06-30 05:19:00+00',
  '2026-09-28 05:19:00+00',
  false,
  now()
)
ON CONFLICT (user_id, subscription_id) DO UPDATE SET
  plan_id              = EXCLUDED.plan_id,
  status               = EXCLUDED.status,
  price_id             = EXCLUDED.price_id,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end   = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at           = now();
