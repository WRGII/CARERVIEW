/*
  # Comprehensive Security Fixes
  
  ## Overview
  Addresses all security issues identified in Supabase security scan:
  1. Add missing indexes for foreign keys
  2. Optimize RLS policies with SELECT auth.uid()
  3. Remove duplicate and unused indexes
  4. Add RLS policies for tables without them
  5. Fix function search paths
  6. Enable RLS on public tables
  
  ## Security Impact
  - Improved query performance (foreign key indexes)
  - Reduced RLS overhead (auth.uid() optimization)
  - Better security coverage (missing policies)
  - Prevents schema hijacking (function search paths)
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- cv_team foreign key indexes
CREATE INDEX IF NOT EXISTS idx_cv_team_owner_user_id 
  ON public.cv_team(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_cv_team_plan_id 
  ON public.cv_team(plan_id);

-- cv_team_invites foreign key indexes
CREATE INDEX IF NOT EXISTS idx_cv_team_invites_team_id 
  ON public.cv_team_invites(team_id);

CREATE INDEX IF NOT EXISTS idx_cv_team_invites_created_by 
  ON public.cv_team_invites(created_by);

-- cv_team_members foreign key indexes
CREATE INDEX IF NOT EXISTS idx_cv_team_members_user_id 
  ON public.cv_team_members(user_id);

-- profiles foreign key indexes
CREATE INDEX IF NOT EXISTS idx_profiles_active_team_id 
  ON public.profiles(active_team_id);

-- user_subscriptions foreign key indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id 
  ON public.user_subscriptions(plan_id);

-- =====================================================
-- 2. REMOVE DUPLICATE INDEXES
-- =====================================================

-- Drop duplicate index (keeping observations_user_form_type_idx)
DROP INDEX IF EXISTS public.idx_observations_user_form_type_idx;

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES WITH SELECT AUTH.UID()
-- =====================================================

-- Profiles table policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (id = (SELECT auth.uid()));

-- Observations table policies
DROP POLICY IF EXISTS "observations_select_policy" ON public.observations;
CREATE POLICY "observations_select_policy" 
  ON public.observations 
  FOR SELECT 
  TO authenticated 
  USING (
    user_id = (SELECT auth.uid()) 
    OR team_id IN (
      SELECT team_id 
      FROM public.cv_team_members 
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "observations_insert_policy" ON public.observations;
CREATE POLICY "observations_insert_policy" 
  ON public.observations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    user_id = (SELECT auth.uid()) 
    AND (
      team_id IS NULL 
      OR team_id IN (
        SELECT team_id 
        FROM public.cv_team_members 
        WHERE user_id = (SELECT auth.uid()) AND state = 'active'
      )
    )
  );

DROP POLICY IF EXISTS "observations_update_policy" ON public.observations;
CREATE POLICY "observations_update_policy" 
  ON public.observations 
  FOR UPDATE 
  TO authenticated 
  USING (author_user_id = (SELECT auth.uid()))
  WITH CHECK (author_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "observations_delete_policy" ON public.observations;
CREATE POLICY "observations_delete_policy" 
  ON public.observations 
  FOR DELETE 
  TO authenticated 
  USING (author_user_id = (SELECT auth.uid()));

-- User subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- 4. ADD RLS POLICIES FOR TABLES WITHOUT THEM
-- =====================================================

-- cv_team policies
DROP POLICY IF EXISTS "Team owners can view their teams" ON public.cv_team;
CREATE POLICY "Team owners can view their teams"
  ON public.cv_team
  FOR SELECT
  TO authenticated
  USING (owner_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Team members can view their teams" ON public.cv_team;
CREATE POLICY "Team members can view their teams"
  ON public.cv_team
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id 
      FROM public.cv_team_members 
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Team owners can update their teams" ON public.cv_team;
CREATE POLICY "Team owners can update their teams"
  ON public.cv_team
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = (SELECT auth.uid()))
  WITH CHECK (owner_user_id = (SELECT auth.uid()));

-- cv_team_members policies
DROP POLICY IF EXISTS "Team owners can view members" ON public.cv_team_members;
CREATE POLICY "Team owners can view members"
  ON public.cv_team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM public.cv_team WHERE owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Team members can view other members" ON public.cv_team_members;
CREATE POLICY "Team members can view other members"
  ON public.cv_team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM public.cv_team_members 
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.cv_team_members;
CREATE POLICY "Users can view their own memberships"
  ON public.cv_team_members
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- cv_team_invites policies
DROP POLICY IF EXISTS "Team owners can view invites" ON public.cv_team_invites;
CREATE POLICY "Team owners can view invites"
  ON public.cv_team_invites
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM public.cv_team WHERE owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Team owners can delete invites" ON public.cv_team_invites;
CREATE POLICY "Team owners can delete invites"
  ON public.cv_team_invites
  FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM public.cv_team WHERE owner_user_id = (SELECT auth.uid())
    )
  );

-- cv_team_patient policies
DROP POLICY IF EXISTS "Team owners can view patient info" ON public.cv_team_patient;
CREATE POLICY "Team owners can view patient info"
  ON public.cv_team_patient
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM public.cv_team WHERE owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Team members can view patient info" ON public.cv_team_patient;
CREATE POLICY "Team members can view patient info"
  ON public.cv_team_patient
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM public.cv_team_members 
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Team owners can update patient info" ON public.cv_team_patient;
CREATE POLICY "Team owners can update patient info"
  ON public.cv_team_patient
  FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM public.cv_team WHERE owner_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM public.cv_team WHERE owner_user_id = (SELECT auth.uid())
    )
  );

-- stripe_orders policies (admin only)
DROP POLICY IF EXISTS "Service role can manage stripe orders" ON public.stripe_orders;
CREATE POLICY "Service role can manage stripe orders"
  ON public.stripe_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- stripe_subscriptions policies (admin only)
DROP POLICY IF EXISTS "Service role can manage stripe subscriptions" ON public.stripe_subscriptions;
CREATE POLICY "Service role can manage stripe subscriptions"
  ON public.stripe_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. ENABLE RLS ON PUBLIC TABLES
-- =====================================================

-- subscription_plans (read-only for all)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans
  FOR SELECT
  TO public
  USING (true);

-- cv_plan_limits (read-only for authenticated)
ALTER TABLE public.cv_plan_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view plan limits" ON public.cv_plan_limits;
CREATE POLICY "Authenticated users can view plan limits"
  ON public.cv_plan_limits
  FOR SELECT
  TO authenticated
  USING (true);

-- admin_events (admin only)
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage admin events" ON public.admin_events;
CREATE POLICY "Service role can manage admin events"
  ON public.admin_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- app_secrets (service role only)
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage app secrets" ON public.app_secrets;
CREATE POLICY "Service role can manage app secrets"
  ON public.app_secrets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. FIX FUNCTION SEARCH PATHS
-- =====================================================

ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_check_team_seats(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_accept_invite(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_create_invite(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_get_active_team() SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_set_active_team(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_list_members(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.cv_get_remaining(uuid) SET search_path = public, pg_temp;

-- =====================================================
-- VERIFICATION COMMENTS
-- =====================================================

COMMENT ON INDEX idx_cv_team_owner_user_id IS 'Performance: Covers foreign key for team owner lookups';
COMMENT ON INDEX idx_cv_team_plan_id IS 'Performance: Covers foreign key for plan enforcement queries';
COMMENT ON INDEX idx_cv_team_invites_team_id IS 'Performance: Covers foreign key for invite lookups by team';
COMMENT ON INDEX idx_cv_team_invites_created_by IS 'Performance: Covers foreign key for tracking who created invites';
COMMENT ON INDEX idx_cv_team_members_user_id IS 'Performance: Covers foreign key for user membership queries';
COMMENT ON INDEX idx_profiles_active_team_id IS 'Performance: Covers foreign key for active team lookups';
COMMENT ON INDEX idx_user_subscriptions_plan_id IS 'Performance: Covers foreign key for plan-based queries';

-- Add enforce_team_observation_quota function (no args)
ALTER FUNCTION public.enforce_team_observation_quota() SET search_path = public, pg_temp;
