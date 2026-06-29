/*
  # Core Team Management Functions

  1. Functions
    - cv_get_active_team(): Returns current user's active team ID
    - cv_set_active_team(p_team uuid): Sets active team after verifying membership
    - cv_create_team_with_patient(): Creates team, patient, owner membership atomically
    - cv_list_members(p_team uuid): Returns team member roster
    - cv_get_remaining(p_team uuid): Returns remaining observation count for team

  2. Security
    - All functions use SECURITY DEFINER with explicit permission checks
    - Validates user membership before returning sensitive data
    - Enforces RLS policies through queries
*/

-- Get current user's active team ID
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

-- Set active team (validates membership first)
CREATE OR REPLACE FUNCTION public.cv_set_active_team(p_team uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user is a member of this team
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  -- Update active team
  UPDATE public.profiles
  SET active_team_id = p_team
  WHERE id = auth.uid();
END;
$$;

-- Create team with patient atomically
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

  -- Create team
  INSERT INTO public.cv_team (name, owner_user_id, plan_id)
  VALUES (p_name, v_user_id, p_plan_id)
  RETURNING id INTO v_team_id;

  -- Create patient record
  INSERT INTO public.cv_team_patient (team_id, full_name, date_of_birth, gender, notes)
  VALUES (v_team_id, p_patient_name, p_dob, p_gender, p_notes);

  -- Add owner as first member
  INSERT INTO public.cv_team_members (team_id, user_id, role, state)
  VALUES (v_team_id, v_user_id, 'owner', 'active');

  -- Set as active team
  UPDATE public.profiles
  SET active_team_id = v_team_id
  WHERE id = v_user_id;

  RETURN v_team_id;
END;
$$;

-- List team members
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
  -- Verify caller is a member of this team
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  -- Return members
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

-- Get remaining observations for team
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
  -- Verify caller is a member of this team
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  -- Get team quota from cv_plan_limits
  SELECT cpl.team_quota_year
  INTO v_quota
  FROM public.cv_team t
  JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id
  WHERE t.id = p_team;

  -- If no quota found, return 0
  IF v_quota IS NULL THEN
    RETURN 0;
  END IF;

  -- Count observations for this team in current year
  SELECT COUNT(*)
  INTO v_used
  FROM public.observations
  WHERE team_id = p_team
    AND EXTRACT(YEAR FROM observation_date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Return remaining
  RETURN GREATEST(0, v_quota - v_used);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cv_get_active_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_set_active_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_get_remaining(uuid) TO authenticated;
