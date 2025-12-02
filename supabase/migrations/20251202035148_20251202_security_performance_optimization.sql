/*
  # Security and Performance Optimization
  
  1. Unindexed Foreign Keys
    - Add index on admin_roles.granted_by (foreign key without covering index)
  
  2. Auth RLS Optimization
    - Fix profiles_insert_own policy to use subquery: (select auth.uid())
    - This prevents re-evaluation of auth.uid() for each row, improving performance
  
  3. Unused Index Cleanup
    - Drop 25 unused indexes that add maintenance overhead without benefit
    - Indexes identified by Supabase query planner as unused
  
  4. Multiple Permissive Policies Consolidation
    - Consolidate cv_team SELECT policies (2 permissive → 1 with OR)
    - Consolidate cv_team_members SELECT policies (3 permissive → 1 with OR)
    - Consolidate cv_team_patient SELECT policies (2 permissive → 1 with OR)
    - Improves query planning and reduces policy evaluation overhead
  
  5. Security Impact
    - No functional changes to security model
    - All existing access patterns preserved
    - Better performance at scale
    - Reduced index maintenance overhead
*/

-- ============================================================================
-- 1. Add Missing Index for Foreign Key
-- ============================================================================

-- Index for admin_roles.granted_by foreign key (admin_roles_granted_by_fkey)
CREATE INDEX IF NOT EXISTS idx_admin_roles_granted_by 
  ON public.admin_roles(granted_by);

-- ============================================================================
-- 2. Fix RLS Policy to Use Subquery (Performance Optimization)
-- ============================================================================

-- Drop and recreate profiles_insert_own with subquery optimization
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- 3. Drop All Unused Indexes
-- ============================================================================

-- Observations table unused indexes
DROP INDEX IF EXISTS public.observations_user_form_type_idx;
DROP INDEX IF EXISTS public.idx_observations_user_id;
DROP INDEX IF EXISTS public.idx_observations_team_id;
DROP INDEX IF EXISTS public.idx_observations_caregiver_email;
DROP INDEX IF EXISTS public.idx_observations_caregiver_name;

-- User subscriptions table unused indexes
DROP INDEX IF EXISTS public.idx_user_subscriptions_user_id;
DROP INDEX IF EXISTS public.idx_user_subscriptions_status;
DROP INDEX IF EXISTS public.idx_user_subscriptions_plan_id;

-- Responses table unused indexes
DROP INDEX IF EXISTS public.idx_responses_observation_id;
DROP INDEX IF EXISTS public.idx_responses_question_id;

-- Questions table unused indexes
DROP INDEX IF EXISTS public.idx_questions_category_id;

-- CV team tables unused indexes
DROP INDEX IF EXISTS public.idx_cv_team_members_user_id;
DROP INDEX IF EXISTS public.idx_cv_team_owner_user_id;
DROP INDEX IF EXISTS public.idx_cv_team_plan_id;
DROP INDEX IF EXISTS public.idx_cv_team_invites_team_id;
DROP INDEX IF EXISTS public.idx_cv_team_invites_created_by;

-- Profiles table unused indexes
DROP INDEX IF EXISTS public.idx_profiles_active_team_id;

-- Admin roles unused indexes
DROP INDEX IF EXISTS public.idx_admin_roles_granted_at;

-- Rate limiting unused indexes
DROP INDEX IF EXISTS public.idx_rate_limits_window_end;
DROP INDEX IF EXISTS public.idx_rate_limits_identifier;
DROP INDEX IF EXISTS public.idx_rate_limit_log_identifier_endpoint_window;
DROP INDEX IF EXISTS public.idx_rate_limit_log_window_end;

-- Webhook events unused indexes
DROP INDEX IF EXISTS public.idx_webhook_events_event_type;
DROP INDEX IF EXISTS public.idx_webhook_events_processed_at;
DROP INDEX IF EXISTS public.idx_webhook_events_status;

-- ============================================================================
-- 4. Consolidate Multiple Permissive RLS Policies
-- ============================================================================

-- Consolidate cv_team SELECT policies (2 permissive → 1 with OR)
DROP POLICY IF EXISTS "Team members can view their teams" ON public.cv_team;
DROP POLICY IF EXISTS "Team owners can view their teams" ON public.cv_team;

CREATE POLICY "Users can view their teams"
  ON public.cv_team
  FOR SELECT
  TO authenticated
  USING (
    -- User is owner
    owner_user_id = (select auth.uid())
    OR
    -- User is a member
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = cv_team.id
      AND cv_team_members.user_id = (select auth.uid())
    )
  );

-- Consolidate cv_team_members SELECT policies (3 permissive → 1 with OR)
DROP POLICY IF EXISTS "Team members can view other members" ON public.cv_team_members;
DROP POLICY IF EXISTS "Team owners can view members" ON public.cv_team_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.cv_team_members;

CREATE POLICY "Users can view team memberships"
  ON public.cv_team_members
  FOR SELECT
  TO authenticated
  USING (
    -- User is viewing their own membership
    user_id = (select auth.uid())
    OR
    -- User is a member of the same team
    EXISTS (
      SELECT 1 FROM cv_team_members AS other_members
      WHERE other_members.team_id = cv_team_members.team_id
      AND other_members.user_id = (select auth.uid())
    )
    OR
    -- User is the team owner
    EXISTS (
      SELECT 1 FROM cv_team
      WHERE cv_team.id = cv_team_members.team_id
      AND cv_team.owner_user_id = (select auth.uid())
    )
  );

-- Consolidate cv_team_patient SELECT policies (2 permissive → 1 with OR)
DROP POLICY IF EXISTS "Team members can view patient info" ON public.cv_team_patient;
DROP POLICY IF EXISTS "Team owners can view patient info" ON public.cv_team_patient;

CREATE POLICY "Users can view team patient info"
  ON public.cv_team_patient
  FOR SELECT
  TO authenticated
  USING (
    -- User is team owner
    EXISTS (
      SELECT 1 FROM cv_team
      WHERE cv_team.id = cv_team_patient.team_id
      AND cv_team.owner_user_id = (select auth.uid())
    )
    OR
    -- User is team member
    EXISTS (
      SELECT 1 FROM cv_team_members
      WHERE cv_team_members.team_id = cv_team_patient.team_id
      AND cv_team_members.user_id = (select auth.uid())
    )
  );
