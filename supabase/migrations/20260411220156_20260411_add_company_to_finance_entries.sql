/*
  # Add company column to memory_book_finance_entries

  ## Summary
  Adds a `company` text column to the `memory_book_finance_entries` table to allow
  caregivers to record the company or institution name for each finance entry
  (e.g., "Wells Fargo", "Social Security Administration", "Pacific Gas & Electric").

  ## Changes
  ### Modified Tables
  - `memory_book_finance_entries`
    - Added `company` (text, NOT NULL, DEFAULT '') — stores company/institution name

  ## Notes
  - Uses IF NOT EXISTS guard to prevent errors on re-run
  - Default is empty string to match existing nullable-free convention on this table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memory_book_finance_entries'
      AND column_name = 'company'
  ) THEN
    ALTER TABLE memory_book_finance_entries
      ADD COLUMN company text NOT NULL DEFAULT '';
  END IF;
END $$;
