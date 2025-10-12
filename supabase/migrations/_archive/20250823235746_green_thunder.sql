/*
  # Create app schema for RLS functions

  1. Schema
    - Create `app` schema for utility functions
    
  2. Functions
    - Move token management functions to app schema
*/

CREATE SCHEMA IF NOT EXISTS app;

-- Grant usage on app schema
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT USAGE ON SCHEMA app TO anon;

-- Move functions to app schema (recreate them)
DROP FUNCTION IF EXISTS app.set_token_id(uuid);
DROP FUNCTION IF EXISTS app.get_current_token_id();

CREATE OR REPLACE FUNCTION app.set_token_id(token_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_token_id', token_uuid::text, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app.get_current_token_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_token_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION app.set_token_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.set_token_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION app.get_current_token_id() TO authenticated;
GRANT EXECUTE ON FUNCTION app.get_current_token_id() TO anon;