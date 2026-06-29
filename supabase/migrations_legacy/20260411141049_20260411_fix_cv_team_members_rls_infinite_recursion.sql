/*
  # Fix cv_team_members RLS — infinite recursion

  ## Problem
  The SELECT policy "Users can view team memberships" on cv_team_members contains:

      EXISTS (
        SELECT 1 FROM cv_team_members other_members
        WHERE other_members.team_id = cv_team_members.team_id
          AND other_members.user_id = auth.uid()
      )

  This is a self-referencing policy: it queries cv_team_members from inside the
  cv_team_members policy, which triggers the same policy again → infinite recursion.

  This caused:
  1. Family Circle page: "infinite recursion detected in policy for relation cv_team_members"
  2. Memory & Schedule page: useTeamRole query silently fails → teamRole = null → "No team access"

  ## Fix
  1. Create a SECURITY DEFINER helper function `is_team_member(team_id uuid)` that
     checks cv_team_members without RLS in scope (same pattern used to fix profiles
     recursion in migration 20260329_fix_profiles_rls_infinite_recursion).

  2. Replace the recursive SELECT policy with a non-recursive one that uses:
     - user_id = auth.uid()  (own row — simple, no join needed)
     - OR is_team_member(team_id)  (team-mate visibility via SECURITY DEFINER bypass)
     - OR owner check via cv_team (safe — different table, no cycle)

  ## Security
  - The helper function only returns boolean and is narrowly scoped
  - SECURITY DEFINER with fixed search_path = public, pg_temp prevents injection
  - Net access pattern is unchanged: members can see their own team's member list
*/

-- Step 1: create a SECURITY DEFINER helper to check team membership without RLS
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
  );
$$;

-- Step 2: drop the recursive policy and replace it with a clean one
DROP POLICY IF EXISTS "Users can view team memberships" ON public.cv_team_members;

CREATE POLICY "Users can view team memberships"
  ON public.cv_team_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = ( SELECT auth.uid() )
    OR public.is_team_member(team_id)
    OR EXISTS (
      SELECT 1 FROM public.cv_team
      WHERE cv_team.id = cv_team_members.team_id
        AND cv_team.owner_user_id = ( SELECT auth.uid() )
    )
  );

-- Step 3: also fix cv_list_members_with_profile — its internal membership guard
-- now calls is_team_member() instead of a bare SELECT on cv_team_members,
-- preventing any re-entrancy if the function is called in a non-SECURITY DEFINER context.
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
  IF NOT public.is_team_member(p_team) THEN
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

GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cv_list_members_with_profile(uuid) TO authenticated;
