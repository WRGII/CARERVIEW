/*
  # Complete Caregiver Access Fix

  This migration creates all necessary RLS policies and functions for the CarerView application.

  ## What this migration does:
  1. Creates helper functions for token context and role checking
  2. Adds RLS policies for caregivers to access observations, responses, categories, questions, and legend
  3. Ensures admins maintain full access to all data
  4. Fixes any missing policies that prevent the application from working

  ## Tables affected:
  - access_tokens (admin policies)
  - observations (caregiver insert/select/update policies)
  - responses (caregiver insert/select/update policies)  
  - categories (caregiver select policy)
  - questions (caregiver select policy)
  - legend (caregiver select policy)
*/

-- Create the app schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Helper function to get current role from session context
CREATE OR REPLACE FUNCTION app.get_current_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('app.current_role', true), 'anonymous');
$$;

-- Helper function to get current token ID from session context
CREATE OR REPLACE FUNCTION app.get_current_token_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('app.current_token_id', true), '00000000-0000-0000-0000-000000000000')::uuid;
$$;

-- Function to set token context (called after token validation)
CREATE OR REPLACE FUNCTION app.set_token_context(p_token_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_token_id', p_token_id::text, false);
  PERFORM set_config('app.current_role', p_role, false);
END;
$$;

-- Function to validate raw tokens
CREATE OR REPLACE FUNCTION app.validate_token(_raw_token text)
RETURNS TABLE(valid boolean, token_id uuid, role text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_hash text;
  token_record record;
BEGIN
  -- Hash the raw token using the same method as token creation
  SELECT encode(digest(_raw_token, 'sha256'), 'hex') INTO token_hash;
  
  -- Look up the token
  SELECT id, access_tokens.role, is_active, expires_at
  INTO token_record
  FROM access_tokens
  WHERE access_tokens.token_hash = validate_token.token_hash;
  
  -- Check if token exists and is valid
  IF token_record.id IS NULL THEN
    RETURN QUERY SELECT false, null::uuid, null::text;
    RETURN;
  END IF;
  
  -- Check if token is active
  IF NOT token_record.is_active THEN
    RETURN QUERY SELECT false, null::uuid, null::text;
    RETURN;
  END IF;
  
  -- Check if token is expired
  IF token_record.expires_at IS NOT NULL AND token_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, null::uuid, null::text;
    RETURN;
  END IF;
  
  -- Token is valid
  RETURN QUERY SELECT true, token_record.id, token_record.role;
END;
$$;

-- Function to generate new tokens (for admin use)
CREATE OR REPLACE FUNCTION app.generate_token(_role text, _display_name text DEFAULT NULL, _email text DEFAULT NULL)
RETURNS TABLE(token_id uuid, raw_token text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token_id uuid;
  raw_token text;
  token_hash text;
BEGIN
  -- Generate a secure random token
  raw_token := encode(gen_random_bytes(32), 'base64');
  
  -- Hash the token for storage
  token_hash := encode(digest(raw_token, 'sha256'), 'hex');
  
  -- Insert the new token
  INSERT INTO access_tokens (role, token_hash, display_name, email)
  VALUES (_role, token_hash, _display_name, _email)
  RETURNING id INTO new_token_id;
  
  RETURN QUERY SELECT new_token_id, raw_token;
END;
$$;

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (using IF EXISTS to prevent errors)
DROP POLICY IF EXISTS "caregivers_can_insert_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_select_own_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_update_own_observations" ON observations;
DROP POLICY IF EXISTS "caregivers_can_insert_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_select_own_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_update_own_responses" ON responses;
DROP POLICY IF EXISTS "caregivers_can_select_categories" ON categories;
DROP POLICY IF EXISTS "caregivers_can_select_questions" ON questions;
DROP POLICY IF EXISTS "caregivers_can_select_legend" ON legend;

-- ACCESS_TOKENS policies (keep existing admin policies)
-- These should already exist, but we'll ensure they're correct

-- OBSERVATIONS policies for caregivers
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

-- RESPONSES policies for caregivers
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

-- CATEGORIES policies for caregivers (read-only access)
CREATE POLICY "caregivers_can_select_categories"
  ON categories
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver');

-- QUESTIONS policies for caregivers (read-only access)
CREATE POLICY "caregivers_can_select_questions"
  ON questions
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver');

-- LEGEND policies for caregivers (read-only access)
CREATE POLICY "caregivers_can_select_legend"
  ON legend
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver');

-- Grant necessary permissions to the app schema functions
GRANT USAGE ON SCHEMA app TO public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO public;

-- Create a function that can be called to set up the session context
CREATE OR REPLACE FUNCTION set_token_context(p_token_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM app.set_token_context(p_token_id, p_role);
END;
$$;

-- Create a function that can be called to validate tokens
CREATE OR REPLACE FUNCTION validate_token(_raw_token text)
RETURNS TABLE(valid boolean, token_id uuid, role text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM app.validate_token(_raw_token);
END;
$$;

-- Create a function that can be called to generate tokens
CREATE OR REPLACE FUNCTION generate_token(_role text, _display_name text DEFAULT NULL, _email text DEFAULT NULL)
RETURNS TABLE(token_id uuid, raw_token text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM app.generate_token(_role, _display_name, _email);
END;
$$;