/*
  # Phase 1: Care Plan, Care Hub, and Resident Profile i18n Translation Keys

  ## Summary
  Seeds all English (en) and Spanish stub (es) translation keys for four new namespaces:

  1. **care_plan** — All strings used inside the six section forms (SituationForm,
     AuthorityForm, ResponsibilitiesForm, LivingArrangementForm, SustainabilityForm,
     ReviewForm) and the SectionFormModal container.

  2. **care_plan_gaps** — All gap detection strings from carePlanGaps.ts: every gap
     label, action string, and sustainability flag message.

  3. **care_hub** — All strings from CareHubPage, CarePlanBuilderPage,
     CarePlanSummaryPage, DashboardCarePlanPanel, and CarePlanStatusPanel.

  4. **resident_profile** — All strings from ResidentProfilePage: field labels,
     section headings, placeholders, toast messages, and gender option values.

  ## Spanish values
  All Spanish values are seeded as stubs prefixed with [ES] so the admin editor
  can identify strings that still need human translation.

  ## Security
  No schema changes — only INSERT/UPDATE on existing ui_translations table (already RLS-protected).
*/

INSERT INTO ui_translations (key, locale, value) VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- NAMESPACE: care_plan  (section forms + SectionFormModal)
-- ─────────────────────────────────────────────────────────────────────────────

-- SectionFormModal
('care_plan.modal_section_of', 'en', 'Section {current} of {total}'),
('care_plan.modal_close', 'en', 'Close'),
('care_plan.modal_read_only_notice', 'en', 'You can view this section but only the team owner can make changes.'),
('care_plan.modal_unsaved_changes', 'en', 'You have unsaved changes. Leave without saving?'),
('care_plan.modal_save_error', 'en', 'Save failed. Please check your connection and try again.'),
('care_plan.modal_save', 'en', 'Save'),
('care_plan.modal_saving', 'en', 'Saving\u2026'),
('care_plan.modal_saved', 'en', 'Saved'),
('care_plan.modal_mark_complete', 'en', 'Mark complete'),

-- SituationForm — preamble
('care_plan.situation_preamble', 'en', 'Describe the current care situation at a high level. This section should capture the big picture \u2014 not clinical detail (that belongs in the Memory Book).'),

-- SituationForm — fields
('care_plan.situation_field_current_label', 'en', 'What is the current care situation?'),
('care_plan.situation_field_current_hint', 'en', 'A brief summary of what has led to the caring role and what care is currently needed.'),
('care_plan.situation_field_current_placeholder', 'en', 'e.g. Mum was diagnosed with early-stage dementia in January. She lives alone and has been managing well but is starting to need daily support with medications and appointments\u2026'),

('care_plan.situation_field_trigger_label', 'en', 'What changed recently that triggered the need for more care?'),
('care_plan.situation_field_trigger_hint', 'en', 'A specific event, decline, or decision that brought things to a head.'),
('care_plan.situation_field_trigger_placeholder', 'en', 'e.g. A fall at home in March, a hospital stay, a GP referral, or a noticeable change in capacity\u2026'),

('care_plan.situation_field_concerns_label', 'en', 'What are the biggest concerns right now?'),
('care_plan.situation_field_concerns_hint', 'en', 'Select all that apply.'),

('care_plan.situation_field_changes_label', 'en', 'What may change over the next 6\u201312 months?'),
('care_plan.situation_field_changes_hint', 'en', 'Think about health trajectory, family availability, finances, and living arrangements.'),
('care_plan.situation_field_changes_placeholder', 'en', 'e.g. Needs are likely to increase as dementia progresses. One sibling may be relocating and will be less available\u2026'),

('care_plan.situation_field_urgent_label', 'en', 'What decisions feel most urgent right now?'),
('care_plan.situation_field_urgent_hint', 'en', 'What needs to be resolved in the next few weeks, before it becomes a crisis?'),
('care_plan.situation_field_urgent_placeholder', 'en', 'e.g. Whether to arrange daily check-ins, whether to apply for a formal assessment, who will manage medications\u2026'),

-- SituationForm — concern category chips
('care_plan.situation_concern_health', 'en', 'Health and medical management'),
('care_plan.situation_concern_safety', 'en', 'Safety at home'),
('care_plan.situation_concern_medication', 'en', 'Medication management'),
('care_plan.situation_concern_family_comm', 'en', 'Family communication and disagreements'),
('care_plan.situation_concern_financial', 'en', 'Financial and legal matters'),
('care_plan.situation_concern_transport', 'en', 'Transport and appointments'),
('care_plan.situation_concern_personal_care', 'en', 'Personal care and daily living'),
('care_plan.situation_concern_emotional', 'en', 'Emotional and mental wellbeing'),
('care_plan.situation_concern_housing', 'en', 'Housing and living arrangements'),
('care_plan.situation_concern_carer', 'en', 'Caregiver capacity and burnout'),

-- SituationForm — memory book callout
('care_plan.situation_mb_callout_title', 'en', 'Health details belong in the Memory Book'),
('care_plan.situation_mb_callout_body', 'en', 'Diagnoses, medications, providers, and medical history are captured in the Memory Book health section \u2014 not here.'),
('care_plan.situation_mb_callout_link', 'en', 'Update resident health details in Memory Book'),

-- AuthorityForm — preamble
('care_plan.authority_preamble', 'en', 'Authority must be established, not assumed. Being the nearest relative does not automatically mean having legal authority over health decisions, finances, or records. Use this section to map what is in place and what still needs to be resolved.'),

