/*
  Consolidated Schema - Part 3e: RLS Policies (Memory Books, Care Plans, Community, etc.)
*/

-- ===== MEMORY BOOKS =====

CREATE POLICY "Team members can view their memory book" ON public.memory_books
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team owners can create memory book" ON public.memory_books
  FOR INSERT TO authenticated WITH CHECK (public.is_team_owner(team_id));
CREATE POLICY "Team owners can update memory book" ON public.memory_books
  FOR UPDATE TO authenticated USING (public.is_team_owner(team_id)) WITH CHECK (public.is_team_owner(team_id));
CREATE POLICY "Team owners can delete memory book" ON public.memory_books
  FOR DELETE TO authenticated USING (public.is_team_owner(team_id));

-- ===== MEMORY BOOK IDENTITY =====

CREATE POLICY "Team members can view identity" ON public.memory_book_identity
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team owners can insert identity" ON public.memory_book_identity
  FOR INSERT TO authenticated WITH CHECK (public.is_team_owner(team_id));
CREATE POLICY "Team owners can update identity" ON public.memory_book_identity
  FOR UPDATE TO authenticated USING (public.is_team_owner(team_id)) WITH CHECK (public.is_team_owner(team_id));
CREATE POLICY "Team owners can delete identity" ON public.memory_book_identity
  FOR DELETE TO authenticated USING (public.is_team_owner(team_id));

-- ===== MEMORY BOOK CONTACTS =====

CREATE POLICY "Team members can view contacts" ON public.memory_book_contacts
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert contacts" ON public.memory_book_contacts
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update contacts" ON public.memory_book_contacts
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete contacts" ON public.memory_book_contacts
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== MEMORY BOOK MEDICAL =====

CREATE POLICY "Team members can view medical" ON public.memory_book_medical
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team owners can insert medical" ON public.memory_book_medical
  FOR INSERT TO authenticated WITH CHECK (public.is_team_owner(team_id));
CREATE POLICY "Team owners can update medical" ON public.memory_book_medical
  FOR UPDATE TO authenticated USING (public.is_team_owner(team_id)) WITH CHECK (public.is_team_owner(team_id));
CREATE POLICY "Team owners can delete medical" ON public.memory_book_medical
  FOR DELETE TO authenticated USING (public.is_team_owner(team_id));

-- ===== MEMORY BOOK PREFERENCES =====

CREATE POLICY "Team members can view preferences" ON public.memory_book_preferences
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert preferences" ON public.memory_book_preferences
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update preferences" ON public.memory_book_preferences
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete preferences" ON public.memory_book_preferences
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== MEMORY BOOK PROVIDERS =====

CREATE POLICY "Team members can view providers" ON public.memory_book_providers
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert providers" ON public.memory_book_providers
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update providers" ON public.memory_book_providers
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete providers" ON public.memory_book_providers
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== MEMORY BOOK INSURANCE =====

CREATE POLICY "Team members can view insurance" ON public.memory_book_insurance
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert insurance" ON public.memory_book_insurance
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update insurance" ON public.memory_book_insurance
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete insurance" ON public.memory_book_insurance
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== MEMORY BOOK FINANCES =====

CREATE POLICY "Team members can view finances" ON public.memory_book_finances
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert finances" ON public.memory_book_finances
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update finances" ON public.memory_book_finances
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete finances" ON public.memory_book_finances
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== MEMORY BOOK SUBSCRIPTIONS =====

CREATE POLICY "Team members can view mb_subscriptions" ON public.memory_book_subscriptions
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert mb_subscriptions" ON public.memory_book_subscriptions
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update mb_subscriptions" ON public.memory_book_subscriptions
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete mb_subscriptions" ON public.memory_book_subscriptions
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== MEMORY BOOK VEHICLE =====

CREATE POLICY "Team members can view vehicle" ON public.memory_book_vehicle
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert vehicle" ON public.memory_book_vehicle
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update vehicle" ON public.memory_book_vehicle
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can delete vehicle" ON public.memory_book_vehicle
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== REMAINING MEMORY BOOK SUB-TABLES (all same pattern: team members CRUD) =====

CREATE POLICY "select" ON public.memory_book_insurance_entries FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_insurance_entries FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_insurance_entries FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_insurance_entries FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_finance_entries FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_finance_entries FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_finance_entries FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_finance_entries FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_medical_entries FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_medical_entries FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_medical_entries FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_medical_entries FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_preference_entries FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_preference_entries FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_preference_entries FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_preference_entries FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_daily_living_entries FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_daily_living_entries FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_daily_living_entries FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_daily_living_entries FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_social_accounts FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_social_accounts FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_social_accounts FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_social_accounts FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_household_providers FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_household_providers FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_household_providers FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_household_providers FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_vehicle_care FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_vehicle_care FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_vehicle_care FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_vehicle_care FOR DELETE TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "select" ON public.memory_book_home_address FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "insert" ON public.memory_book_home_address FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "update" ON public.memory_book_home_address FOR UPDATE TO authenticated USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "delete" ON public.memory_book_home_address FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- ===== CARE PLANS =====

CREATE POLICY "Active team members can view care plan" ON public.care_plans
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = care_plans.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active'
  ));
