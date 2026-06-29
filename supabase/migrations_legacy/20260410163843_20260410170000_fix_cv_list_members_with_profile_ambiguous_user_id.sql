/*
  # Fix cv_list_members_with_profile — ambiguous "user_id" PL/pgSQL variable

  ## Problem
  The function declares RETURNS TABLE(user_id uuid, ...) which creates a PL/pgSQL
  output variable named "user_id" in the function scope. The membership guard inside
  the function body then uses the unqualified name "user_id" in a WHERE clause:

      WHERE team_id = p_team
      AND user_id = auth.uid()   -- ambiguous: table column or output variable?

  Postgres raises: column reference "user_id" is ambiguous — it could refer to
  either a PL/pgSQL variable or a table column.

  ## Fix
  Fully qualify every reference to the cv_team_members.user_id column inside the
  function body so Postgres resolves it unambiguously as the table column, not the
  PL/pgSQL output variable.

  ## Changes
  - cv_list_members_with_profile(uuid) — recreated with table-qualified column refs
  - No changes to return signature, security model, or any other logic
*/

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

GRANT EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid) TO authenticated;
