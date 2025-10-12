/*
  # FAMOBS Database Schema

  1. New Tables
    - `access_tokens` - Token-based access management
      - `id` (uuid, primary key)
      - `token_hash` (text, unique, hashed token for security)
      - `role` (text, either 'admin' or 'caregiver')
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optional expiration)
      - `is_active` (boolean, for deactivation)
    
    - `legend` - Score meanings 0-10
      - `id` (uuid, primary key)
      - `score` (integer, 0-10)
      - `description` (text, meaning of the score)
      - `created_at` (timestamp)
    
    - `categories` - ADL/IADL categories
      - `id` (uuid, primary key)
      - `name` (text, category name)
      - `type` (text, 'ADL' or 'IADL')
      - `ada_definition` (text, ADA definition)
      - `ot_definition` (text, OT definition)
      - `sort_order` (integer, for ordering)
      - `created_at` (timestamp)
    
    - `questions` - Questions linked to categories
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `question_text` (text, the actual question)
      - `sort_order` (integer, for ordering within category)
      - `created_at` (timestamp)
    
    - `observations` - Caregiver observation sessions
      - `id` (uuid, primary key)
      - `token_id` (uuid, foreign key to access_tokens)
      - `patient_name` (text, optional patient identifier)
      - `observation_date` (date, when observation was conducted)
      - `notes` (text, optional additional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `responses` - Individual question responses
      - `id` (uuid, primary key)
      - `observation_id` (uuid, foreign key to observations)
      - `question_id` (uuid, foreign key to questions)
      - `score` (integer, 1-10 score)
      - `notes` (text, optional question-specific notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for token-based access control
    - Create app.set_token_id() function for context setting

  3. Functions
    - Token validation and role checking
    - Context setting for RLS policies
*/

-- Create access_tokens table
CREATE TABLE IF NOT EXISTS access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'caregiver')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true
);

-- Create legend table
CREATE TABLE IF NOT EXISTS legend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score integer UNIQUE NOT NULL CHECK (score >= 0 AND score <= 10),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('ADL', 'IADL')),
  ada_definition text NOT NULL DEFAULT '',
  ot_definition text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create observations table
CREATE TABLE IF NOT EXISTS observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES access_tokens(id) ON DELETE CASCADE,
  patient_name text DEFAULT '',
  observation_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(observation_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create function to set current token context
CREATE OR REPLACE FUNCTION app.set_token_id(token_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_token_id', token_uuid::text, true);
END;
$$ LANGUAGE plpgsql;

-- Create function to get current token context
CREATE OR REPLACE FUNCTION app.get_current_token_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_token_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for access_tokens (admins can see all, caregivers see their own)
CREATE POLICY "Admins can view all tokens"
  ON access_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.role = 'admin'
      AND at.is_active = true
    )
  );

CREATE POLICY "Users can view their own token"
  ON access_tokens
  FOR SELECT
  USING (id = app.get_current_token_id());

-- RLS Policies for legend (public read for valid tokens)
CREATE POLICY "Valid tokens can read legend"
  ON legend
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.is_active = true
    )
  );

-- RLS Policies for categories (public read for valid tokens)
CREATE POLICY "Valid tokens can read categories"
  ON categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.is_active = true
    )
  );

-- Admins can insert/update categories
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.role = 'admin'
      AND at.is_active = true
    )
  );

-- RLS Policies for questions (public read for valid tokens)
CREATE POLICY "Valid tokens can read questions"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.is_active = true
    )
  );

-- Admins can insert/update questions
CREATE POLICY "Admins can manage questions"
  ON questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.role = 'admin'
      AND at.is_active = true
    )
  );

-- RLS Policies for observations
CREATE POLICY "Users can view their own observations"
  ON observations
  FOR SELECT
  USING (token_id = app.get_current_token_id());

CREATE POLICY "Caregivers can create observations"
  ON observations
  FOR INSERT
  WITH CHECK (
    token_id = app.get_current_token_id() AND
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.is_active = true
    )
  );

CREATE POLICY "Users can update their own observations"
  ON observations
  FOR UPDATE
  USING (token_id = app.get_current_token_id());

-- Admins can view all observations
CREATE POLICY "Admins can view all observations"
  ON observations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.role = 'admin'
      AND at.is_active = true
    )
  );

-- RLS Policies for responses
CREATE POLICY "Users can view responses for their observations"
  ON responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM observations o
      WHERE o.id = responses.observation_id
      AND o.token_id = app.get_current_token_id()
    )
  );

CREATE POLICY "Users can manage responses for their observations"
  ON responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM observations o
      WHERE o.id = responses.observation_id
      AND o.token_id = app.get_current_token_id()
    )
  );

-- Admins can view all responses
CREATE POLICY "Admins can view all responses"
  ON responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens at
      WHERE at.id = app.get_current_token_id()
      AND at.role = 'admin'
      AND at.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_tokens_hash ON access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_access_tokens_role ON access_tokens(role);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_sort ON questions(sort_order);
CREATE INDEX IF NOT EXISTS idx_observations_token ON observations(token_id);
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_responses_observation ON responses(observation_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id);

-- Insert default legend data
INSERT INTO legend (score, description) VALUES
(0, 'Unable to perform'),
(1, 'Requires total assistance'),
(2, 'Requires maximal assistance'),
(3, 'Requires moderate assistance'),
(4, 'Requires minimal assistance'),
(5, 'Requires supervision'),
(6, 'Requires setup'),
(7, 'Independent with adaptive equipment'),
(8, 'Independent with extra time'),
(9, 'Independent with normal time'),
(10, 'Fully independent')
ON CONFLICT (score) DO NOTHING;