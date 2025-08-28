/*
  # Add caregiver fields to observations

  1. Schema Changes
    - Add `caregiver_name` column (VARCHAR, required)
    - Add `caregiver_email` column (VARCHAR, required with email validation)
    - Add index on caregiver_email for performance
    
  2. Data Migration
    - Existing records will need default values during migration
    - New records will require these fields to be populated
    
  3. Constraints
    - Both fields are required (NOT NULL)
    - Email field has format validation
*/

-- Add caregiver_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'caregiver_name'
  ) THEN
    ALTER TABLE observations ADD COLUMN caregiver_name VARCHAR(255);
  END IF;
END $$;

-- Add caregiver_email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'caregiver_email'
  ) THEN
    ALTER TABLE observations ADD COLUMN caregiver_email VARCHAR(320);
  END IF;
END $$;

-- Update existing records with placeholder values (required for NOT NULL constraint)
UPDATE observations 
SET 
  caregiver_name = 'Legacy Caregiver',
  caregiver_email = 'legacy@carerview.system'
WHERE caregiver_name IS NULL OR caregiver_email IS NULL;

-- Make the fields required (NOT NULL)
DO $$
BEGIN
  -- Make caregiver_name NOT NULL if not already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' 
    AND column_name = 'caregiver_name' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE observations ALTER COLUMN caregiver_name SET NOT NULL;
  END IF;
  
  -- Make caregiver_email NOT NULL if not already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' 
    AND column_name = 'caregiver_email' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE observations ALTER COLUMN caregiver_email SET NOT NULL;
  END IF;
END $$;

-- Add email format validation constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'observations_caregiver_email_format'
  ) THEN
    ALTER TABLE observations 
    ADD CONSTRAINT observations_caregiver_email_format 
    CHECK (caregiver_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Add index on caregiver_email for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'observations' AND indexname = 'idx_observations_caregiver_email'
  ) THEN
    CREATE INDEX idx_observations_caregiver_email ON observations(caregiver_email);
  END IF;
END $$;

-- Add index on caregiver_name for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'observations' AND indexname = 'idx_observations_caregiver_name'
  ) THEN
    CREATE INDEX idx_observations_caregiver_name ON observations(caregiver_name);
  END IF;
END $$;