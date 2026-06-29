-- ─────────────────────────────────────────────────────────────────────────────
-- 1. cv_create_guest_token: add 10-per-hour rate limit per user per team
-- ─────────────────────────────────────────────────────────────────────────────
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
  v_count      integer;
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

  -- Rate limit: max 10 invites per user per team per hour
  SELECT COUNT(*) INTO v_count
  FROM cv_guest_tokens
  WHERE invited_by_user_id = auth.uid()
    AND team_id = p_team
    AND created_at > now() - interval '1 hour';

  IF v_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit reached: max 10 guest invites per hour. Please wait before sending more.';
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. cv_submit_guest_observation: validate scores are in 1-5 range
-- ─────────────────────────────────────────────────────────────────────────────
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
  v_score     integer;
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

  -- Validate all scores are integers in [1, 5]
  FOR v_q IN SELECT * FROM jsonb_each(p_answers) LOOP
    BEGIN
      v_score := (v_q.value)::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Invalid score value for question %: must be an integer', v_q.key;
    END;
    IF v_score < 1 OR v_score > 5 THEN
      RAISE EXCEPTION 'Score out of range for question %: must be between 1 and 5', v_q.key;
    END IF;
  END LOOP;

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