CREATE POLICY "Team owner can create care plan" ON public.care_plans
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = care_plans.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active' AND cv_team_members.role = 'owner'
  ));
CREATE POLICY "Team owner can update care plan" ON public.care_plans
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = care_plans.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active' AND cv_team_members.role = 'owner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = care_plans.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active' AND cv_team_members.role = 'owner'
  ));
CREATE POLICY "Team owner can delete care plan" ON public.care_plans
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = care_plans.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active' AND cv_team_members.role = 'owner'
  ));

-- ===== CARE PLAN SECTIONS =====

CREATE POLICY "Active team members can view care plan sections" ON public.care_plan_sections
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM care_plans cp JOIN cv_team_members tm ON tm.team_id = cp.team_id WHERE cp.id = care_plan_sections.care_plan_id AND tm.user_id = auth.uid() AND tm.state = 'active'
  ));
CREATE POLICY "Team owner can create care plan sections" ON public.care_plan_sections
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM care_plans cp JOIN cv_team_members tm ON tm.team_id = cp.team_id WHERE cp.id = care_plan_sections.care_plan_id AND tm.user_id = auth.uid() AND tm.state = 'active' AND tm.role = 'owner'
  ));
CREATE POLICY "Team owner can update care plan sections" ON public.care_plan_sections
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM care_plans cp JOIN cv_team_members tm ON tm.team_id = cp.team_id WHERE cp.id = care_plan_sections.care_plan_id AND tm.user_id = auth.uid() AND tm.state = 'active' AND tm.role = 'owner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM care_plans cp JOIN cv_team_members tm ON tm.team_id = cp.team_id WHERE cp.id = care_plan_sections.care_plan_id AND tm.user_id = auth.uid() AND tm.state = 'active' AND tm.role = 'owner'
  ));
CREATE POLICY "Team owner can delete care plan sections" ON public.care_plan_sections
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM care_plans cp JOIN cv_team_members tm ON tm.team_id = cp.team_id WHERE cp.id = care_plan_sections.care_plan_id AND tm.user_id = auth.uid() AND tm.state = 'active' AND tm.role = 'owner'
  ));

-- ===== USER ONBOARDING =====

CREATE POLICY "Users can read own onboarding" ON public.user_onboarding
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON public.user_onboarding
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== GUEST TOKENS =====

CREATE POLICY "Team members can view guest tokens for their team" ON public.cv_guest_tokens
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = cv_guest_tokens.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active'
  ));
CREATE POLICY "Authenticated users can create guest tokens for their team" ON public.cv_guest_tokens
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = invited_by_user_id
    AND EXISTS (SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = cv_guest_tokens.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active')
  );
CREATE POLICY "Team members can delete unconsumed guest tokens" ON public.cv_guest_tokens
  FOR DELETE TO authenticated
  USING (
    consumed_at IS NULL
    AND EXISTS (SELECT 1 FROM cv_team_members WHERE cv_team_members.team_id = cv_guest_tokens.team_id AND cv_team_members.user_id = auth.uid() AND cv_team_members.state = 'active')
  );

-- ===== COMMUNITY PROFILES =====

CREATE POLICY "Anyone can view community profiles" ON public.community_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own community profile" ON public.community_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ===== COMMUNITY POSTS =====

CREATE POLICY "Anyone can view active posts" ON public.community_posts
  FOR SELECT TO authenticated USING (post_status = 'active' OR author_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "Authors can update own posts" ON public.community_posts
  FOR UPDATE TO authenticated USING (author_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Authors can delete own posts" ON public.community_posts
  FOR DELETE TO authenticated USING (author_user_id = auth.uid() OR public.is_admin());

-- ===== COMMUNITY REPLIES =====

CREATE POLICY "Anyone can view active replies" ON public.community_replies
  FOR SELECT TO authenticated USING (reply_status = 'active' OR author_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Authenticated users can create replies" ON public.community_replies
  FOR INSERT TO authenticated WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "Authors can update own replies" ON public.community_replies
  FOR UPDATE TO authenticated USING (author_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Authors can delete own replies" ON public.community_replies
  FOR DELETE TO authenticated USING (author_user_id = auth.uid() OR public.is_admin());

-- ===== COMMUNITY REACTIONS =====

CREATE POLICY "Anyone can view reactions" ON public.community_reactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add reactions" ON public.community_reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove own reactions" ON public.community_reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ===== COMMUNITY REPORTS =====

CREATE POLICY "Users can create reports" ON public.community_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_user_id = auth.uid());
CREATE POLICY "Admins can view reports" ON public.community_reports
  FOR SELECT TO authenticated USING (reporter_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can update reports" ON public.community_reports
  FOR UPDATE TO authenticated USING (public.is_admin());

-- ===== COMMUNITY BANS =====

CREATE POLICY "Admins can view bans" ON public.community_bans
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can manage bans" ON public.community_bans
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update bans" ON public.community_bans
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete bans" ON public.community_bans
  FOR DELETE TO authenticated USING (public.is_admin());

-- ===== COMMUNITY NOTIFICATIONS =====

CREATE POLICY "Users can view own notifications" ON public.community_notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.community_notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ===== EMAIL AUDIT LOG =====

CREATE POLICY "Admins can view email audit log" ON public.email_audit_log
  FOR SELECT TO authenticated USING (public.is_admin());
