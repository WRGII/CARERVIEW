/*
  # Stripe customer_id format constraint and placeholder cleanup

  ## Summary
  Adds a CHECK constraint to stripe_customers.customer_id ensuring only valid
  Stripe customer IDs (format: cus_[alphanumeric]) can be stored, preventing
  placeholder or test values from persisting in production.

  Also removes any existing rows with invalid/placeholder customer_id values
  that do not match the Stripe ID pattern, so the constraint can be applied
  cleanly.

  ## Changes
  1. Deletes any stripe_customers rows where customer_id does not match the
     Stripe ID pattern (cus_ prefix followed by alphanumeric/underscore chars).
  2. Adds a CHECK constraint on stripe_customers.customer_id enforcing the
     valid format going forward.

  ## Safety
  - Uses IF NOT EXISTS / conditional logic to be idempotent
  - Only removes rows that already contain invalid placeholder values
  - No valid production Stripe customer data is affected
*/

DELETE FROM stripe_customers
WHERE customer_id IS NULL
   OR customer_id = ''
   OR customer_id NOT SIMILAR TO 'cus_[A-Za-z0-9_]+';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'stripe_customers_customer_id_format'
      AND conrelid = 'stripe_customers'::regclass
  ) THEN
    ALTER TABLE stripe_customers
      ADD CONSTRAINT stripe_customers_customer_id_format
      CHECK (customer_id ~ '^cus_[A-Za-z0-9_]+$');
  END IF;
END $$;
