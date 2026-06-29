-- Align subscription_plans with June 2026 repricing and stripe-config.ts
-- Primary Caregiver: price_1SZ0JMGiCMwtCdgydBnTnX4a, $25.50/qtr
-- Family Circle:     price_1ThwvbGiCMwtCdgyyRZr2FME, $45.50/qtr

UPDATE public.subscription_plans
SET
  stripe_price_id = 'price_1SZ0JMGiCMwtCdgydBnTnX4a',
  price_cents     = 2550
WHERE id = 'primary_qtr';

UPDATE public.subscription_plans
SET
  stripe_price_id = 'price_1ThwvbGiCMwtCdgyyRZr2FME',
  price_cents     = 4550
WHERE id = 'family_qtr';
