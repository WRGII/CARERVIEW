/*
  # Update responses score constraint to allow 0-10 range

  1. Database Changes
    - Update score constraint on responses table to allow 0-10 range instead of 1-10
    - This aligns with the legend table which contains scores 0-10

  2. Rationale
    - The legend table contains score 0 ("Unable to perform")
    - The UI now needs to support the full 0-10 range
    - This ensures data consistency across the application
*/

-- Check if the constraint exists before attempting to drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'responses_score_check' 
    AND table_name = 'responses'
  ) THEN
    ALTER TABLE responses DROP CONSTRAINT responses_score_check;
  END IF;
END $$;

-- Check if the other constraint exists before attempting to drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'responses_score_chk' 
    AND table_name = 'responses'
  ) THEN
    ALTER TABLE responses DROP CONSTRAINT responses_score_chk;
  END IF;
END $$;

-- Add the new constraint allowing 0-10 range
ALTER TABLE responses ADD CONSTRAINT responses_score_range_check 
CHECK ((score >= 0) AND (score <= 10));
