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
    FROM public.cv_team_members chk
    WHERE chk.team_id = p_team
      AND chk.user_id = auth.uid()
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