-- AuthorityForm — status options
('care_plan.authority_status_confirmed', 'en', 'Confirmed'),
('care_plan.authority_status_unclear', 'en', 'Unclear'),
('care_plan.authority_status_missing', 'en', 'Missing'),
('care_plan.authority_status_not_applicable', 'en', 'Not applicable'),

-- AuthorityForm — field labels and hints
('care_plan.authority_field_health_label', 'en', 'Health decision authority'),
('care_plan.authority_field_health_hint', 'en', 'Who is authorised to speak to medical teams, access records, and make treatment decisions if the person cannot?'),
('care_plan.authority_field_financial_label', 'en', 'Financial authority'),
('care_plan.authority_field_financial_hint', 'en', 'Who can manage bank accounts, pay bills, access pensions, and make financial decisions?'),
('care_plan.authority_field_legal_label', 'en', 'Legal documents'),
('care_plan.authority_field_legal_hint', 'en', 'Are the relevant legal arrangements in place (e.g. power of attorney, advance directive, guardianship)?'),
('care_plan.authority_field_preferences_label', 'en', 'Care preferences documented'),
('care_plan.authority_field_preferences_hint', 'en', 'Has the person expressed their wishes about care, living arrangements, and medical treatment? Are those wishes documented?'),
('care_plan.authority_field_records_label', 'en', 'Organised records and document location'),
('care_plan.authority_field_records_hint', 'en', 'Is there one place where critical documents, account details, and contacts are stored and accessible to the right people?'),
('care_plan.authority_field_emergency_label', 'en', 'Emergency readiness'),
('care_plan.authority_field_emergency_hint', 'en', 'In an emergency, can the right information be found quickly? Does the right person have access?'),

-- AuthorityForm — placeholders and disclaimer
('care_plan.authority_placeholder_person', 'en', 'Person responsible / document holder'),
('care_plan.authority_placeholder_notes', 'en', 'Notes, document location, or gaps to resolve'),
('care_plan.authority_disclaimer', 'en', 'This section helps organise information and identify gaps. It is not legal advice. If authority is unclear or contested, consult a qualified professional in your jurisdiction.'),

-- ResponsibilitiesForm — preamble
('care_plan.resp_preamble', 'en', 'Map who owns each responsibility area. The key question is not \u201cwho cares most\u201d \u2014 it is \u201cwho owns which responsibility.\u201d For each area, note a responsible person, a backup, and any gaps.'),

-- ResponsibilitiesForm — area labels and descriptions
('care_plan.resp_area_household_label', 'en', 'Household support'),
('care_plan.resp_area_household_desc', 'en', 'Meals, cleaning, shopping, home maintenance, and daily domestic tasks.'),
('care_plan.resp_area_personal_care_label', 'en', 'Personal care and mobility'),
('care_plan.resp_area_personal_care_desc', 'en', 'Bathing, dressing, continence care, mobility assistance, and physical safety.'),
('care_plan.resp_area_emotional_label', 'en', 'Emotional support'),
('care_plan.resp_area_emotional_desc', 'en', 'Companionship, conversation, checking in, and reducing isolation.'),
('care_plan.resp_area_health_label', 'en', 'Health and medical coordination'),
('care_plan.resp_area_health_desc', 'en', 'Appointments, medications, test results, provider communication, and care notes.'),
('care_plan.resp_area_scheduling_label', 'en', 'Appointments and transport'),
('care_plan.resp_area_scheduling_desc', 'en', 'Coordinating between family members, managing appointments and transport.'),
('care_plan.resp_area_admin_label', 'en', 'Financial and administrative tasks'),
('care_plan.resp_area_admin_desc', 'en', 'Bills, accounts, benefits, documents, and any legal authority arrangements.'),
('care_plan.resp_area_respite_label', 'en', 'Backup and respite coverage'),
('care_plan.resp_area_respite_desc', 'en', 'Covering for the primary carer, providing breaks, and being available in an emergency.'),

-- ResponsibilitiesForm — status options
('care_plan.resp_status_assigned', 'en', 'Assigned'),
('care_plan.resp_status_unclear', 'en', 'Unclear'),
('care_plan.resp_status_gap', 'en', 'Gap'),

-- ResponsibilitiesForm — placeholders
('care_plan.resp_placeholder_person', 'en', 'Responsible person'),
('care_plan.resp_placeholder_backup', 'en', 'Backup person'),
('care_plan.resp_placeholder_notes', 'en', 'Notes or gaps to resolve'),

-- LivingArrangementForm — preamble
('care_plan.living_preamble', 'en', 'Where care happens is one of the most consequential decisions in the caring role. Think strategically, not just about what feels right in the moment.'),

-- LivingArrangementForm — arrangement options
('care_plan.living_opt_resident_home_label', 'en', 'Resident stays in their own home'),
('care_plan.living_opt_resident_home_desc', 'en', 'Often preferred for independence and familiarity. Requires honest safety assessment.'),
('care_plan.living_opt_family_home_label', 'en', 'Resident moves into a family home'),
('care_plan.living_opt_family_home_desc', 'en', 'Requires clear thinking about space, supervision, impact on household, and long-term viability.'),
('care_plan.living_opt_paid_in_home_label', 'en', 'Paid in-home support'),
('care_plan.living_opt_paid_in_home_desc', 'en', 'Professional carers visiting. Costs and availability vary significantly by area.'),
('care_plan.living_opt_assisted_label', 'en', 'Assisted living or residential care'),
('care_plan.living_opt_assisted_desc', 'en', 'Appropriate when care needs exceed what can be safely managed at home.'),
('care_plan.living_opt_undecided_label', 'en', 'Undecided / still assessing'),

