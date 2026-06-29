/*
  # Guest Carer Token System

  Enables primary carers to send a one-time observation link to a Guest Carer
  (e.g. visiting relative) who does not have a CarerView account. The guest
  receives a tokenised URL, completes the observation form without logging in,
  and the observation is stored under the team's resident like any other.

  ## New Table: cv_guest_tokens
  ## New Column: observations.is_guest_submission
  ## New Functions: cv_create_guest_token, cv_peek_guest_token, cv_submit_guest_observation
*/

-- ─────────────────────────────────────────────
-- 1. Add is_guest_submission column to observations
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'is_guest_submission'
  ) THEN
    ALTER TABLE observations ADD COLUMN is_guest_submission boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 2. Create cv_guest_tokens table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_guest_tokens (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash           text UNIQUE NOT NULL,
  team_id              uuid NOT NULL REFERENCES cv_team(id) ON DELETE CASCADE,
  resident_name        text NOT NULL,
  form_type            text NOT NULL CHECK (form_type IN ('ADL', 'IADL', 'COMPREHENSIVE')),
  guest_name           text,
  guest_email          text,
  invited_by_user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observation_id       uuid REFERENCES observations(id) ON DELETE SET NULL,
  expires_at           timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  consumed_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_guest_tokens_token_hash ON cv_guest_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_cv_guest_tokens_team_id ON cv_guest_tokens (team_id);

-- ─────────────────────────────────────────────
-- 3. RLS on cv_guest_tokens
-- ─────────────────────────────────────────────
ALTER TABLE cv_guest_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cv_guest_tokens' AND policyname = 'Team members can view guest tokens for their team'
  ) THEN
    CREATE POLICY "Team members can view guest tokens for their team"
      ON cv_guest_tokens FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = cv_guest_tokens.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cv_guest_tokens' AND policyname = 'Authenticated users can create guest tokens for their team'
  ) THEN
    CREATE POLICY "Authenticated users can create guest tokens for their team"
      ON cv_guest_tokens FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = invited_by_user_id
        AND EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = cv_guest_tokens.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cv_guest_tokens' AND policyname = 'Team members can delete unconsumed guest tokens'
  ) THEN
    CREATE POLICY "Team members can delete unconsumed guest tokens"
      ON cv_guest_tokens FOR DELETE
      TO authenticated
      USING (
        consumed_at IS NULL
        AND EXISTS (
          SELECT 1 FROM cv_team_members
          WHERE cv_team_members.team_id = cv_guest_tokens.team_id
            AND cv_team_members.user_id = auth.uid()
            AND cv_team_members.state = 'active'
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 4. cv_create_guest_token
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cv_create_guest_token(
  p_team          uuid,
  p_resident_name text,
  p_form_type     text,
  p_guest_email   text DEFAULT NULL,
  p_guest_name    text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_bytes  bytea;
  v_token      text;
  v_hash       text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
      AND state = 'active'
  ) THEN
    RAISE EXCEPTION 'Not an active member of this team';
  END IF;

  IF p_form_type NOT IN ('ADL', 'IADL', 'COMPREHENSIVE') THEN
    RAISE EXCEPTION 'Invalid form_type: %', p_form_type;
  END IF;

  v_raw_bytes := gen_random_bytes(32);
  v_token     := encode(v_raw_bytes, 'hex');
  v_hash      := encode(digest(v_token, 'sha256'), 'hex');

  INSERT INTO cv_guest_tokens (
    token_hash, team_id, resident_name, form_type,
    guest_email, guest_name, invited_by_user_id
  ) VALUES (
    v_hash, p_team, p_resident_name, p_form_type,
    lower(trim(p_guest_email)), trim(p_guest_name), auth.uid()
  );

  RETURN v_token;
END;
$$;

REVOKE ALL ON FUNCTION cv_create_guest_token(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cv_create_guest_token(uuid, text, text, text, text) TO authenticated;

-- ─────────────────────────────────────────────
-- 5. cv_peek_guest_token
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cv_peek_guest_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_row  cv_guest_tokens%ROWTYPE;
BEGIN
  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  SELECT * INTO v_row
  FROM cv_guest_tokens
  WHERE token_hash = v_hash;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF v_row.consumed_at IS NOT NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'consumed',
      'resident_name', v_row.resident_name, 'form_type', v_row.form_type);
  END IF;

  IF v_row.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired',
      'resident_name', v_row.resident_name, 'form_type', v_row.form_type);
  END IF;

  RETURN jsonb_build_object(
    'valid',         true,
    'token_id',      v_row.id,
    'team_id',       v_row.team_id,
    'resident_name', v_row.resident_name,
    'form_type',     v_row.form_type,
    'guest_name',    v_row.guest_name,
    'guest_email',   v_row.guest_email,
    'expires_at',    v_row.expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION cv_peek_guest_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cv_peek_guest_token(text) TO anon, authenticated;

-- ─────────────────────────────────────────────
-- 6. cv_submit_guest_observation
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cv_submit_guest_observation(
  p_token            text,
  p_guest_name       text,
  p_guest_email      text,
  p_observation_date date,
  p_mode             text,
  p_notes            text DEFAULT NULL,
  p_answers          jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash      text;
  v_row       cv_guest_tokens%ROWTYPE;
  v_obs_id    uuid;
  v_q         record;
  v_remaining integer;
BEGIN
  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  SELECT * INTO v_row
  FROM cv_guest_tokens
  WHERE token_hash = v_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid guest token';
  END IF;

  IF v_row.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Guest token already used';
  END IF;

  IF v_row.expires_at < now() THEN
    RAISE EXCEPTION 'Guest token expired';
  END IF;

  SELECT remaining INTO v_remaining
  FROM cv_v_team_remaining
  WHERE team_id = v_row.team_id;

  IF v_remaining IS NOT NULL AND v_remaining <= 0 THEN
    RAISE EXCEPTION 'Team observation quota reached';
  END IF;

  INSERT INTO observations (
    user_id,
    author_user_id,
    team_id,
    resident_name,
    form_type,
    observation_date,
    mode_of_observation,
    notes,
    caregiver_name,
    caregiver_email,
    is_guest_submission
  ) VALUES (
    v_row.invited_by_user_id,
    NULL,
    v_row.team_id,
    v_row.resident_name,
    v_row.form_type,
    p_observation_date,
    p_mode,
    nullif(trim(p_notes), ''),
    trim(p_guest_name),
    lower(trim(p_guest_email)),
    true
  )
  RETURNING id INTO v_obs_id;

  FOR v_q IN SELECT * FROM jsonb_each(p_answers) LOOP
    INSERT INTO responses (observation_id, question_id, score)
    VALUES (v_obs_id, v_q.key::uuid, (v_q.value)::integer)
    ON CONFLICT (observation_id, question_id)
    DO UPDATE SET score = EXCLUDED.score;
  END LOOP;

  UPDATE cv_guest_tokens
  SET consumed_at    = now(),
      observation_id = v_obs_id,
      guest_name     = trim(p_guest_name),
      guest_email    = lower(trim(p_guest_email))
  WHERE id = v_row.id;

  RETURN v_obs_id;
END;
$$;

REVOKE ALL ON FUNCTION cv_submit_guest_observation(text, text, text, date, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cv_submit_guest_observation(text, text, text, date, text, text, jsonb) TO anon, authenticated;
