-- Update Stripe price IDs to match June 2026 repricing
-- Primary Caregiver: same priceId (price_1SZ0JMGiCMwtCdgydBnTnX4a), price raised to $25.50
-- Family Circle: new priceId (price_1ThwvbGiCMwtCdgyyRZr2FME), price raised to $45.50

UPDATE public.subscription_plans
SET stripe_price_id = 'price_1ThwvbGiCMwtCdgyyRZr2FME'
WHERE id = 'family_qtr';