-- LivingArrangementForm — fields
('care_plan.living_field_arrangement_label', 'en', 'What is the current living arrangement?'),
('care_plan.living_field_working_label', 'en', 'Is this arrangement currently working?'),
('care_plan.living_field_working_hint', 'en', 'Be honest \u2014 what is actually happening vs. what the plan assumes.'),
('care_plan.living_working_yes', 'en', 'Yes'),
('care_plan.living_working_mostly', 'en', 'Mostly'),
('care_plan.living_working_struggling', 'en', 'Struggling'),
('care_plan.living_working_no', 'en', 'No'),
('care_plan.living_field_safety_label', 'en', 'What are the main safety or supervision concerns?'),
('care_plan.living_field_safety_hint', 'en', 'Fall risks, medication risks, unsupervised overnight, mobility issues, etc.'),
('care_plan.living_field_safety_placeholder', 'en', 'e.g. Unsteady on stairs, cannot manage medications independently, needs overnight check\u2026'),
('care_plan.living_field_alternatives_label', 'en', 'What alternatives are being considered?'),
('care_plan.living_field_alternatives_hint', 'en', 'Other options that have been discussed or may need to be evaluated.'),
('care_plan.living_field_alternatives_placeholder', 'en', 'e.g. Assessing a nearby residential facility, exploring daily home care visits\u2026'),
('care_plan.living_field_triggers_label', 'en', 'What would trigger a change in living arrangement?'),
('care_plan.living_field_triggers_hint', 'en', 'Select any that apply.'),
('care_plan.living_field_constraints_label', 'en', 'Financial or family constraints affecting this decision'),
('care_plan.living_field_constraints_hint', 'en', 'Cost limits, family capacity, willingness, or practical constraints.'),
('care_plan.living_field_constraints_placeholder', 'en', 'e.g. Residential care is financially out of reach without selling the family home. One sibling disagrees with moving Mum\u2026'),

-- LivingArrangementForm — change trigger chips
('care_plan.living_trigger_safety', 'en', 'Safety incident or fall'),
('care_plan.living_trigger_health', 'en', 'Significant health decline'),
('care_plan.living_trigger_burnout', 'en', 'Caregiver burnout or unavailability'),
('care_plan.living_trigger_capacity', 'en', 'Care needs exceed current capacity'),
('care_plan.living_trigger_financial', 'en', 'Financial constraints'),
('care_plan.living_trigger_family', 'en', 'Family agreement breaks down'),
('care_plan.living_trigger_provider', 'en', 'Provider or service change'),

-- LivingArrangementForm — worksheet callout
('care_plan.living_worksheet_title', 'en', 'Supporting worksheet'),
('care_plan.living_worksheet_link', 'en', 'Read the Home, Housing and Care Setting guide \u2192'),

-- SustainabilityForm — preamble
('care_plan.sustain_preamble', 'en', 'The caregiver is not an unlimited resource. A care plan that does not account for the carer\u2019s own limits, needs, and sustainability is not a complete plan.'),

-- SustainabilityForm — fields
('care_plan.sustain_field_primary_label', 'en', 'Who is the primary caregiver?'),
('care_plan.sustain_field_primary_placeholder', 'en', 'Name and relationship to the resident'),
('care_plan.sustain_field_hours_label', 'en', 'How many hours per week is the primary caregiver realistically available?'),
('care_plan.sustain_field_stress_label', 'en', 'What is the current stress or overload level for the primary caregiver?'),
('care_plan.sustain_field_factors_label', 'en', 'What stress or overload factors are currently present?'),
('care_plan.sustain_field_factors_hint', 'en', 'Select all that apply.'),
('care_plan.sustain_field_backup_label', 'en', 'Who provides backup when the primary caregiver is unavailable?'),
('care_plan.sustain_field_backup_placeholder', 'en', 'Name and relationship, or \u2018not yet identified\u2019'),
('care_plan.sustain_field_respite_label', 'en', 'What respite or relief is currently in place?'),
('care_plan.sustain_field_respite_hint', 'en', 'Respite is not a luxury. It is a maintenance requirement. Be specific.'),
('care_plan.sustain_field_respite_placeholder', 'en', 'e.g. Sibling covers every second weekend. Home care visits Tuesday and Thursday mornings\u2026'),
('care_plan.sustain_field_threshold_label', 'en', 'What would indicate the current plan is no longer sustainable?'),
('care_plan.sustain_field_threshold_hint', 'en', 'What signs would trigger a conversation about reducing or redistributing the care load?'),
('care_plan.sustain_field_threshold_placeholder', 'en', 'e.g. If I am no longer sleeping, if I need to reduce my working hours, if I miss two weeks of my own medical appointments\u2026'),

-- SustainabilityForm — hours options
('care_plan.sustain_hours_under10', 'en', 'Under 10 hrs/week'),
('care_plan.sustain_hours_10_20', 'en', '10\u201320 hrs/week'),
('care_plan.sustain_hours_20_40', 'en', '20\u201340 hrs/week'),
('care_plan.sustain_hours_40plus', 'en', '40+ hrs/week'),
('care_plan.sustain_hours_fulltime', 'en', 'Full-time / live-in'),

-- SustainabilityForm — stress level options
('care_plan.sustain_stress_low', 'en', 'Low'),
('care_plan.sustain_stress_moderate', 'en', 'Moderate'),
('care_plan.sustain_stress_high', 'en', 'High'),
('care_plan.sustain_stress_very_high', 'en', 'Very high'),

