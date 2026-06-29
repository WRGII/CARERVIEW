/*
  Consolidated Schema - Part 2a: Database Functions (Core + Team Management)
*/

-- ===== UTILITY / HELPER FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND state = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_owner(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND state = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT team_id FROM public.cv_team_members
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_active_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT team_id
  FROM public.cv_team_members
  WHERE user_id = auth.uid()
    AND state = 'active';
$$;

-- ===== TEAM MANAGEMENT FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.cv_get_active_team()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT active_team_id
  FROM public.profiles
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.cv_set_active_team(p_team uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  UPDATE public.profiles
  SET active_team_id = p_team
  WHERE id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_check_team_seats(p_team uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_seat_limit integer;
  v_current_count integer;
BEGIN
  SELECT cpl.seats
  INTO v_seat_limit
  FROM public.cv_team t
  JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id
  WHERE t.id = p_team;

  IF v_seat_limit IS NULL THEN
    RETURN false;
  END IF;

  SELECT COUNT(*)
  INTO v_current_count
  FROM public.cv_team_members
  WHERE team_id = p_team
    AND state = 'active';

  RETURN v_current_count < v_seat_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_create_team_with_patient(
  p_name text,
  p_plan_id text,
  p_patient_name text,
  p_dob date DEFAULT NULL,
  p_gender public.cv_gender DEFAULT 'unknown',
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.cv_team (name, owner_user_id, plan_id)
  VALUES (p_name, v_user_id, p_plan_id)
  RETURNING id INTO v_team_id;

  INSERT INTO public.cv_team_patient (team_id, full_name, date_of_birth, gender, notes)
  VALUES (v_team_id, p_patient_name, p_dob, p_gender, p_notes);

  INSERT INTO public.cv_team_members (team_id, user_id, role, state)
  VALUES (v_team_id, v_user_id, 'owner', 'active');

  UPDATE public.profiles
  SET active_team_id = v_team_id
  WHERE id = v_user_id;

  RETURN v_team_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_list_members(p_team uuid)
RETURNS TABLE (
  user_id uuid,
  role public.cv_member_role,
  state public.cv_member_state,
  joined_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    m.user_id,
    m.role,
    m.state,
    m.joined_at
  FROM public.cv_team_members m
  WHERE m.team_id = p_team
  ORDER BY
    CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END,
    m.joined_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_list_members_with_profile(p_team uuid)
RETURNS TABLE(
  user_id      uuid,
  role         public.cv_member_role,
  state        public.cv_member_state,
  joined_at    timestamptz,
  display_name text,
  email        text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    m.user_id,
    m.role,
    m.state,
    m.joined_at,
    COALESCE(p.display_name, p.email, 'Unknown') AS display_name,
    COALESCE(p.email, '') AS email
  FROM public.cv_team_members m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.team_id = p_team
  ORDER BY
    CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END,
    m.joined_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_list_invites(p_team uuid)
RETURNS TABLE(
  id           uuid,
  email        text,
  created_at   timestamptz,
  expires_at   timestamptz,
  consumed_at  timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.email,
    i.created_at,
    i.expires_at,
    i.consumed_at
  FROM public.cv_team_invites i
  WHERE i.team_id = p_team
  ORDER BY i.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_get_remaining(p_team uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_quota integer;
  v_used integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  SELECT cpl.team_quota_year
  INTO v_quota
  FROM public.cv_team t
  JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id
  WHERE t.id = p_team;

  IF v_quota IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO v_used
  FROM public.observations
  WHERE team_id = p_team
    AND EXTRACT(YEAR FROM observation_date) = EXTRACT(YEAR FROM CURRENT_DATE);

  RETURN GREATEST(0, v_quota - v_used);
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_get_team_patient(p_team uuid)
RETURNS TABLE(
  full_name text,
  gender    text,
  notes     text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  RETURN QUERY
  SELECT
    tp.full_name,
    tp.gender::text,
    tp.notes
  FROM public.cv_team_patient tp
  WHERE tp.team_id = p_team;
END;
$$;

CREATE OR REPLACE FUNCTION public.cv_remove_member(p_team uuid, p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_caller      uuid;
  v_target_role public.cv_member_role;
BEGIN
  v_caller := auth.uid();

  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team
    WHERE id = p_team
      AND owner_user_id = v_caller
  ) THEN
    RAISE EXCEPTION 'Only the team owner can remove members';
  END IF;

  IF p_user = v_caller THEN
    RAISE EXCEPTION 'Owner cannot remove themselves';
  END IF;

  SELECT role INTO v_target_role
  FROM public.cv_team_members
  WHERE team_id = p_team AND user_id = p_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User is not a member of this team';
  END IF;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove another owner';
  END IF;

  DELETE FROM public.cv_team_members
  WHERE team_id = p_team AND user_id = p_user;

  UPDATE public.profiles
  SET active_team_id = NULL
  WHERE id = p_user AND active_team_id = p_team;
END;
$$;

-- ===== PLAN ENFORCEMENT =====

CREATE OR REPLACE FUNCTION public.cv_apply_plan_to_owner_teams(
  p_owner uuid,
  p_plan_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team record;
  v_seat_limit integer;
  v_current_count integer;
  v_members_to_freeze integer;
BEGIN
  SELECT seats
  INTO v_seat_limit
  FROM public.cv_plan_limits
  WHERE plan_id = p_plan_id;

  IF v_seat_limit IS NULL THEN
    RAISE NOTICE 'Plan % does not support teams, no action taken', p_plan_id;
    RETURN;
  END IF;

  UPDATE public.cv_team
  SET plan_id = p_plan_id
  WHERE owner_user_id = p_owner;

  FOR v_team IN
    SELECT id
    FROM public.cv_team
    WHERE owner_user_id = p_owner
  LOOP
    SELECT COUNT(*)
    INTO v_current_count
    FROM public.cv_team_members
    WHERE team_id = v_team.id
      AND state = 'active';

    IF v_current_count > v_seat_limit THEN
      v_members_to_freeze := v_current_count - v_seat_limit;

      UPDATE public.cv_team_members
      SET state = 'frozen'
      WHERE team_id = v_team.id
        AND role != 'owner'
        AND state = 'active'
        AND user_id IN (
          SELECT m2.user_id
          FROM public.cv_team_members m2
          WHERE m2.team_id = v_team.id
            AND m2.role != 'owner'
            AND m2.state = 'active'
          ORDER BY m2.joined_at DESC
          LIMIT v_members_to_freeze
        );
    END IF;
  END LOOP;
END;
$$;
