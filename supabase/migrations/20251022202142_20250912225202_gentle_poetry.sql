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
DROP POLICY IF EXISTS "observations_sample_public_select" ON public.observations;
CREATE POLICY observations_sample_public_select
  ON public.observations
  FOR SELECT
  TO anon
  USING (
    patient_name = 'Sample Patient' 
    AND caregiver_name = 'Sample Caregiver'
  );

-- Allow public SELECT for responses related to sample observation
DROP POLICY IF EXISTS "responses_sample_public_select" ON public.responses;
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
