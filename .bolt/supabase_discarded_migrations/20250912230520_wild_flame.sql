-- Sample Observation Public Read Migration
-- This migration creates a sample observation that can be viewed by anonymous users
-- and sets up the necessary RLS policies to allow public access to only this sample data.

-- Enable RLS on observations table if not already enabled
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on responses table if not already enabled  
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow anonymous users to SELECT only the sample observation
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

-- Create RLS policy to allow anonymous users to SELECT responses for the sample observation
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

-- Insert sample observation if it doesn't exist
INSERT INTO public.observations (
  id,
  user_id,
  patient_name,
  observation_date,
  mode_of_observation,
  notes,
  caregiver_name,
  caregiver_email,
  created_at,
  updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Sample Patient',
  CURRENT_DATE,
  'In Person',
  'This is a sample observation demonstrating how CarerView captures daily functional assessments. This observation shows typical scoring patterns and notes that help families and healthcare providers understand changes in independence levels.',
  'Sample Caregiver',
  'sample@carerview.com',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.observations 
  WHERE patient_name = 'Sample Patient' 
    AND caregiver_name = 'Sample Caregiver'
);

-- Insert sample responses for the sample observation
-- This creates realistic sample data across different categories and questions
DO $$
DECLARE
  sample_obs_id uuid;
  question_record RECORD;
  response_count INTEGER := 0;
  sample_scores INTEGER[] := ARRAY[3, 4, 2, 5, 3, 4, 2, 4, 3, 5, 2, 4];
  sample_notes TEXT[] := ARRAY[
    'Shows good independence with minimal assistance needed',
    NULL,
    'Requires some support but manages most tasks',
    NULL,
    'Excellent self-management today',
    NULL,
    'Needed extra time but completed successfully',
    NULL,
    'Good progress compared to last week',
    NULL,
    'Some difficulty noted, may need additional support',
    NULL
  ];
BEGIN
  -- Get the sample observation ID
  SELECT id INTO sample_obs_id 
  FROM public.observations 
  WHERE patient_name = 'Sample Patient' 
    AND caregiver_name = 'Sample Caregiver'
  LIMIT 1;
  
  -- Only proceed if we found the sample observation
  IF sample_obs_id IS NOT NULL THEN
    -- Insert sample responses for various questions (limit to 12 for a good demo)
    FOR question_record IN 
      SELECT q.id, q.question_text
      FROM public.questions q
      JOIN public.categories c ON q.category_id = c.id
      ORDER BY c.sort_order, q.sort_order
      LIMIT 12
    LOOP
      response_count := response_count + 1;
      
      INSERT INTO public.responses (
        observation_id,
        question_id,
        score,
        notes,
        created_at,
        updated_at
      )
      SELECT 
        sample_obs_id,
        question_record.id,
        sample_scores[response_count],
        sample_notes[response_count],
        NOW(),
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM public.responses 
        WHERE observation_id = sample_obs_id 
          AND question_id = question_record.id
      );
    END LOOP;
  END IF;
END $$;