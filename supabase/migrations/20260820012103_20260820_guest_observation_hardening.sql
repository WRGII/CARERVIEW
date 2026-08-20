/*
# Harden cv_submit_guest_observation input validation

## Problem
The function currently allows arbitrary text for `p_mode` and does not enforce
length limits on `p_guest_name`, `p_guest_email`, or `p_notes`. This permits
oversized data storage and invalid mode values.

## Changes
1. Validate `p_mode` against the allowed set ('In Person', 'Voice Call', 'Video Call').
2. Enforce max lengths: guest_name (100), guest_email (320), notes (5000).
3. Reject observation_date in the future (must be <= current_date).
4. Add a `notification_sent` boolean column to `cv_guest_tokens` so the
   notify-guest-submitted edge function can deduplicate (only send once per token).

## Security
- Function remains SECURITY DEFINER, same owner, same search_path.
- No RLS or policy changes.
- Stricter validation reduces attack surface for oversized or invalid inputs.
*/

-- 1. Add notification_sent flag for deduplication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'cv_guest_tokens'
    AND column_name = 'notification_sent'
  ) THEN
    ALTER TABLE public.cv_guest_tokens ADD COLUMN notification_sent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. Recreate the function with stricter validation
CREATE OR REPLACE FUNCTION public.cv_submit_guest_observation(
  p_token text,
  p_guest_name text,
  p_guest_email text,
  p_observation_date date,
  p_mode text,
  p_notes text DEFAULT NULL,
  p_answers jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_hash      text;
  v_row       cv_guest_tokens%ROWTYPE;
  v_obs_id    uuid;
  v_q         record;
  v_score     integer;
  v_remaining integer;
BEGIN
  -- Input validation: mode
  IF p_mode NOT IN ('In Person', 'Voice Call', 'Video Call') THEN
    RAISE EXCEPTION 'Invalid mode: must be In Person, Voice Call, or Video Call';
  END IF;

  -- Input validation: lengths
  IF length(trim(COALESCE(p_guest_name, ''))) > 100 THEN
    RAISE EXCEPTION 'Guest name too long (max 100 characters)';
  END IF;
  IF length(trim(COALESCE(p_guest_email, ''))) > 320 THEN
    RAISE EXCEPTION 'Guest email too long (max 320 characters)';
  END IF;
  IF length(trim(COALESCE(p_notes, ''))) > 5000 THEN
    RAISE EXCEPTION 'Notes too long (max 5000 characters)';
  END IF;

  -- Input validation: date not in the future
  IF p_observation_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Observation date cannot be in the future';
  END IF;

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

  -- Inline quota check: avoids cv_v_team_remaining view which requires
  -- is_team_member() execute permission that anon does not have.
  SELECT GREATEST(
    COALESCE(pl.team_quota_year, 0)
    - COALESCE(count(o.id), 0)::integer,
    0
  )
  INTO v_remaining
  FROM cv_team t
  LEFT JOIN cv_plan_limits pl ON pl.plan_id = t.plan_id
  LEFT JOIN observations o
    ON o.team_id = t.id
    AND EXTRACT(year FROM o.observation_date) = EXTRACT(year FROM CURRENT_DATE)
  WHERE t.id = v_row.team_id
  GROUP BY t.id, pl.team_quota_year;

  IF v_remaining IS NOT NULL AND v_remaining <= 0 THEN
    RAISE EXCEPTION 'Team observation quota reached';
  END IF;

  -- Validate answer scores
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

  -- Insert observation
  INSERT INTO observations (
    user_id, author_user_id, team_id, resident_name, form_type,
    observation_date, mode_of_observation, notes,
    caregiver_name, caregiver_email, is_guest_submission
  ) VALUES (
    v_row.invited_by_user_id, NULL, v_row.team_id, v_row.resident_name, v_row.form_type,
    p_observation_date, p_mode, nullif(trim(p_notes), ''),
    trim(p_guest_name), lower(trim(p_guest_email)), true
  )
  RETURNING id INTO v_obs_id;

  -- Insert responses
  FOR v_q IN SELECT * FROM jsonb_each(p_answers) LOOP
    INSERT INTO responses (observation_id, question_id, score)
    VALUES (v_obs_id, v_q.key::uuid, (v_q.value)::integer)
    ON CONFLICT (observation_id, question_id)
    DO UPDATE SET score = EXCLUDED.score;
  END LOOP;

  -- Mark token consumed
  UPDATE cv_guest_tokens
  SET consumed_at    = now(),
      observation_id = v_obs_id,
      guest_name     = trim(p_guest_name),
      guest_email    = lower(trim(p_guest_email))
  WHERE id = v_row.id;

  RETURN v_obs_id;
END;
$function$;
