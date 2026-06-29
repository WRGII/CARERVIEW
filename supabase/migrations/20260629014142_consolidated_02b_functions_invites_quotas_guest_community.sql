/*
  Consolidated Schema - Part 2b: Database Functions (Invitations, Quotas, Guest Tokens, etc.)
*/

-- ===== INVITATION FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.cv_create_invite(p_team uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_token text;
  v_token_hash bytea;
  v_user_id uuid;
  v_expires_at timestamptz;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = v_user_id
      AND role = 'owner'
      AND state = 'active'
  ) THEN
    RAISE EXCEPTION 'Not authorized to create invites for this team';
  END IF;

  IF NOT public.cv_check_team_seats(p_team) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := digest(v_token, 'sha256');
  v_expires_at := now() + interval '7 days';

  INSERT INTO public.cv_team_invites (
    team_id, email, token_hash, expires_at, created_by
  ) VALUES (
    p_team, p_email, v_token_hash, v_expires_at, v_user_id
  );

  RETURN jsonb_build_object('token', v_token, 'expires_at', v_expires_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_peek_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_token_hash bytea;
  v_invite record;
BEGIN
  IF p_token IS NULL OR length(p_token) = 0 THEN
    RETURN jsonb_build_object('invalid', true);
  END IF;

  v_token_hash := digest(p_token, 'sha256');

  SELECT id, team_id, email, expires_at, consumed_at
  INTO v_invite
  FROM public.cv_team_invites
  WHERE token_hash = v_token_hash;

  IF v_invite.id IS NULL THEN
    RETURN jsonb_build_object('invalid', true);
  END IF;

  RETURN jsonb_build_object(
    'team_id', v_invite.team_id,
    'email', v_invite.email,
    'expires_at', v_invite.expires_at,
    'consumed', v_invite.consumed_at IS NOT NULL,
    'expired', v_invite.expires_at < now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_accept_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_token_hash bytea;
  v_invite record;
  v_team_id uuid;
  v_has_sub boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  v_token_hash := digest(p_token, 'sha256');

  SELECT id, team_id, email, expires_at, consumed_at
  INTO v_invite
  FROM public.cv_team_invites
  WHERE token_hash = v_token_hash;

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;

  IF v_invite.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite has already been used';
  END IF;

  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invite has expired';
  END IF;

  IF lower(coalesce(v_user_email, '')) <> lower(coalesce(v_invite.email, '')) THEN
    RAISE EXCEPTION 'This invite was sent to a different email address. Please sign in with the address the invitation was sent to.';
  END IF;

  v_team_id := v_invite.team_id;

  IF EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = v_team_id
      AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;

  IF NOT public.cv_check_team_seats(v_team_id) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  INSERT INTO public.cv_team_members (team_id, user_id, role, state)
  VALUES (v_team_id, v_user_id, 'member', 'active');

  UPDATE public.cv_team_invites
  SET consumed_at = now()
  WHERE id = v_invite.id;

  UPDATE public.profiles
  SET active_team_id = v_team_id
  WHERE id = v_user_id;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = v_user_id
      AND status IN ('active', 'trialing')
      AND current_period_end > now()
  ) INTO v_has_sub;

  IF NOT v_has_sub THEN
    INSERT INTO public.user_subscriptions (
      user_id, subscription_id, plan_id, status, current_period_start, current_period_end
    ) VALUES (
      v_user_id, 'free_' || v_user_id::text, 'free', 'active', now(), now() + interval '1 year'
    )
    ON CONFLICT (user_id, subscription_id) DO UPDATE SET
      status = 'active',
      current_period_start = now(),
      current_period_end = now() + interval '1 year';
  END IF;

  RETURN v_team_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_revoke_invite(p_invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_invite  record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT i.id, i.team_id, i.consumed_at
  INTO v_invite
  FROM public.cv_team_invites i
  WHERE i.id = p_invite_id;

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF v_invite.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot revoke an invite that has already been accepted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team
    WHERE id = v_invite.team_id
      AND owner_user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Only the team owner can revoke invites';
  END IF;

  DELETE FROM public.cv_team_invites WHERE id = p_invite_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_email_registered(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(p_email)
  );
END;
$$;

-- ===== OBSERVATION QUOTA FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.cv_get_solo_remaining()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_plan_id   text;
  v_obs_limit integer;
  v_used      integer;
BEGIN
  SELECT us.plan_id
  INTO v_plan_id
  FROM public.user_subscriptions us
  WHERE us.user_id = auth.uid()
    AND us.status IN ('active', 'trialing')
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT sp.obs_limit
  INTO v_obs_limit
  FROM public.subscription_plans sp
  WHERE sp.id = v_plan_id;

  IF v_obs_limit IS NULL OR v_obs_limit = 0 THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer
  INTO v_used
  FROM public.observations o
  WHERE o.user_id = auth.uid()
    AND o.team_id IS NULL
    AND o.observation_date >= (CURRENT_DATE - INTERVAL '12 months');

  RETURN GREATEST(0, v_obs_limit - v_used);
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_team_observation_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_remaining integer;
  v_plan_id   text;
  v_obs_limit integer;
  v_used      integer;
BEGIN
  IF NEW.team_id IS NOT NULL THEN
    SELECT remaining
    INTO v_remaining
    FROM public.cv_v_team_remaining
    WHERE team_id = NEW.team_id;

    IF v_remaining IS NULL THEN
      RAISE EXCEPTION 'Unable to determine observation quota for team';
    END IF;

    IF v_remaining <= 0 THEN
      RAISE EXCEPTION 'Team has reached observation limit for this year. Remaining: 0';
    END IF;

    RETURN NEW;
  END IF;

  SELECT us.plan_id
  INTO v_plan_id
  FROM public.user_subscriptions us
  WHERE us.user_id = NEW.user_id
    AND us.status IN ('active', 'trialing')
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT sp.obs_limit
  INTO v_obs_limit
  FROM public.subscription_plans sp
  WHERE sp.id = v_plan_id;

  IF v_obs_limit IS NULL OR v_obs_limit = 0 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)::integer
  INTO v_used
  FROM public.observations o
  WHERE o.user_id = NEW.user_id
    AND o.team_id IS NULL
    AND o.observation_date >= (CURRENT_DATE - INTERVAL '12 months');

  IF v_used >= v_obs_limit THEN
    RAISE EXCEPTION 'You have reached your % observation limit for the past 12 months.', v_obs_limit;
  END IF;

  RETURN NEW;
END;
$$;

-- ===== GUEST TOKEN FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.cv_create_guest_token(
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

CREATE OR REPLACE FUNCTION public.cv_peek_guest_token(p_token text)
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

CREATE OR REPLACE FUNCTION public.cv_submit_guest_observation(
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
    user_id, author_user_id, team_id, resident_name, form_type,
    observation_date, mode_of_observation, notes,
    caregiver_name, caregiver_email, is_guest_submission
  ) VALUES (
    v_row.invited_by_user_id, NULL, v_row.team_id, v_row.resident_name, v_row.form_type,
    p_observation_date, p_mode, nullif(trim(p_notes), ''),
    trim(p_guest_name), lower(trim(p_guest_email)), true
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

-- ===== MEMORY BOOK FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.mb_get_or_create(p_team_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_book_id uuid;
  v_is_member boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND state = 'active'
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.cv_team_patient WHERE team_id = p_team_id
  ) THEN
    RAISE EXCEPTION 'No patient found for this team';
  END IF;

  SELECT id INTO v_book_id
  FROM public.memory_books
  WHERE team_id = p_team_id;

  IF v_book_id IS NULL THEN
    PERFORM 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND state = 'active';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Only team owners can initialize the memory book';
    END IF;

    INSERT INTO public.memory_books (team_id, resident_id, created_by, updated_by)
    VALUES (p_team_id, p_team_id, auth.uid(), auth.uid())
    RETURNING id INTO v_book_id;
  END IF;

  RETURN v_book_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_sync_resident_to_memory_book_identity(p_team_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_book_id uuid;
  v_resident RECORD;
BEGIN
  SELECT * INTO v_resident
  FROM cv_team_patient
  WHERE team_id = p_team_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT id INTO v_book_id
  FROM memory_books
  WHERE team_id = p_team_id;

  IF v_book_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO memory_book_identity (
    memory_book_id, team_id, preferred_name, birthplace, address_preference,
    relationship_status, cultural_preferences, language_preferences,
    about_me, photo_url, created_by, updated_by
  )
  VALUES (
    v_book_id, p_team_id,
    COALESCE(v_resident.preferred_name, ''),
    COALESCE(v_resident.birthplace, ''),
    COALESCE(v_resident.address_preference, ''),
    COALESCE(v_resident.relationship_status, ''),
    COALESCE(v_resident.cultural_preferences, ''),
    COALESCE(v_resident.language_preferences, ''),
    COALESCE(v_resident.about_me, ''),
    COALESCE(v_resident.photo_url, ''),
    auth.uid(), auth.uid()
  )
  ON CONFLICT (memory_book_id) DO UPDATE SET
    preferred_name        = EXCLUDED.preferred_name,
    birthplace            = EXCLUDED.birthplace,
    address_preference    = EXCLUDED.address_preference,
    relationship_status   = EXCLUDED.relationship_status,
    cultural_preferences  = EXCLUDED.cultural_preferences,
    language_preferences  = EXCLUDED.language_preferences,
    about_me              = EXCLUDED.about_me,
    photo_url             = EXCLUDED.photo_url,
    updated_at            = now(),
    updated_by            = auth.uid();
END;
$$;

-- ===== I18N FUNCTION =====

CREATE OR REPLACE FUNCTION public.get_translations_for_locale(p_locale text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    json_object_agg(t.key, t.value),
    '{}'::json
  )
  FROM ui_translations t
  WHERE t.locale = p_locale;
$$;

-- ===== RATE LIMITING / WEBHOOK FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier    text,
  p_endpoint      text,
  p_max_requests  integer,
  p_window_minutes integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window_start  timestamptz;
  v_window_end    timestamptz;
  v_current_count integer;
  v_allowed       boolean;
  v_remaining     integer;
  v_row           record;
BEGIN
  v_window_start := date_trunc('minute', now()) -
    (EXTRACT(MINUTE FROM now())::integer % p_window_minutes) * interval '1 minute';
  v_window_end := v_window_start + (p_window_minutes * interval '1 minute');

  SELECT * INTO v_row
  FROM public.rate_limit_log
  WHERE identifier   = p_identifier
    AND endpoint     = p_endpoint
    AND window_start = v_window_start
  FOR UPDATE SKIP LOCKED;

  IF v_row.id IS NULL THEN
    DELETE FROM public.rate_limit_log
    WHERE identifier = p_identifier
      AND endpoint   = p_endpoint
      AND window_end < now() - (p_window_minutes * 2 * interval '1 minute');

    INSERT INTO public.rate_limit_log
      (identifier, endpoint, request_count, window_start, window_end)
    VALUES
      (p_identifier, p_endpoint, 1, v_window_start, v_window_end)
    ON CONFLICT DO NOTHING;

    v_current_count := 1;
  ELSE
    UPDATE public.rate_limit_log
    SET request_count = request_count + 1,
        updated_at    = now()
    WHERE id = v_row.id;

    v_current_count := v_row.request_count + 1;
  END IF;

  v_allowed   := v_current_count <= p_max_requests;
  v_remaining := GREATEST(p_max_requests - v_current_count, 0);

  RETURN jsonb_build_object(
    'allowed',    v_allowed,
    'remaining',  v_remaining,
    'limit',      p_max_requests,
    'reset_at',   v_window_end
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_webhook_event(
  p_event_id   text,
  p_event_type text,
  p_status     text DEFAULT 'completed'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.webhook_events (event_id, event_type, status, processed_at)
  VALUES (p_event_id, p_event_type, p_status, now())
  ON CONFLICT (event_id) DO UPDATE
    SET status       = EXCLUDED.status,
        processed_at = now();
END;
$$;

-- ===== COMMUNITY TRIGGER FUNCTION =====

CREATE OR REPLACE FUNCTION public.create_community_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base        text;
  v_handle      text;
  v_attempt     int := 0;
  v_email       text;
  v_display     text;
BEGIN
  v_display := COALESCE(NEW.display_name, '');
  v_base := lower(regexp_replace(split_part(trim(v_display), ' ', 1), '[^a-zA-Z0-9_]', '', 'g'));

  IF length(v_base) < 2 THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
    v_base := lower(regexp_replace(split_part(COALESCE(v_email, 'caregiver'), '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));
    v_base := left(v_base, 20);
  END IF;

  IF length(v_base) < 2 THEN
    v_base := 'caregiver';
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    v_handle := v_base || '_' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

    BEGIN
      INSERT INTO public.community_profiles (
        id, handle, bio, avatar_color, handle_is_auto_generated
      ) VALUES (
        NEW.id, v_handle, '', '#00BCD4', true
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 10 THEN
        v_handle := v_base || '_' || extract(epoch from clock_timestamp())::bigint % 100000;
        INSERT INTO public.community_profiles (
          id, handle, bio, avatar_color, handle_is_auto_generated
        ) VALUES (
          NEW.id, v_handle, '', '#00BCD4', true
        );
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$;
