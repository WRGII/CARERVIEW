/*
  # Add category-specific notes to responses table

  1. Schema Changes
    - Add `category_notes` column to `responses` table to store category-specific notes
    - This allows each response to have both individual question notes and category-level notes

  2. Security
    - No RLS changes needed as responses table already has proper policies
    - Category notes will inherit the same security model as existing response data

  3. Data Migration
    - Safe additive change - no existing data affected
    - Default value ensures backward compatibility
*/

-- Add category_notes column to responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'category_notes'
  ) THEN
    ALTER TABLE responses ADD COLUMN category_notes text DEFAULT '';
  END IF;
END $$;
