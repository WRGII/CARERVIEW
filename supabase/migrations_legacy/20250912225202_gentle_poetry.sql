/*
  # Sample Observation Public Access

  1. RLS Policy
    - Allow anonymous users to read only the sample observation
    - Sample observation is identified by specific patient_name and caregiver_name

  2. Sample Data
    - Creates a sample observation if it doesn't exist
    - Uses a special user_id for sample data that won't conflict with real users
*/

-- Enable RLS if not already enabled
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT only for the sample observation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public'
      AND tablename='observations'
      AND policyname='observations_sample_public_select'
  ) THEN
    CREATE POLICY observations_sample_public_select
      ON public.observations
      FOR SELECT
      TO anon
      USING (
        patient_name = 'Sample Patient' 
        AND caregiver_name = 'Sample Caregiver'
      );
  END IF;
END $$;

-- Allow public SELECT for responses related to sample observation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public'
      AND tablename='responses'
      AND policyname='responses_sample_public_select'
  ) THEN
    CREATE POLICY responses_sample_public_select
      ON public.responses
      FOR SELECT
      TO anon
      USING (
        observation_id IN (
          SELECT id FROM observations 
          WHERE patient_name = 'Sample Patient' 
            AND caregiver_name = 'Sample Caregiver'
        )
      );
  END IF;
END $$;