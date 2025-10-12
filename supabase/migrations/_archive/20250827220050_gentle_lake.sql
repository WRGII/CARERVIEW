/*
  # Complete Caregiver Access Fix

  This migration creates all necessary RLS policies and functions for caregiver access.
  
  1. Creates helper functions for RLS policies
  2. Adds comprehensive RLS policies for caregivers
  3. Ensures proper token context handling
*/

-- First, ensure we have the necessary helper functions
CREATE OR REPLACE FUNCTION app.get_current_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(current_setting('app.current_role', true), 'anonymous');
$$;

CREATE OR REPLACE FUNCTION app.get_current_token_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(current_setting('app.current_token_id', true), '00000000-0000-0000-0000-000000000000')::uuid;
$$;

-- Function to set token context (called after token validation)
CREATE OR REPLACE FUNCTION set_token_context(p_token_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT set_config('app.current_token_id', p_token_id::text, false);
  SELECT set_config('app.current_role', p_role, false);
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "caregivers_can_insert_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_select_own_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_update_own_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_insert_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_select_own_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_update_own_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_select_categories" ON categories;
DROP POLICY IF EXISTS "caregivers_can_select_questions" ON questions;
DROP POLICY IF EXISTS "caregivers_can_select_legend" ON legend;

-- Observations policies for caregivers
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

-- Responses policies for caregivers
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

-- Reference data policies for caregivers (read-only)
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA app TO public;
GRANT EXECUTE ON FUNCTION app.get_current_role() TO public;
GRANT EXECUTE ON FUNCTION app.get_current_token_id() TO public;
GRANT EXECUTE ON FUNCTION set_token_context(UUID, TEXT) TO public;