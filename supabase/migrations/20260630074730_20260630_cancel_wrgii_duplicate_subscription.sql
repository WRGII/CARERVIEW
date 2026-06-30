-- Cancel the manual recovery subscription for wrgii; the real Stripe subscription
-- (sub_1Tnu6YGiCMwtCdgyTax85e7h) supersedes it. Kept as 'canceled' for audit trail.
UPDATE public.user_subscriptions
SET
  status = 'canceled',
  updated_at = now()
WHERE
  user_id = '11de42b7-1f24-4c86-b22a-6b095f812414'
  AND subscription_id = 'sub_manual_recovery_20260630';
