/*
  # stripe_customers: Enforce customer_id Format Constraint

  ## Summary
  Adds a CHECK constraint to stripe_customers.customer_id to guarantee that
  only real Stripe customer IDs (prefixed with "cus_") can ever be stored.
  This prevents placeholder strings from prior migrations silently persisting
  and later causing checkout failures.

  ## Changes
  - stripe_customers: new CHECK constraint `chk_customer_id_format`
    - Rejects any value that does not start with "cus_" followed by
      one or more alphanumeric or underscore characters
    - Applies on INSERT and UPDATE

  ## Notes
  - Any existing placeholder rows must be resolved before this migration runs
  - The constraint uses a regex so it catches all non-Stripe-issued values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name   = 'stripe_customers'
      AND constraint_name = 'chk_customer_id_format'
  ) THEN
    ALTER TABLE public.stripe_customers
      ADD CONSTRAINT chk_customer_id_format
      CHECK (customer_id ~ '^cus_[A-Za-z0-9_]+$');
  END IF;
END $$;
