/*
  # Add Service Role Policies for stripe_customers

  1. Purpose
    - Allow Edge Functions (stripe-checkout, stripe-portal) to read/write stripe_customers
    - Service role needs INSERT for creating customer mappings
    - Service role needs UPDATE for updating customer metadata
    - Authenticated users already have SELECT via existing policy

  2. Security
    - Service role can insert customer records (for stripe-checkout)
    - Service role can update customer records (for metadata sync)
    - Service role can read all customer records (for stripe-portal lookup)
*/

-- Allow service role to insert customer mappings
DROP POLICY IF EXISTS "Service role can insert stripe customers" ON public.stripe_customers;
CREATE POLICY "Service role can insert stripe customers"
  ON public.stripe_customers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update customer records
DROP POLICY IF EXISTS "Service role can update stripe customers" ON public.stripe_customers;
CREATE POLICY "Service role can update stripe customers"
  ON public.stripe_customers
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role to read all customer records
DROP POLICY IF EXISTS "Service role can read stripe customers" ON public.stripe_customers;
CREATE POLICY "Service role can read stripe customers"
  ON public.stripe_customers
  FOR SELECT
  TO service_role
  USING (true);
