/*
  # Comprehensive RLS cross-table recursion fix

  ## Problem
  cv_team_members SELECT policy references cv_team table.
  cv_team SELECT policy references cv_team_members table.
  This creates a mutual recursion cycle:
    cv_team_members -> cv_team -> cv_team_members -> ... infinite.

  All other tables (memory_books, observations, etc.) whose policies reference
  cv_team_members also trigger the recursive SELECT policy on cv_team_members,
  which then hits cv_team, which hits cv_team_members again.

  ## Solution
  1. Create SECURITY DEFINER helpers that bypass RLS:
     - is_team_member(team_id)     -- user is active member of team
     - is_team_owner(team_id)      -- user is owner + active member of team
     - get_user_team_ids()         -- all team_ids the user belongs to
  2. Rewrite ALL policies that cross-reference cv_team_members or cv_team
     to use these helpers instead of bare subqueries.

  ## Affected tables
  - cv_team_members (1 SELECT)
  - cv_team (1 SELECT)
  - cv_team_patient (1 SELECT)
  - memory_books (SELECT, INSERT, UPDATE, DELETE)
  - memory_book_identity (SELECT, INSERT, UPDATE, DELETE)
  - memory_book_contacts (SELECT, INSERT, UPDATE, DELETE)
  - memory_book_medical (SELECT, INSERT, UPDATE, DELETE)
  - memory_book_preferences (SELECT, INSERT, UPDATE, DELETE)
  - observations (SELECT)
  - responses (SELECT)

  ## Security
  - All helpers are SECURITY DEFINER with fixed search_path
  - Net access semantics are identical: same users can see same data
  - Helpers return only booleans or uuid arrays, no data leakage
*/

-- ============================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- ============================================================

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

GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_team_ids() TO authenticated;

-- ============================================================
-- 2. cv_team_members — remove cross-ref to cv_team
-- ============================================================

DROP POLICY IF EXISTS "Users can view team memberships" ON public.cv_team_members;

CREATE POLICY "Users can view team memberships"
  ON public.cv_team_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_team_member(team_id)
  );

-- ============================================================
-- 3. cv_team — remove cross-ref to cv_team_members
-- ============================================================

DROP POLICY IF EXISTS "Users can view their teams" ON public.cv_team;

CREATE POLICY "Users can view their teams"
  ON public.cv_team
  FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR public.is_team_member(id)
  );

-- ============================================================
-- 4. cv_team_patient — remove cross-refs to cv_team + cv_team_members
-- ============================================================

DROP POLICY IF EXISTS "Users can view team patient info" ON public.cv_team_patient;

CREATE POLICY "Users can view team patient info"
  ON public.cv_team_patient
  FOR SELECT
  TO authenticated
  USING (
    public.is_team_member(team_id)
  );

-- ============================================================
-- 5. memory_books — rewrite all 4 policies
-- ============================================================

DROP POLICY IF EXISTS "Team members can view their memory book" ON public.memory_books;
CREATE POLICY "Team members can view their memory book"
  ON public.memory_books
  FOR SELECT
  TO authenticated
  USING ( public.is_team_member(team_id) );

DROP POLICY IF EXISTS "Team owners can create memory book" ON public.memory_books;
CREATE POLICY "Team owners can create memory book"
  ON public.memory_books
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can update memory book" ON public.memory_books;
CREATE POLICY "Team owners can update memory book"
  ON public.memory_books
  FOR UPDATE
  TO authenticated
  USING ( public.is_team_owner(team_id) )
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can delete memory book" ON public.memory_books;
CREATE POLICY "Team owners can delete memory book"
  ON public.memory_books
  FOR DELETE
  TO authenticated
  USING ( public.is_team_owner(team_id) );

-- ============================================================
-- 6. memory_book_identity — rewrite all 4 policies
-- ============================================================

DROP POLICY IF EXISTS "Team members can view identity" ON public.memory_book_identity;
CREATE POLICY "Team members can view identity"
  ON public.memory_book_identity
  FOR SELECT
  TO authenticated
  USING ( public.is_team_member(team_id) );

