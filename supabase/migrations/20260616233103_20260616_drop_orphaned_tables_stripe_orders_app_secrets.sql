-- Phase 5.2: Drop verified-orphaned tables
-- stripe_orders: 0 rows, zero code references, no FK dependencies, no function references
-- app_secrets: 0 rows, zero code references, no FK dependencies, no function references

DROP TABLE IF EXISTS public.stripe_orders;
DROP TABLE IF EXISTS public.app_secrets;