-- SustainabilityForm — stress factor chips
('care_plan.sustain_factor_time', 'en', 'Time \u2014 caring expands to fill all available hours'),
('care_plan.sustain_factor_emotional', 'en', 'Emotional strain \u2014 grief, guilt, frustration'),
('care_plan.sustain_factor_physical', 'en', 'Physical demands \u2014 personal care or mobility support'),
('care_plan.sustain_factor_work', 'en', 'Work or financial pressure \u2014 reduced hours, lost income'),
('care_plan.sustain_factor_isolation', 'en', 'Isolation \u2014 stepping back from social life'),
('care_plan.sustain_factor_no_backup', 'en', 'No backup \u2014 carrying full responsibility alone'),

-- SustainabilityForm — risk flags panel
('care_plan.sustain_risks_title', 'en', 'Sustainability risks identified'),
('care_plan.sustain_risks_body', 'en', 'These gaps are worth addressing before the current arrangement breaks down.'),

-- ReviewForm — preamble
('care_plan.review_preamble', 'en', 'A care plan is not a static document. Building a review process in from the beginning prevents small changes from becoming crises. The goal is not perfection \u2014 it is a workable plan that is honest, shared, and regularly reviewed.'),

-- ReviewForm — fields
('care_plan.review_field_frequency_label', 'en', 'How often should this Care Plan be formally reviewed?'),
('care_plan.review_field_owner_label', 'en', 'Who is responsible for leading the review?'),
('care_plan.review_field_owner_hint', 'en', 'Name the person who is responsible for calling and running each review.'),
('care_plan.review_field_owner_placeholder', 'en', 'Name and relationship'),
('care_plan.review_field_date_label', 'en', 'Next scheduled review date'),
('care_plan.review_field_date_hint', 'en', 'Even a rough target is better than no date at all.'),
('care_plan.review_field_triggers_label', 'en', 'What changes should trigger an unscheduled review?'),
('care_plan.review_field_triggers_hint', 'en', 'Select all that apply.'),
('care_plan.review_field_decisions_label', 'en', 'What decisions or issues need to be revisited soon?'),
('care_plan.review_field_decisions_hint', 'en', 'Anything that is unresolved, has been deferred, or needs to be discussed at the next review.'),
('care_plan.review_field_decisions_placeholder', 'en', 'e.g. Need to confirm financial authority before next specialist visit. Respite arrangement needs to be formalised\u2026'),
('care_plan.review_field_family_label', 'en', 'Are family members who are not the primary caregiver included in reviews?'),

-- ReviewForm — frequency options
('care_plan.review_freq_monthly', 'en', 'Monthly'),
('care_plan.review_freq_3months', 'en', 'Every 3 months'),
('care_plan.review_freq_6months', 'en', 'Every 6 months'),
('care_plan.review_freq_annually', 'en', 'Annually'),
('care_plan.review_freq_triggered', 'en', 'Only when triggered'),

-- ReviewForm — family inclusion options
('care_plan.review_family_yes', 'en', 'Yes'),
('care_plan.review_family_planned', 'en', 'Planned'),
('care_plan.review_family_not_yet', 'en', 'Not yet'),
('care_plan.review_family_not_applicable', 'en', 'Not applicable'),

-- ReviewForm — trigger chips
('care_plan.review_trigger_health', 'en', 'Health decline or new diagnosis'),
('care_plan.review_trigger_hospital', 'en', 'Hospitalisation or major medical event'),
('care_plan.review_trigger_fall', 'en', 'Fall or safety incident'),
('care_plan.review_trigger_living', 'en', 'Change in living arrangement'),
('care_plan.review_trigger_provider', 'en', 'Change in care provider or service'),
('care_plan.review_trigger_family_capacity', 'en', 'Family capacity changes significantly'),
('care_plan.review_trigger_carer_overload', 'en', 'Primary caregiver shows signs of overload'),
('care_plan.review_trigger_conflict', 'en', 'Family conflict about care decisions'),
('care_plan.review_trigger_financial', 'en', 'Significant financial change'),

-- ─────────────────────────────────────────────────────────────────────────────
-- NAMESPACE: care_plan_gaps  (carePlanGaps.ts)
-- ─────────────────────────────────────────────────────────────────────────────

-- AUTH_FIELD_LABELS lookup values
('care_plan_gaps.auth_health_decisions', 'en', 'Health decision authority'),
('care_plan_gaps.auth_financial_authority', 'en', 'Financial authority'),
('care_plan_gaps.auth_legal_documents', 'en', 'Legal documents'),
('care_plan_gaps.auth_document_location', 'en', 'Organised records'),

-- RESP_AREA_LABELS lookup values
('care_plan_gaps.resp_household', 'en', 'Household support'),
('care_plan_gaps.resp_personal_care', 'en', 'Personal care and mobility'),
('care_plan_gaps.resp_emotional', 'en', 'Emotional support'),
('care_plan_gaps.resp_health', 'en', 'Health coordination'),
('care_plan_gaps.resp_scheduling', 'en', 'Appointments and transport'),
('care_plan_gaps.resp_admin', 'en', 'Financial and administration'),
('care_plan_gaps.resp_respite', 'en', 'Backup and respite'),

-- Gap labels and actions — situation
('care_plan_gaps.situation_no_context_label', 'en', 'Urgent decisions recorded with no situation context'),
('care_plan_gaps.situation_no_context_action', 'en', 'Describe the current situation in the Situation section to give the urgent decisions context.'),

-- Gap labels and actions — authority
('care_plan_gaps.authority_not_completed_label', 'en', 'Authority section not completed'),
('care_plan_gaps.authority_not_completed_action', 'en', 'Complete the Authority section to identify who can make key decisions.'),
('care_plan_gaps.authority_field_missing_label', 'en', '{field} is missing'),
('care_plan_gaps.authority_field_missing_action', 'en', 'Resolve the "{field}" gap in the Authority section.'),
('care_plan_gaps.authority_field_unclear_label', 'en', '{field} is unclear'),
('care_plan_gaps.authority_field_unclear_action', 'en', 'Clarify the "{field}" in the Authority section.'),

