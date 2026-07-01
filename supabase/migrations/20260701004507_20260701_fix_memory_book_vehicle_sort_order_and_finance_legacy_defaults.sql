-- Fix 1: Add missing sort_order column to memory_book_vehicle
ALTER TABLE public.memory_book_vehicle
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Fix 2: Give legacy NOT NULL columns empty-string defaults so inserts using
-- the new schema (label/category/company/value) don't violate constraints
ALTER TABLE public.memory_book_finance_entries
  ALTER COLUMN institution SET DEFAULT '',
  ALTER COLUMN account_type SET DEFAULT '';
