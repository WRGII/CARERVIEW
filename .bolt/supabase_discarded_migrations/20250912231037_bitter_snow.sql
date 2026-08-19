/*
  # Create Sample Observation Tables

  1. New Tables
    - `sample_observations`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `observation_date` (date)
      - `mode_of_observation` (text)
      - `notes` (text)
      - `caregiver_name` (text)
      - `caregiver_email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `sample_responses`
      - `id` (uuid, primary key)
      - `sample_observation_id` (uuid, foreign key to sample_observations)
      - `question_id` (uuid, foreign key to questions)
      - `score` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous users to read sample data

  3. Sample Data
    - Insert sample observation and responses for demonstration
*/

-- Create sample_observations table
CREATE TABLE IF NOT EXISTS public.sample_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL DEFAULT '',
  observation_date date NOT NULL DEFAULT CURRENT_DATE,
  mode_of_observation text DEFAULT 'In Person',
  notes text DEFAULT '',
  caregiver_name text NOT NULL DEFAULT '',
  caregiver_email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sample_responses table
CREATE TABLE IF NOT EXISTS public.sample_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_observation_id uuid NOT NULL,
  question_id uuid NOT NULL,
  score integer NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT sample_responses_sample_observation_id_fkey 
    FOREIGN KEY (sample_observation_id) REFERENCES public.sample_observations(id) ON DELETE CASCADE,
  CONSTRAINT sample_responses_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE,
  CONSTRAINT sample_responses_score_check 
    CHECK (score >= 1 AND score <= 5),
  CONSTRAINT sample_responses_unique_question_per_observation 
    UNIQUE (sample_observation_id, question_id)
);

-- Enable RLS on sample tables
ALTER TABLE public.sample_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access to sample data
CREATE POLICY IF NOT EXISTS "sample_observations_public_select"
  ON public.sample_observations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY IF NOT EXISTS "sample_responses_public_select"
  ON public.sample_responses
  FOR SELECT
  TO anon
  USING (true);

-- Insert sample observation (only if it doesn't exist)
INSERT INTO public.sample_observations (
  id,
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
  'Sample Patient',
  '2024-01-15'::date,
  'In Person',
  'This is a sample observation demonstrating how CarerView captures daily functional assessments. The patient showed good engagement during the observation period, with some areas requiring additional support.',
  'Sample Caregiver',
  'sample@carerview.com',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.sample_observations 
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Insert sample responses (only if they don't exist)
DO $$
DECLARE
  _sample_obs_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  _question_ids uuid[];
  _question_id uuid;
  _counter integer := 0;
  _scores integer[] := ARRAY[4, 3, 5, 2, 4, 3, 5, 4, 2, 3, 4, 5];
  _notes text[] := ARRAY[
    'Patient manages well with minimal assistance',
    'Requires some prompting and support',
    'Completely independent in this area',
    'Needs significant help and supervision',
    'Good progress, occasional assistance needed',
    'Some difficulty but manages with encouragement',
    'Excellent independence maintained',
    'Generally independent with minor support',
    'Requires hands-on assistance',
    'Improving steadily with practice',
    'Maintains good functional ability',
    'Fully capable without assistance'
  ];
BEGIN
  -- Get first 12 question IDs from the database
  SELECT ARRAY(
    SELECT id FROM public.questions 
    ORDER BY sort_order 
    LIMIT 12
  ) INTO _question_ids;

  -- Insert sample responses for each question
  FOREACH _question_id IN ARRAY _question_ids
  LOOP
    _counter := _counter + 1;
    
    INSERT INTO public.sample_responses (
      sample_observation_id,
      question_id,
      score,
      notes,
      created_at,
      updated_at
    )
    SELECT 
      _sample_obs_id,
      _question_id,
      _scores[_counter],
      _notes[_counter],
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM public.sample_responses 
      WHERE sample_observation_id = _sample_obs_id 
      AND question_id = _question_id
    );
    
    -- Exit if we've processed all our sample data
    EXIT WHEN _counter >= array_length(_scores, 1);
  END LOOP;
END $$;