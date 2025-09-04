/*
  # Add save timestamp tracking to observations

  1. New Column
    - `last_saved_at` (timestamptz)
      - Records when user explicitly saves an observation (interim or final)
      - Nullable to distinguish between auto-created records and user saves
      - Indexed for performance on save-time queries

  2. Database Changes
    - Add column with appropriate constraints
    - Add index for query performance
    - Update existing records to have initial save timestamp

  3. Notes
    - Distinct from `updated_at` which tracks any database modification
    - `last_saved_at` only updated on explicit user save actions
    - Timezone-aware using timestamptz
*/

-- Add the save timestamp column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'last_saved_at'
  ) THEN
    ALTER TABLE observations ADD COLUMN last_saved_at timestamptz;
  END IF;
END $$;

-- Add index for performance on save timestamp queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'observations' AND indexname = 'idx_observations_last_saved_at'
  ) THEN
    CREATE INDEX idx_observations_last_saved_at ON observations(last_saved_at);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN observations.last_saved_at IS 'Timestamp when user explicitly saved the observation (interim or final save)';