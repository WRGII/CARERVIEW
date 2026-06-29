/*
  # Fix Missing stripe_customers Rows for Known Affected Users

  ## Summary
  Two users completed account registration and received a `user_subscriptions`
  record (free plan) but never got a corresponding `stripe_customers` row.
  When they attempt to upgrade to a paid plan the `stripe-checkout` edge function
  fails because the auto-create path throws an unhandled error.

  This migration inserts real Stripe Customer IDs for both users using a safe,
  idempotent approach:

  ## Steps Required Before Running
  1. Log in to the Stripe Dashboard
  2. Go to Customers → Create customer
     - For wrgii@yahoo.com  → copy the resulting cus_... ID
     - For ndyukiko@gmail.com → copy the resulting cus_... ID
  3. Replace the two PLACEHOLDER values below with the real cus_... IDs
  4. Apply the migration

  ## Tables Modified
  - `stripe_customers`: INSERT of two rows (one per affected user)

  ## Safety
  - Uses DO $$ ... END $$ so it can be re-run safely (INSERT ... ON CONFLICT DO NOTHING)
  - Looks up user_id by email from auth.users — no hardcoded UUIDs
  - Will silently skip if a row already exists for that user_id (ON CONFLICT user_id)
  - Will log a NOTICE if the email does not match any auth.users row
*/

DO $$
DECLARE
  v_user_id_1 uuid;
  v_user_id_2 uuid;
BEGIN
  -- ---------------------------------------------------------------
  -- REPLACE THESE TWO VALUES with real Stripe cus_... IDs obtained
  -- from the Stripe Dashboard before applying this migration.
  -- ---------------------------------------------------------------
  DECLARE
    cus_id_1 text := 'REPLACE_WITH_CUS_ID_FOR_WRGII';
    cus_id_2 text := 'REPLACE_WITH_CUS_ID_FOR_NDYUKIKO';
  BEGIN
    -- Lookup user UUIDs by email
    SELECT id INTO v_user_id_1
    FROM auth.users
    WHERE email = 'wrgii@yahoo.com'
    LIMIT 1;

    SELECT id INTO v_user_id_2
    FROM auth.users
    WHERE email = 'ndyukiko@gmail.com'
    LIMIT 1;

    IF v_user_id_1 IS NULL THEN
      RAISE NOTICE 'wrgii@yahoo.com not found in auth.users — skipping';
    ELSE
      INSERT INTO public.stripe_customers (user_id, customer_id)
      VALUES (v_user_id_1, cus_id_1)
      ON CONFLICT (user_id) DO NOTHING;
      RAISE NOTICE 'stripe_customers row ensured for wrgii@yahoo.com (user_id: %)', v_user_id_1;
    END IF;

    IF v_user_id_2 IS NULL THEN
      RAISE NOTICE 'ndyukiko@gmail.com not found in auth.users — skipping';
    ELSE
      INSERT INTO public.stripe_customers (user_id, customer_id)
      VALUES (v_user_id_2, cus_id_2)
      ON CONFLICT (user_id) DO NOTHING;
      RAISE NOTICE 'stripe_customers row ensured for ndyukiko@gmail.com (user_id: %)', v_user_id_2;
    END IF;
  END;
END $$;
