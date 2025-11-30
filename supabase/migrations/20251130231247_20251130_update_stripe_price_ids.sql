/*
  # Update Stripe Price IDs to Match Frontend Configuration

  1. Changes
    - Update Primary Caregiver plan stripe_price_id from price_1SCMJYGiqZeZmBYJo31EKRFG to price_1SZ0JMGiCMwtCdgydBnTnX4a
    - Update Family Circle plan stripe_price_id from price_1SCMJVGiqZeZmBYJkoSNcopS to price_1SZ0MsGiCMwtCdgyT6uihjXf
  
  2. Rationale
    - Frontend code (stripe-config.ts) has the correct price IDs from CarerView Stripe Account
    - Database had outdated price IDs causing checkout validation failures
    - This migration aligns database with actual Stripe product configuration
  
  3. Impact
    - Existing subscriptions unaffected (webhooks use price_id from Stripe events)
    - New checkouts will now validate correctly
    - Plan enforcement will work properly
*/

-- Update Primary Caregiver plan price ID
UPDATE public.subscription_plans
SET stripe_price_id = 'price_1SZ0JMGiCMwtCdgydBnTnX4a'
WHERE id = 'primary_qtr';

-- Update Family Circle plan price ID
UPDATE public.subscription_plans
SET stripe_price_id = 'price_1SZ0MsGiCMwtCdgyT6uihjXf'
WHERE id = 'family_qtr';