-- Gap labels and actions — responsibilities
('care_plan_gaps.resp_no_owner_label', 'en', '{area} has no owner'),
('care_plan_gaps.resp_no_owner_action', 'en', 'Assign a responsible person for "{area}" in the Responsibilities section.'),
('care_plan_gaps.resp_unclear_label', 'en', '{area} responsibility is unclear'),
('care_plan_gaps.resp_unclear_action', 'en', 'Clarify ownership of "{area}" in the Responsibilities section.'),

-- Gap labels and actions — living arrangement
('care_plan_gaps.living_not_working_label', 'en', 'Current living arrangement is not working'),
('care_plan_gaps.living_not_working_action', 'en', 'Review the Living Arrangement section \u2014 consider alternatives urgently.'),
('care_plan_gaps.living_struggling_label', 'en', 'Current living arrangement is under strain'),
('care_plan_gaps.living_struggling_action', 'en', 'Review the Living Arrangement section \u2014 consider alternatives before a crisis.'),

-- Gap labels and actions — sustainability
('care_plan_gaps.sustain_very_high_stress_label', 'en', 'Primary caregiver reports very high stress'),
('care_plan_gaps.sustain_very_high_stress_action', 'en', 'Review sustainability and backup arrangements urgently.'),
('care_plan_gaps.sustain_high_stress_label', 'en', 'Primary caregiver reports high stress'),
('care_plan_gaps.sustain_high_stress_action', 'en', 'Review sustainability and backup arrangements.'),
('care_plan_gaps.sustain_no_backup_acknowledged_label', 'en', 'No backup caregiver identified \u2014 caregiver acknowledges this gap'),
('care_plan_gaps.sustain_no_backup_label', 'en', 'No backup caregiver identified'),
('care_plan_gaps.sustain_no_backup_action', 'en', 'Identify a backup caregiver in the Sustainability section.'),
('care_plan_gaps.sustain_no_respite_label', 'en', 'No respite plan in place'),
('care_plan_gaps.sustain_no_respite_action', 'en', 'Add a respite plan in the Sustainability section.'),

-- Gap labels and actions — review
('care_plan_gaps.review_not_set_label', 'en', 'No review schedule set'),
('care_plan_gaps.review_not_set_action', 'en', 'Complete the Review section and set a next review date.'),
('care_plan_gaps.review_no_date_label', 'en', 'No next review date set'),
('care_plan_gaps.review_no_date_action', 'en', 'Set a next review date in the Review section.'),
('care_plan_gaps.review_no_owner_label', 'en', 'No review owner named'),
('care_plan_gaps.review_no_owner_action', 'en', 'Identify who is responsible for leading reviews.'),

-- getSustainabilityFlags inline messages
('care_plan_gaps.flag_no_backup_acknowledged', 'en', 'No backup caregiver identified \u2014 you have acknowledged this gap'),
('care_plan_gaps.flag_no_backup', 'en', 'No backup caregiver identified'),
('care_plan_gaps.flag_no_respite', 'en', 'No respite plan in place'),
('care_plan_gaps.flag_very_high_stress', 'en', 'Primary caregiver reports very high stress'),
('care_plan_gaps.flag_high_stress', 'en', 'Primary caregiver reports high stress'),

-- ─────────────────────────────────────────────────────────────────────────────
-- NAMESPACE: care_hub  (CareHubPage, CarePlanBuilderPage, CarePlanSummaryPage,
--                       DashboardCarePlanPanel, CarePlanStatusPanel)
-- ─────────────────────────────────────────────────────────────────────────────

-- CareHubPage — header
('care_hub.page_eyebrow', 'en', 'Subscriber tools'),
('care_hub.page_title', 'en', 'Care Hub'),
('care_hub.page_intro_first_visit', 'en', 'Welcome to Care Hub. Your subscriber toolkit has three parts \u2014 each with a different purpose. Start with Care Plan to coordinate your care team.'),
('care_hub.page_intro_returning', 'en', 'Your subscriber toolkit \u2014 Memory Book, Care Plan, and Observations.'),

-- CareHubPage — tool definitions
('care_hub.tool_memory_book_title', 'en', 'Memory Book'),
('care_hub.tool_memory_book_subtitle', 'en', 'Know the person'),
('care_hub.tool_memory_book_desc', 'en', 'Build a shared reference for the person being cared for \u2014 preferences, health context, providers, contacts, and practical information caregivers need day to day.'),
('care_hub.tool_memory_book_cta', 'en', 'Open Memory Book'),
('care_hub.tool_care_plan_title', 'en', 'Care Plan'),
('care_hub.tool_care_plan_subtitle', 'en', 'Coordinate the team'),
('care_hub.tool_care_plan_desc', 'en', 'Create the care team\u2019s big-picture operating plan: who is responsible for what, what authority exists, what risks need attention, and when to review.'),
('care_hub.tool_care_plan_cta', 'en', 'Open Care Plan'),
('care_hub.tool_observations_title', 'en', 'Observations'),
('care_hub.tool_observations_subtitle', 'en', 'Track change'),
('care_hub.tool_observations_desc', 'en', 'Record functional observations over time so the care team can see what is changing and make informed decisions as needs evolve.'),
('care_hub.tool_observations_cta', 'en', 'Open Observations'),

-- CareHubPage — all tools section
('care_hub.all_tools_heading', 'en', 'All tools'),

