-- Fix Memory Book null constraint errors caused by legacy columns with no default.
-- The frontend sends `full_name` (contacts) and `name`/`specialty_label` (providers),
-- but older schema columns contact_name, provider_name, and provider_type have no
-- default and are NOT NULL, causing every insert to fail.
ALTER TABLE public.memory_book_contacts
  ALTER COLUMN contact_name SET DEFAULT '';

ALTER TABLE public.memory_book_providers
  ALTER COLUMN provider_name SET DEFAULT '',
  ALTER COLUMN provider_type SET DEFAULT '';