DROP POLICY IF EXISTS "Team owners can insert identity" ON public.memory_book_identity;
CREATE POLICY "Team owners can insert identity"
  ON public.memory_book_identity
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can update identity" ON public.memory_book_identity;
CREATE POLICY "Team owners can update identity"
  ON public.memory_book_identity
  FOR UPDATE
  TO authenticated
  USING ( public.is_team_owner(team_id) )
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can delete identity" ON public.memory_book_identity;
CREATE POLICY "Team owners can delete identity"
  ON public.memory_book_identity
  FOR DELETE
  TO authenticated
  USING ( public.is_team_owner(team_id) );

-- ============================================================
-- 7. memory_book_contacts — rewrite all 4 policies
-- ============================================================

DROP POLICY IF EXISTS "Team members can view contacts" ON public.memory_book_contacts;
CREATE POLICY "Team members can view contacts"
  ON public.memory_book_contacts
  FOR SELECT
  TO authenticated
  USING ( public.is_team_member(team_id) );

DROP POLICY IF EXISTS "Team owners can insert contacts" ON public.memory_book_contacts;
CREATE POLICY "Team owners can insert contacts"
  ON public.memory_book_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can update contacts" ON public.memory_book_contacts;
CREATE POLICY "Team owners can update contacts"
  ON public.memory_book_contacts
  FOR UPDATE
  TO authenticated
  USING ( public.is_team_owner(team_id) )
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can delete contacts" ON public.memory_book_contacts;
CREATE POLICY "Team owners can delete contacts"
  ON public.memory_book_contacts
  FOR DELETE
  TO authenticated
  USING ( public.is_team_owner(team_id) );

-- ============================================================
-- 8. memory_book_medical — rewrite all 4 policies
-- ============================================================

DROP POLICY IF EXISTS "Team members can view medical" ON public.memory_book_medical;
CREATE POLICY "Team members can view medical"
  ON public.memory_book_medical
  FOR SELECT
  TO authenticated
  USING ( public.is_team_member(team_id) );

DROP POLICY IF EXISTS "Team owners can insert medical" ON public.memory_book_medical;
CREATE POLICY "Team owners can insert medical"
  ON public.memory_book_medical
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can update medical" ON public.memory_book_medical;
CREATE POLICY "Team owners can update medical"
  ON public.memory_book_medical
  FOR UPDATE
  TO authenticated
  USING ( public.is_team_owner(team_id) )
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can delete medical" ON public.memory_book_medical;
CREATE POLICY "Team owners can delete medical"
  ON public.memory_book_medical
  FOR DELETE
  TO authenticated
  USING ( public.is_team_owner(team_id) );

-- ============================================================
-- 9. memory_book_preferences — rewrite all 4 policies
-- ============================================================

DROP POLICY IF EXISTS "Team members can view preferences" ON public.memory_book_preferences;
CREATE POLICY "Team members can view preferences"
  ON public.memory_book_preferences
  FOR SELECT
  TO authenticated
  USING ( public.is_team_member(team_id) );

DROP POLICY IF EXISTS "Team owners can insert preferences" ON public.memory_book_preferences;
CREATE POLICY "Team owners can insert preferences"
  ON public.memory_book_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can update preferences" ON public.memory_book_preferences;
CREATE POLICY "Team owners can update preferences"
  ON public.memory_book_preferences
  FOR UPDATE
  TO authenticated
  USING ( public.is_team_owner(team_id) )
  WITH CHECK ( public.is_team_owner(team_id) );

DROP POLICY IF EXISTS "Team owners can delete preferences" ON public.memory_book_preferences;
CREATE POLICY "Team owners can delete preferences"
  ON public.memory_book_preferences
  FOR DELETE
  TO authenticated
  USING ( public.is_team_owner(team_id) );

-- ============================================================
-- 10. observations — rewrite SELECT policy
-- ============================================================

DROP POLICY IF EXISTS "observations_select_policy" ON public.observations;

CREATE POLICY "observations_select_policy"
  ON public.observations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR team_id IN ( SELECT public.get_user_team_ids() )
  );

-- ============================================================
-- 11. responses — rewrite SELECT policy
-- ============================================================

DROP POLICY IF EXISTS "responses_select_own" ON public.responses;

CREATE POLICY "responses_select_own"
  ON public.responses
  FOR SELECT
  TO authenticated
  USING (
    observation_id IN (
      SELECT o.id FROM public.observations o
      WHERE o.user_id = auth.uid()
         OR o.team_id IN ( SELECT public.get_user_team_ids() )
    )
  );