-- CareHubPage — mental model section
('care_hub.mental_model_heading', 'en', 'How the tools work together'),
('care_hub.mental_model_mb_label', 'en', 'Memory Book'),
('care_hub.mental_model_mb_tag', 'en', 'Know the person'),
('care_hub.mental_model_mb_body', 'en', 'Built with and about the resident. A reference covering identity, health, preferences, contacts, and practical details.'),
('care_hub.mental_model_cp_label', 'en', 'Care Plan'),
('care_hub.mental_model_cp_tag', 'en', 'Coordinate the team'),
('care_hub.mental_model_cp_body', 'en', 'Built by the care team. Covers the big-picture operating plan: who does what, authority, risks, living arrangements, and when to review.'),
('care_hub.mental_model_obs_label', 'en', 'Observations'),
('care_hub.mental_model_obs_tag', 'en', 'Track change'),
('care_hub.mental_model_obs_body', 'en', 'Periodic functional tracking. Helps the team see how the resident is changing and make better decisions as needs evolve.'),

-- CareHubPage / DashboardCarePlanPanel — shared live panel strings
('care_hub.live_panel_heading', 'en', 'Care Plan'),
('care_hub.live_panel_subtitle', 'en', 'Coordinate the team'),
('care_hub.progress_sections_complete', 'en', '{completed} of {total} sections complete'),
('care_hub.view_summary_link', 'en', 'View summary \u2192'),
('care_hub.all_sections_complete', 'en', 'All sections complete \u2014 no gaps identified.'),
('care_hub.all_sections_complete_short', 'en', 'All sections complete'),
('care_hub.gaps_identified', 'en', '{count} gap{plural} identified'),
('care_hub.gaps_count', 'en', '{count} gap{plural}'),
('care_hub.gap_critical', 'en', '{count} critical'),
('care_hub.gap_critical_plural', 'en', '{count} critical gaps'),
('care_hub.gap_important', 'en', '{count} important'),
('care_hub.gap_to_monitor', 'en', '{count} to monitor'),
('care_hub.gap_monitor', 'en', '{count} monitor'),
('care_hub.most_urgent_next_step', 'en', 'Most urgent next step'),
('care_hub.more_gaps', 'en', '+{count} more gaps \u2014'),
('care_hub.more_items', 'en', '+{count} more'),
('care_hub.view_all_link', 'en', 'view all'),
('care_hub.critical_gaps_need_attention', 'en', '{count} critical gap{plural} need attention'),

-- CareHubPage — start plan CTA
('care_hub.start_plan_heading', 'en', 'Start your Care Plan'),
('care_hub.start_plan_body', 'en', 'A Care Plan helps your team coordinate who does what, what authority is in place, and when to review. It takes about 20 minutes to build a first draft.'),
('care_hub.start_building_link', 'en', 'Start building'),

-- CareHubPage — live panel CTA button states
('care_hub.cta_start_plan', 'en', 'Start Care Plan'),
('care_hub.cta_review_plan', 'en', 'Review Care Plan'),
('care_hub.cta_continue_plan', 'en', 'Continue Care Plan'),

-- CarePlanBuilderPage — header
('care_hub.builder_breadcrumb_hub', 'en', 'Care Hub'),
('care_hub.builder_breadcrumb_plan', 'en', 'Care Plan'),
('care_hub.builder_title', 'en', 'Care Plan'),
('care_hub.builder_subtitle', 'en', 'Coordinate the team'),
('care_hub.builder_description', 'en', 'The Care Plan is the care team\u2019s big-picture operating plan. It covers who is responsible for what, what authority exists, how care will be arranged, and when the plan should be reviewed. It is not a daily note system \u2014 that is what Observations is for.'),
('care_hub.builder_care_plan_for', 'en', 'Care plan for'),
('care_hub.builder_age_label', 'en', 'Age {age}'),
('care_hub.builder_mb_subtitle', 'en', 'Know the person \u2014 identity, health, preferences'),
('care_hub.builder_obs_subtitle', 'en', 'Track change \u2014 day-to-day functional notes'),

-- CarePlanBuilderPage — progress / view summary
('care_hub.builder_view_summary_link', 'en', 'View summary \u2192'),
('care_hub.builder_view_partial_summary', 'en', 'View partial summary'),
('care_hub.builder_view_full_summary', 'en', 'View Care Plan Summary'),

-- CarePlanBuilderPage — error and empty states
('care_hub.builder_load_error', 'en', 'Unable to load Care Plan. Please refresh the page.'),
('care_hub.builder_no_team_heading', 'en', 'No care team found'),
('care_hub.builder_no_team_body', 'en', 'The Care Plan is linked to your care team. Set up your care team first to get started.'),
('care_hub.builder_go_to_dashboard', 'en', 'Go to Dashboard'),
('care_hub.builder_owner_start_heading', 'en', 'Start your Care Plan'),
('care_hub.builder_owner_start_body', 'en', 'Your team doesn\u2019t have a Care Plan yet. Create one to coordinate responsibilities, authority, and living arrangements.'),
('care_hub.builder_creating', 'en', 'Creating\u2026'),
('care_hub.builder_create_plan', 'en', 'Create Care Plan'),
('care_hub.builder_member_no_plan_heading', 'en', 'No Care Plan yet'),
('care_hub.builder_member_no_plan_body', 'en', 'The care team owner has not created a Care Plan yet. Check back later.'),

-- CarePlanBuilderPage — status badge labels
('care_hub.status_complete', 'en', 'Complete'),
('care_hub.status_in_progress', 'en', 'In progress'),
('care_hub.status_not_started', 'en', 'Not started'),

