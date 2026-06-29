/*
  Consolidated Schema - Part 3d: Row Level Security Policies
*/

-- ===== ENABLE RLS ON ALL TABLES =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team_patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_vehicle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_insurance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_medical_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_preference_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_daily_living_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_household_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_vehicle_care ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_book_home_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_guest_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ===== PUBLIC READ TABLES =====

CREATE POLICY "legend_public_read" ON public.legend FOR SELECT TO public USING (true);
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "questions_public_read" ON public.questions FOR SELECT TO public USING (true);
CREATE POLICY "locales_public_read" ON public.supported_locales FOR SELECT TO public USING (true);
CREATE POLICY "translations_public_read" ON public.ui_translations FOR SELECT TO public USING (true);
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "community_rooms_public_read" ON public.community_rooms FOR SELECT TO public USING (true);

-- ===== PROFILES =====

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

-- ===== OBSERVATIONS =====

CREATE POLICY "observations_select_policy" ON public.observations
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT public.get_user_team_ids())
  );

CREATE POLICY "observations_insert_policy" ON public.observations
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      team_id IS NULL
      OR team_id IN (SELECT public.get_active_team_ids())
    )
  );

CREATE POLICY "observations_update_own" ON public.observations
  FOR UPDATE TO authenticated
  USING (
    author_user_id = auth.uid() OR (author_user_id IS NULL AND user_id = auth.uid())
  );

CREATE POLICY "observations_delete_own" ON public.observations
  FOR DELETE TO authenticated
  USING (
    author_user_id = auth.uid() OR (author_user_id IS NULL AND user_id = auth.uid())
  );

-- ===== RESPONSES =====

CREATE POLICY "responses_select_own" ON public.responses
  FOR SELECT TO authenticated
  USING (
    observation_id IN (
      SELECT o.id FROM public.observations o
      WHERE o.user_id = auth.uid()
         OR o.team_id IN (SELECT public.get_user_team_ids())
    )
  );

CREATE POLICY "responses_insert_own" ON public.responses
  FOR INSERT TO authenticated
  WITH CHECK (
    observation_id IN (
      SELECT o.id FROM public.observations o WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "responses_update_own" ON public.responses
  FOR UPDATE TO authenticated
  USING (
    observation_id IN (
      SELECT o.id FROM public.observations o WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "responses_delete_own" ON public.responses
  FOR DELETE TO authenticated
  USING (
    observation_id IN (
      SELECT o.id FROM public.observations o WHERE o.user_id = auth.uid()
    )
  );

-- ===== CV_TEAM =====

CREATE POLICY "Users can view their teams" ON public.cv_team
  FOR SELECT TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR public.is_team_member(id)
  );

-- ===== CV_TEAM_MEMBERS =====

CREATE POLICY "Users can view team memberships" ON public.cv_team_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_team_member(team_id)
  );

-- ===== CV_TEAM_PATIENT =====

CREATE POLICY "Users can view team patient info" ON public.cv_team_patient
  FOR SELECT TO authenticated
  USING (public.is_team_member(team_id));

CREATE POLICY "Team owners can update patient" ON public.cv_team_patient
  FOR UPDATE TO authenticated
  USING (public.is_team_owner(team_id))
  WITH CHECK (public.is_team_owner(team_id));

-- ===== CV_TEAM_INVITES =====

CREATE POLICY "Team members can view invites" ON public.cv_team_invites
  FOR SELECT TO authenticated
  USING (public.is_team_member(team_id));

-- ===== USER_SUBSCRIPTIONS =====

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ===== STRIPE_CUSTOMERS =====

CREATE POLICY "Users can view own stripe customer" ON public.stripe_customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ===== STRIPE_SUBSCRIPTIONS =====

CREATE POLICY "Users can view own stripe subscription" ON public.stripe_subscriptions
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT sc.customer_id FROM public.stripe_customers sc WHERE sc.user_id = auth.uid()
    )
  );
