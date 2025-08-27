/*
  # Add Date of Observation and Mode of Observation fields

  1. Schema Changes
    - Add `date_of_observation` column to observations table (DATE type)
    - Add `mode_of_observation` column to observations table (TEXT with constraints)
    
  2. Data Migration
    - Set default date_of_observation to observation_date for existing records
    - Set default mode_of_observation to 'In Person' for existing records
    
  3. Constraints
    - mode_of_observation must be one of: 'In Person', 'Voice Call', 'Video Call'
*/

-- Add the new columns to observations table
DO $$
BEGIN
  -- Add date_of_observation column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'date_of_observation'
  ) THEN
    ALTER TABLE observations ADD COLUMN date_of_observation DATE;
  END IF;

  -- Add mode_of_observation column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'mode_of_observation'
  ) THEN
    ALTER TABLE observations ADD COLUMN mode_of_observation TEXT;
  END IF;
END $$;

-- Update existing records to have default values
UPDATE observations 
SET date_of_observation = observation_date::DATE 
WHERE date_of_observation IS NULL;

UPDATE observations 
SET mode_of_observation = 'In Person' 
WHERE mode_of_observation IS NULL;

-- Add constraint to ensure mode_of_observation only accepts valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'observations_mode_check'
  ) THEN
    ALTER TABLE observations 
    ADD CONSTRAINT observations_mode_check 
    CHECK (mode_of_observation IN ('In Person', 'Voice Call', 'Video Call'));
  END IF;
END $$;

-- Set default values for new records
ALTER TABLE observations 
ALTER COLUMN date_of_observation SET DEFAULT CURRENT_DATE;

ALTER TABLE observations 
ALTER COLUMN mode_of_observation SET DEFAULT 'In Person';