-- CarePlanSummaryPage — header
('care_hub.summary_breadcrumb_plan', 'en', 'Care Plan'),
('care_hub.summary_breadcrumb_summary', 'en', 'Summary'),
('care_hub.summary_title', 'en', 'Care Plan Summary'),
('care_hub.summary_subtitle', 'en', 'For {name} \u00b7 {completed} of {total} sections complete'),
('care_hub.summary_no_team', 'en', 'No care team found.'),
('care_hub.summary_print_btn', 'en', 'Print'),
('care_hub.summary_print_title', 'en', 'Care Plan Summary'),
('care_hub.summary_generated_date', 'en', 'Generated {date}'),

-- CarePlanSummaryPage — gaps panel
('care_hub.summary_gaps_heading', 'en', '{count} gap{plural} identified'),
('care_hub.summary_all_complete', 'en', 'All sections complete with no gaps identified.'),

-- CarePlanSummaryPage — section display labels (Situation)
('care_hub.summary_current_situation', 'en', 'Current situation'),
('care_hub.summary_trigger', 'en', 'What triggered the need for more care'),
('care_hub.summary_key_concerns', 'en', 'Key concerns'),
('care_hub.summary_anticipated_changes', 'en', 'Anticipated changes (6\u201312 months)'),
('care_hub.summary_urgent_decisions', 'en', 'Most urgent decisions'),

-- CarePlanSummaryPage — authority labels
('care_hub.summary_auth_health', 'en', 'Health decision authority'),
('care_hub.summary_auth_financial', 'en', 'Financial authority'),
('care_hub.summary_auth_legal', 'en', 'Legal documents'),
('care_hub.summary_auth_preferences', 'en', 'Care preferences documented'),
('care_hub.summary_auth_records', 'en', 'Organised records'),
('care_hub.summary_auth_emergency', 'en', 'Emergency readiness'),

-- CarePlanSummaryPage — responsibilities display labels
('care_hub.summary_resp_household', 'en', 'Household support'),
('care_hub.summary_resp_personal_care', 'en', 'Personal care'),
('care_hub.summary_resp_emotional', 'en', 'Emotional support'),
('care_hub.summary_resp_health', 'en', 'Health coordination'),
('care_hub.summary_resp_scheduling', 'en', 'Appointments'),
('care_hub.summary_resp_admin', 'en', 'Administration'),
('care_hub.summary_resp_respite', 'en', 'Backup / respite'),
('care_hub.summary_not_filled_in', 'en', 'Not filled in'),
('care_hub.summary_owner_label', 'en', 'Owner: {name}'),
('care_hub.summary_backup_label', 'en', 'Backup: {name}'),

-- CarePlanSummaryPage — living arrangement labels
('care_hub.summary_arrangement_label', 'en', 'Arrangement'),
('care_hub.summary_working_label', 'en', 'Working: {status}'),
('care_hub.summary_triggers_for_change', 'en', 'Triggers for change'),
('care_hub.summary_safety_concerns', 'en', 'Safety concerns'),
('care_hub.summary_alternatives', 'en', 'Alternatives being considered'),
('care_hub.summary_constraints', 'en', 'Financial / family constraints'),
('care_hub.summary_arrangement_resident_home', 'en', 'Resident stays in their own home'),
('care_hub.summary_arrangement_family_home', 'en', 'Resident moves into a family home'),
('care_hub.summary_arrangement_paid_in_home', 'en', 'Paid in-home support'),
('care_hub.summary_arrangement_assisted', 'en', 'Assisted living or residential care'),
('care_hub.summary_arrangement_undecided', 'en', 'Undecided / still assessing'),

-- CarePlanSummaryPage — sustainability labels
('care_hub.summary_primary_caregiver', 'en', 'Primary caregiver'),
('care_hub.summary_available_hours', 'en', 'Available hours'),
('care_hub.summary_stress_level', 'en', 'Stress level'),
('care_hub.summary_stress_factors', 'en', 'Stress factors'),
('care_hub.summary_backup_caregiver', 'en', 'Backup caregiver'),
('care_hub.summary_respite_plan', 'en', 'Respite plan'),
('care_hub.summary_sustainability_threshold', 'en', 'Sustainability threshold'),

-- CarePlanSummaryPage — review labels
('care_hub.summary_frequency', 'en', 'Frequency'),
('care_hub.summary_next_review', 'en', 'Next review'),
('care_hub.summary_review_owner', 'en', 'Review owner'),
('care_hub.summary_unscheduled_triggers', 'en', 'Unscheduled triggers'),
('care_hub.summary_decisions_to_revisit', 'en', 'Decisions to revisit'),

-- CarePlanSummaryPage — action buttons
('care_hub.summary_edit_btn', 'en', 'Edit Care Plan'),
('care_hub.summary_print_summary_btn', 'en', 'Print summary'),
('care_hub.summary_open_mb_btn', 'en', 'Open Memory Book'),

-- CarePlanStatusPanel — body text
('care_hub.status_panel_no_plan_body', 'en', 'Your care team doesn\u2019t have a Care Plan yet. Building one helps coordinate responsibilities, authority, and sustainability.'),
('care_hub.status_panel_start_building', 'en', 'Start building'),
('care_hub.status_panel_continue', 'en', 'Continue building \u2192'),
('care_hub.status_panel_view_summary', 'en', 'View summary'),
('care_hub.status_panel_no_gaps_incomplete', 'en', 'No gaps in completed sections. {count} section{plural} still to complete.'),
('care_hub.status_panel_open', 'en', 'Open'),
('care_hub.status_panel_start', 'en', 'Start'),

