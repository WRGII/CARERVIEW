/*
  # Fix Caregiver RLS Policies

  This migration adds the missing RLS policies that allow caregivers to:
  1. Create, read, and update their own observations
  2. Create, read, and update responses for their observations
  3. Read reference data (categories, questions, legend)

  ## Changes Made
  1. Added caregiver policies for observations table
  2. Added caregiver policies for responses table  
  3. Added caregiver policies for reference data tables
  4. Ensured all policies use proper token context functions
*/

-- First, ensure we have the necessary functions (they should exist from previous migrations)
-- If they don't exist, this will create them

CREATE OR REPLACE FUNCTION app.get_current_token_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('app.current_token_id', true)::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

CREATE OR REPLACE FUNCTION app.get_current_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('app.current_role', true),
    'anonymous'
  );
$$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "caregivers_can_insert_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_select_own_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_update_own_observations" ON observations;

DROP POLICY IF EXISTS "caregivers_can_insert_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_select_own_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_update_own_responses" ON responses;

DROP POLICY IF EXISTS "caregivers_can_select_categories" ON categories;
DROP POLICY IF EXISTS "caregivers_can_select_questions" ON questions;
DROP POLICY IF EXISTS "caregivers_can_select_legend" ON legend;

-- Create policies for observations table
CREATE POLICY "caregivers_can_insert_observations"
  ON observations
  FOR INSERT
  TO public
  WITH CHECK (
    app.get_current_role() = 'caregiver' AND
    token_id = app.get_current_token_id()
  );

CREATE POLICY "caregivers_can_select_own_observations"
  ON observations
  FOR SELECT
  TO public
  USING (
    app.get_current_role() = 'caregiver' AND
    token_id = app.get_current_token_id()
  );

CREATE POLICY "caregivers_can_update_own_observations"
  ON observations
  FOR UPDATE
  TO public
  USING (
    app.get_current_role() = 'caregiver' AND
    token_id = app.get_current_token_id()
  )
  WITH CHECK (
    app.get_current_role() = 'caregiver' AND
    token_id = app.get_current_token_id()
  );

-- Create policies for responses table
CREATE POLICY "caregivers_can_insert_responses"
  ON responses
  FOR INSERT
  TO public
  WITH CHECK (
    app.get_current_role() = 'caregiver' AND
    EXISTS (
      SELECT 1 FROM observations
      WHERE observations.id = responses.observation_id
      AND observations.token_id = app.get_current_token_id()
    )
  );

CREATE POLICY "caregivers_can_select_own_responses"
  ON responses
  FOR SELECT
  TO public
  USING (
    app.get_current_role() = 'caregiver' AND
    EXISTS (
      SELECT 1 FROM observations
      WHERE observations.id = responses.observation_id
      AND observations.token_id = app.get_current_token_id()
    )
  );

CREATE POLICY "caregivers_can_update_own_responses"
  ON responses
  FOR UPDATE
  TO public
  USING (
    app.get_current_role() = 'caregiver' AND
    EXISTS (
      SELECT 1 FROM observations
      WHERE observations.id = responses.observation_id
      AND observations.token_id = app.get_current_token_id()
    )
  )
  WITH CHECK (
    app.get_current_role() = 'caregiver' AND
    EXISTS (
      SELECT 1 FROM observations
      WHERE observations.id = responses.observation_id
      AND observations.token_id = app.get_current_token_id()
    )
  );

-- Create policies for reference data tables (categories, questions, legend)
CREATE POLICY "caregivers_can_select_categories"
  ON categories
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver');

CREATE POLICY "caregivers_can_select_questions"
  ON questions
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver');

CREATE POLICY "caregivers_can_select_legend"
  ON legend
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver');