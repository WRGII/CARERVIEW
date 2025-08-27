/*
  # Fix RLS policies for caregiver observations

  1. Security Updates
    - Add INSERT policy for caregivers to create observations
    - Add SELECT policy for caregivers to view their own observations  
    - Add UPDATE policy for caregivers to update their own observations
    - Add policies for responses table to allow caregivers to save scores

  2. Policy Details
    - Caregivers can only access observations linked to their token_id
    - Caregivers can create, read, and update their own observations
    - Caregivers can create, read, and update responses for their observations
*/

-- Add INSERT policy for caregivers to create observations
CREATE POLICY "caregivers_can_insert_observations"
  ON observations
  FOR INSERT
  TO public
  WITH CHECK (
    app.get_current_role() = 'caregiver'::text 
    AND token_id = app.get_current_token_id()
  );

-- Add SELECT policy for caregivers to view their own observations
CREATE POLICY "caregivers_can_select_own_observations"
  ON observations
  FOR SELECT
  TO public
  USING (
    app.get_current_role() = 'caregiver'::text 
    AND token_id = app.get_current_token_id()
  );

-- Add UPDATE policy for caregivers to update their own observations
CREATE POLICY "caregivers_can_update_own_observations"
  ON observations
  FOR UPDATE
  TO public
  USING (
    app.get_current_role() = 'caregiver'::text 
    AND token_id = app.get_current_token_id()
  )
  WITH CHECK (
    app.get_current_role() = 'caregiver'::text 
    AND token_id = app.get_current_token_id()
  );

-- Add INSERT policy for caregivers to create responses
CREATE POLICY "caregivers_can_insert_responses"
  ON responses
  FOR INSERT
  TO public
  WITH CHECK (
    app.get_current_role() = 'caregiver'::text 
    AND EXISTS (
      SELECT 1 FROM observations 
      WHERE observations.id = responses.observation_id 
      AND observations.token_id = app.get_current_token_id()
    )
  );

-- Add SELECT policy for caregivers to view responses for their observations
CREATE POLICY "caregivers_can_select_own_responses"
  ON responses
  FOR SELECT
  TO public
  USING (
    app.get_current_role() = 'caregiver'::text 
    AND EXISTS (
      SELECT 1 FROM observations 
      WHERE observations.id = responses.observation_id 
      AND observations.token_id = app.get_current_token_id()
    )
  );

-- Add UPDATE policy for caregivers to update responses for their observations
CREATE POLICY "caregivers_can_update_own_responses"
  ON responses
  FOR UPDATE
  TO public
  USING (
    app.get_current_role() = 'caregiver'::text 
    AND EXISTS (
      SELECT 1 FROM observations 
      WHERE observations.id = responses.observation_id 
      AND observations.token_id = app.get_current_token_id()
    )
  )
  WITH CHECK (
    app.get_current_role() = 'caregiver'::text 
    AND EXISTS (
      SELECT 1 FROM observations 
      WHERE observations.id = responses.observation_id 
      AND observations.token_id = app.get_current_token_id()
    )
  );

-- Add SELECT policies for caregivers to view categories, questions, and legend
CREATE POLICY "caregivers_can_select_categories"
  ON categories
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver'::text);

CREATE POLICY "caregivers_can_select_questions"
  ON questions
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver'::text);

CREATE POLICY "caregivers_can_select_legend"
  ON legend
  FOR SELECT
  TO public
  USING (app.get_current_role() = 'caregiver'::text);