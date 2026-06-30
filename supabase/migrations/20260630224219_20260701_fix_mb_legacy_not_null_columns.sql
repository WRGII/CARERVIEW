-- Fix legacy NOT NULL columns in Memory Book tables that have no DEFAULT.
-- The frontend sends the newer replacement columns (label/insurer for insurance,
-- category/provider_name for household providers), so the original legacy columns
-- must accept empty string defaults to avoid constraint violations on insert.

ALTER TABLE public.memory_book_insurance_entries
  ALTER COLUMN provider_name SET DEFAULT '';

ALTER TABLE public.memory_book_household_providers
  ALTER COLUMN provider_type SET DEFAULT '',
  ALTER COLUMN company_name SET DEFAULT '';