-- DashboardCarePlanPanel — CTA states
('care_hub.dashboard_panel_review', 'en', 'Review'),
('care_hub.dashboard_panel_continue', 'en', 'Continue'),
('care_hub.dashboard_panel_start', 'en', 'Start'),

-- ─────────────────────────────────────────────────────────────────────────────
-- NAMESPACE: resident_profile  (ResidentProfilePage)
-- ─────────────────────────────────────────────────────────────────────────────

-- Page title / subtitle
('resident_profile.page_title', 'en', 'Resident Profile'),
('resident_profile.page_subtitle', 'en', 'The single source of truth for the person at the centre of your care.'),

-- No resident state
('resident_profile.no_resident_heading', 'en', 'No resident found'),
('resident_profile.no_resident_body', 'en', 'Set up your Family Circle first to create a resident profile.'),

-- Toast messages
('resident_profile.toast_name_required', 'en', 'Full name is required'),
('resident_profile.toast_saved', 'en', 'Resident profile saved'),
('resident_profile.toast_save_failed', 'en', 'Failed to save'),

-- Edit form section headings
('resident_profile.section_core_identity', 'en', 'Core Identity'),
('resident_profile.section_background', 'en', 'Background & Context'),
('resident_profile.section_about', 'en', 'About'),

-- Edit form card header
('resident_profile.edit_card_title', 'en', 'Edit Resident Profile'),
('resident_profile.edit_card_subtitle', 'en', 'Changes sync automatically to the Memory Book Identity section.'),

-- Field labels
('resident_profile.field_full_name', 'en', 'Full Name *'),
('resident_profile.field_preferred_name', 'en', 'Preferred Name'),
('resident_profile.field_date_of_birth', 'en', 'Date of Birth'),
('resident_profile.field_gender', 'en', 'Gender'),
('resident_profile.field_birthplace', 'en', 'Birthplace'),
('resident_profile.field_address', 'en', 'Lives At / Address Preference'),
('resident_profile.field_relationship_status', 'en', 'Relationship Status'),
('resident_profile.field_cultural_background', 'en', 'Cultural Background'),
('resident_profile.field_language_preferences', 'en', 'Language Preferences'),
('resident_profile.field_about', 'en', 'About the Resident'),

-- Placeholders
('resident_profile.placeholder_full_name', 'en', 'Legal full name'),
('resident_profile.placeholder_preferred_name', 'en', 'What they like to be called'),
('resident_profile.placeholder_birthplace', 'en', 'City, country'),
('resident_profile.placeholder_address', 'en', 'Home, care facility, etc.'),
('resident_profile.placeholder_relationship_status', 'en', 'Widowed, married, etc.'),
('resident_profile.placeholder_cultural_background', 'en', 'Heritage, traditions'),
('resident_profile.placeholder_language_preferences', 'en', 'First language, other languages'),
('resident_profile.placeholder_about', 'en', 'Who they are \u2014 their story, personality, what matters to them...'),

-- Gender options
('resident_profile.gender_male', 'en', 'Male'),
('resident_profile.gender_female', 'en', 'Female'),
('resident_profile.gender_non_binary', 'en', 'Non-binary'),
('resident_profile.gender_prefer_not', 'en', 'Prefer not to say'),

-- Buttons
('resident_profile.btn_edit', 'en', 'Edit Profile'),
('resident_profile.btn_save', 'en', 'Save Profile'),
('resident_profile.btn_saving', 'en', 'Saving...'),
('resident_profile.btn_cancel', 'en', 'Cancel'),

-- View mode labels (FieldDisplay)
('resident_profile.view_full_name', 'en', 'Full Name'),
('resident_profile.view_preferred_name', 'en', 'Preferred Name'),
('resident_profile.view_date_of_birth', 'en', 'Date of Birth'),
('resident_profile.view_gender', 'en', 'Gender'),
('resident_profile.view_lives_at', 'en', 'Lives At'),
('resident_profile.view_birthplace', 'en', 'Birthplace'),
('resident_profile.view_relationship_status', 'en', 'Relationship Status'),
('resident_profile.view_cultural_background', 'en', 'Cultural Background'),
('resident_profile.view_language_preferences', 'en', 'Language Preferences'),
('resident_profile.view_about', 'en', 'About the Resident'),

-- View mode cards
('resident_profile.card_core_identity', 'en', 'Core Identity'),
('resident_profile.card_background', 'en', 'Background & Context'),

-- Profile completion
('resident_profile.completion_label', 'en', '{filled} of {total} fields complete'),
('resident_profile.completion_badge', 'en', 'Complete'),

-- Empty state nudges
('resident_profile.nudge_add_details', 'en', 'Add more details'),
('resident_profile.nudge_add_background', 'en', 'Add background details'),
('resident_profile.nudge_add_story', 'en', 'Add their story'),
('resident_profile.no_about_text', 'en', 'No \u201cAbout\u201d narrative yet.'),

-- Footer links
('resident_profile.link_view_mb', 'en', 'View Memory Book'),
('resident_profile.link_view_care_plan', 'en', 'View Care Plan'),

-- Context notice
('resident_profile.context_notice', 'en', 'This profile is shared across the Memory Book, Care Plan, and Observations. Keeping it complete helps the whole team stay aligned.')

ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- SPANISH STUBS  (same keys, [ES] prefix so admins can find untranslated text)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO ui_translations (key, locale, value)
SELECT key, 'es', '[ES] ' || value
FROM ui_translations
WHERE locale = 'en'
  AND key LIKE ANY(ARRAY['care_plan.%', 'care_plan_gaps.%', 'care_hub.%', 'resident_profile.%'])
ON CONFLICT (locale, namespace, key) DO NOTHING;
