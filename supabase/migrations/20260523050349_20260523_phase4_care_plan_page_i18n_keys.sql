/*
  # Phase 4: Care Plan page-level, dashboard panels, and resident profile i18n keys

  Seeds the English translation keys used in:
  - CarePlanBuilderPage (page title, breadcrumbs, status badges, progress, empty states, CTAs)
  - CarePlanSummaryPage (header, section field labels, gaps panel, action buttons)
  - DashboardCarePlanPanel (header, progress, gap badges, alert strip)
  - CarePlanStatusPanel (header, progress, gap pills, top gaps, footer links, alert strip)
  - ResidentProfilePage (page title/subtitle, all field labels/placeholders, section headings,
    gender options, toast messages, footer links)

  Spanish stubs seeded for all new keys with [ES] prefix.
*/

INSERT INTO ui_translations (key, locale, value) VALUES

-- ─── Care Plan: page-level strings ───────────────────────────────────────────

('care_plan.title', 'en', 'Care Plan'),
('care_plan.subtitle', 'en', 'Coordinate the team'),
('care_plan.description', 'en', 'The Care Plan is the care team''s big-picture operating plan. It covers who is responsible for what, what authority exists, how care will be arranged, and when the plan should be reviewed.'),
('care_plan.care_plan_for', 'en', 'Care plan for'),
('care_plan.progress_label', 'en', '{completed} of {total} sections complete'),
('care_plan.of_total_sections', 'en', 'of {total} sections complete'),
('care_plan.of_total_sections_count', 'en', '{completed} of {total} sections complete'),
('care_plan.view_summary', 'en', 'View summary'),
('care_plan.view_summary_full', 'en', 'View Care Plan Summary'),
('care_plan.view_summary_partial', 'en', 'View partial summary'),
('care_plan.load_error', 'en', 'Unable to load Care Plan. Please refresh the page.'),

-- Status badges
('care_plan.status_complete', 'en', 'Complete'),
('care_plan.status_in_progress', 'en', 'In progress'),
('care_plan.status_not_started', 'en', 'Not started'),

-- No team / empty states
('care_plan.no_team_title', 'en', 'No care team found'),
('care_plan.no_team_body', 'en', 'The Care Plan is linked to your care team. Set up your care team first to get started.'),
('care_plan.go_to_dashboard', 'en', 'Go to Dashboard'),
('care_plan.start_title', 'en', 'Start your Care Plan'),
('care_plan.start_body', 'en', 'Your team doesn''t have a Care Plan yet. Create one to coordinate responsibilities, authority, and living arrangements.'),
('care_plan.creating', 'en', 'Creating…'),
('care_plan.create_button', 'en', 'Create Care Plan'),
('care_plan.no_plan_title', 'en', 'No Care Plan yet'),
('care_plan.no_plan_body', 'en', 'The care team owner has not created a Care Plan yet. Check back later.'),
('care_plan.no_plan_status_body', 'en', 'Your care team doesn''t have a Care Plan yet. Building one helps coordinate responsibilities, authority, and sustainability.'),

-- CTAs
('care_plan.cta_start', 'en', 'Start'),
('care_plan.cta_open', 'en', 'Open'),
('care_plan.cta_continue', 'en', 'Continue'),
('care_plan.cta_review', 'en', 'Review'),
('care_plan.start_building', 'en', 'Start building'),
('care_plan.continue_building', 'en', 'Continue building'),

-- Related tool callout links
('care_plan.memory_book_label', 'en', 'Memory Book'),
('care_plan.memory_book_desc', 'en', 'Know the person — identity, health, preferences'),
('care_plan.observations_label', 'en', 'Observations'),
('care_plan.observations_desc', 'en', 'Track change — day-to-day functional notes'),
('care_plan.open_memory_book', 'en', 'Open Memory Book'),

-- All done / completion
('care_plan.all_sections_complete', 'en', 'All sections complete'),
('care_plan.all_complete_no_gaps', 'en', 'All sections complete — no gaps identified.'),

-- Gap counts and severity pills
('care_plan.gaps_identified', 'en', '{count} gap{plural} identified'),
('care_plan.gap_count', 'en', '{count} gap{plural}'),
('care_plan.gap_critical', 'en', '{count} critical gap{plural}'),
('care_plan.gap_important', 'en', '{count} important'),
('care_plan.gap_monitor', 'en', '{count} to monitor'),
('care_plan.severity_critical_pill', 'en', '{count} critical'),
('care_plan.severity_important_pill', 'en', '{count} important'),
('care_plan.severity_monitor_pill', 'en', '{count} monitor'),
('care_plan.critical_alert', 'en', '{count} critical gap{plural} need attention'),
('care_plan.more_gaps', 'en', 'more'),
('care_plan.no_gaps_incomplete', 'en', 'No gaps in completed sections. {remaining} section{plural} still to complete.'),

-- Print / actions
('care_plan.print', 'en', 'Print'),
('care_plan.print_summary', 'en', 'Print summary'),
('care_plan.edit_care_plan', 'en', 'Edit Care Plan'),

-- Summary page
('care_plan.summary_title', 'en', 'Care Plan Summary'),
('care_plan.summary_breadcrumb', 'en', 'Summary'),
('care_plan.summary_for_resident', 'en', 'For {name} · {completed} of {total} sections complete'),
('care_plan.resident_fallback', 'en', 'resident'),
('care_plan.generated_on', 'en', 'Generated {date}'),
('care_plan.not_filled_in', 'en', 'not filled in'),

-- Summary section labels — Situation
('care_plan.situation_current', 'en', 'Current situation'),
('care_plan.situation_trigger', 'en', 'What triggered the need for more care'),
('care_plan.situation_concerns', 'en', 'Key concerns'),
('care_plan.situation_anticipated', 'en', 'Anticipated changes (6–12 months)'),
('care_plan.situation_urgent', 'en', 'Most urgent decisions'),

-- Summary section labels — Authority
('care_plan.auth_health', 'en', 'Health decision authority'),
('care_plan.auth_financial', 'en', 'Financial authority'),
('care_plan.auth_legal', 'en', 'Legal documents'),
('care_plan.auth_preferences', 'en', 'Care preferences documented'),
('care_plan.auth_records', 'en', 'Organised records'),
('care_plan.auth_emergency', 'en', 'Emergency readiness'),

-- Summary section labels — Responsibilities
('care_plan.resp_household', 'en', 'Household support'),
('care_plan.resp_personal_care', 'en', 'Personal care'),
('care_plan.resp_emotional', 'en', 'Emotional support'),
('care_plan.resp_health', 'en', 'Health coordination'),
('care_plan.resp_scheduling', 'en', 'Appointments'),
('care_plan.resp_admin', 'en', 'Administration'),
('care_plan.resp_respite', 'en', 'Backup / respite'),
('care_plan.owner_label', 'en', 'Owner'),
('care_plan.backup_label', 'en', 'Backup'),

-- Summary section labels — Living Arrangement
('care_plan.living_arrangement_label', 'en', 'Arrangement'),
('care_plan.living_resident_home', 'en', 'Resident stays in their own home'),
('care_plan.living_family_home', 'en', 'Resident moves into a family home'),
('care_plan.living_paid_in_home', 'en', 'Paid in-home support'),
('care_plan.living_assisted', 'en', 'Assisted living or residential care'),
('care_plan.living_undecided', 'en', 'Undecided / still assessing'),
('care_plan.living_working_label', 'en', 'Working'),
('care_plan.living_safety', 'en', 'Safety concerns'),
('care_plan.living_alternatives', 'en', 'Alternatives being considered'),
('care_plan.living_triggers', 'en', 'Triggers for change'),
('care_plan.living_constraints', 'en', 'Financial / family constraints'),

-- Summary section labels — Sustainability
('care_plan.sust_primary', 'en', 'Primary caregiver'),
('care_plan.sust_hours', 'en', 'Available hours'),
('care_plan.sust_stress_level', 'en', 'Stress level'),
('care_plan.sust_stress_factors', 'en', 'Stress factors'),
('care_plan.sust_backup', 'en', 'Backup caregiver'),
('care_plan.sust_respite', 'en', 'Respite plan'),
('care_plan.sust_threshold', 'en', 'Sustainability threshold'),

-- Summary section labels — Review
('care_plan.review_frequency_label', 'en', 'Frequency'),
('care_plan.review_next_date_label', 'en', 'Next review'),
('care_plan.review_owner_label', 'en', 'Review owner'),
('care_plan.review_triggers_label', 'en', 'Unscheduled triggers'),
('care_plan.review_decisions_label', 'en', 'Decisions to revisit'),

-- ─── Care Hub: page-level strings ────────────────────────────────────────────

('care_hub.title', 'en', 'Care Hub'),

-- ─── Resident Profile: all strings ───────────────────────────────────────────

('resident_profile.title', 'en', 'Resident Profile'),
('resident_profile.subtitle', 'en', 'The single source of truth for the person at the centre of your care.'),
('resident_profile.no_resident_title', 'en', 'No resident found'),
('resident_profile.no_resident_body', 'en', 'Set up your Family Circle first to create a resident profile.'),
('resident_profile.edit_profile', 'en', 'Edit Profile'),

-- Shared notice
('resident_profile.shared_notice_prefix', 'en', 'This profile is shared across the'),
('resident_profile.shared_notice_suffix', 'en', 'and Observations. Keeping it complete helps the whole team stay aligned.'),
('resident_profile.memory_book_link', 'en', 'Memory Book'),
('resident_profile.care_plan_link', 'en', 'Care Plan'),

-- Edit form
('resident_profile.edit_form_title', 'en', 'Edit Resident Profile'),
('resident_profile.edit_form_subtitle', 'en', 'Changes sync automatically to the Memory Book Identity section.'),

-- Section headings
('resident_profile.section_core_identity', 'en', 'Core Identity'),
('resident_profile.section_background', 'en', 'Background & Context'),
('resident_profile.section_about', 'en', 'About'),

-- Core identity fields
('resident_profile.full_name_label', 'en', 'Full Name *'),
('resident_profile.full_name_placeholder', 'en', 'Legal full name'),
('resident_profile.preferred_name_label', 'en', 'Preferred Name'),
('resident_profile.preferred_name_placeholder', 'en', 'What they like to be called'),
('resident_profile.dob_label', 'en', 'Date of Birth'),
('resident_profile.gender_label', 'en', 'Gender'),
('resident_profile.gender_male', 'en', 'Male'),
('resident_profile.gender_female', 'en', 'Female'),
('resident_profile.gender_non_binary', 'en', 'Non-binary'),
('resident_profile.gender_prefer_not', 'en', 'Prefer not to say'),

-- Background fields
('resident_profile.birthplace_label', 'en', 'Birthplace'),
('resident_profile.birthplace_placeholder', 'en', 'City, country'),
('resident_profile.address_label', 'en', 'Lives At / Address Preference'),
('resident_profile.address_placeholder', 'en', 'Home, care facility, etc.'),
('resident_profile.relationship_label', 'en', 'Relationship Status'),
('resident_profile.relationship_placeholder', 'en', 'Widowed, married, etc.'),
('resident_profile.cultural_label', 'en', 'Cultural Background'),
('resident_profile.cultural_placeholder', 'en', 'Heritage, traditions'),
('resident_profile.language_label', 'en', 'Language Preferences'),
('resident_profile.language_placeholder', 'en', 'First language, other languages'),
('resident_profile.lives_at_label', 'en', 'Lives At'),

-- About field
('resident_profile.about_label', 'en', 'About the Resident'),
('resident_profile.about_placeholder', 'en', 'Who they are — their story, personality, what matters to them...'),
('resident_profile.no_about_narrative', 'en', 'No "About" narrative yet.'),
('resident_profile.add_their_story', 'en', 'Add their story'),

-- Buttons and prompts
('resident_profile.save_button', 'en', 'Save Profile'),
('resident_profile.add_more_details', 'en', 'Add more details'),
('resident_profile.add_background_details', 'en', 'Add background details'),
('resident_profile.view_memory_book', 'en', 'View Memory Book'),
('resident_profile.view_care_plan', 'en', 'View Care Plan'),

-- Toast messages
('resident_profile.full_name_required', 'en', 'Full name is required'),
('resident_profile.save_success', 'en', 'Resident profile saved'),
('resident_profile.save_error', 'en', 'Failed to save'),

-- Completion badge
('resident_profile.age_label', 'en', 'Age {age}'),
('resident_profile.fields_complete', 'en', 'of {total} fields complete')

ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── Spanish stubs for all new keys ──────────────────────────────────────────

INSERT INTO ui_translations (key, locale, value)
SELECT key, 'es', '[ES] ' || value
FROM ui_translations
WHERE locale = 'en'
  AND key IN (
    'care_plan.title','care_plan.subtitle','care_plan.description','care_plan.care_plan_for',
    'care_plan.progress_label','care_plan.of_total_sections','care_plan.of_total_sections_count',
    'care_plan.view_summary','care_plan.view_summary_full','care_plan.view_summary_partial',
    'care_plan.load_error','care_plan.status_complete','care_plan.status_in_progress',
    'care_plan.status_not_started','care_plan.no_team_title','care_plan.no_team_body',
    'care_plan.go_to_dashboard','care_plan.start_title','care_plan.start_body',
    'care_plan.creating','care_plan.create_button','care_plan.no_plan_title',
    'care_plan.no_plan_body','care_plan.no_plan_status_body','care_plan.cta_start',
    'care_plan.cta_open','care_plan.cta_continue','care_plan.cta_review',
    'care_plan.start_building','care_plan.continue_building','care_plan.memory_book_label',
    'care_plan.memory_book_desc','care_plan.observations_label','care_plan.observations_desc',
    'care_plan.open_memory_book','care_plan.all_sections_complete','care_plan.all_complete_no_gaps',
    'care_plan.gaps_identified','care_plan.gap_count','care_plan.gap_critical',
    'care_plan.gap_important','care_plan.gap_monitor','care_plan.severity_critical_pill',
    'care_plan.severity_important_pill','care_plan.severity_monitor_pill',
    'care_plan.critical_alert','care_plan.more_gaps','care_plan.no_gaps_incomplete',
    'care_plan.print','care_plan.print_summary','care_plan.edit_care_plan',
    'care_plan.summary_title','care_plan.summary_breadcrumb','care_plan.summary_for_resident',
    'care_plan.resident_fallback','care_plan.generated_on','care_plan.not_filled_in',
    'care_plan.situation_current','care_plan.situation_trigger','care_plan.situation_concerns',
    'care_plan.situation_anticipated','care_plan.situation_urgent',
    'care_plan.auth_health','care_plan.auth_financial','care_plan.auth_legal',
    'care_plan.auth_preferences','care_plan.auth_records','care_plan.auth_emergency',
    'care_plan.resp_household','care_plan.resp_personal_care','care_plan.resp_emotional',
    'care_plan.resp_health','care_plan.resp_scheduling','care_plan.resp_admin',
    'care_plan.resp_respite','care_plan.owner_label','care_plan.backup_label',
    'care_plan.living_arrangement_label','care_plan.living_resident_home','care_plan.living_family_home',
    'care_plan.living_paid_in_home','care_plan.living_assisted','care_plan.living_undecided',
    'care_plan.living_working_label','care_plan.living_safety','care_plan.living_alternatives',
    'care_plan.living_triggers','care_plan.living_constraints',
    'care_plan.sust_primary','care_plan.sust_hours','care_plan.sust_stress_level',
    'care_plan.sust_stress_factors','care_plan.sust_backup','care_plan.sust_respite',
    'care_plan.sust_threshold','care_plan.review_frequency_label','care_plan.review_next_date_label',
    'care_plan.review_owner_label','care_plan.review_triggers_label','care_plan.review_decisions_label',
    'care_hub.title',
    'resident_profile.title','resident_profile.subtitle','resident_profile.no_resident_title',
    'resident_profile.no_resident_body','resident_profile.edit_profile',
    'resident_profile.shared_notice_prefix','resident_profile.shared_notice_suffix',
    'resident_profile.memory_book_link','resident_profile.care_plan_link',
    'resident_profile.edit_form_title','resident_profile.edit_form_subtitle',
    'resident_profile.section_core_identity','resident_profile.section_background',
    'resident_profile.section_about','resident_profile.full_name_label',
    'resident_profile.full_name_placeholder','resident_profile.preferred_name_label',
    'resident_profile.preferred_name_placeholder','resident_profile.dob_label',
    'resident_profile.gender_label','resident_profile.gender_male','resident_profile.gender_female',
    'resident_profile.gender_non_binary','resident_profile.gender_prefer_not',
    'resident_profile.birthplace_label','resident_profile.birthplace_placeholder',
    'resident_profile.address_label','resident_profile.address_placeholder',
    'resident_profile.relationship_label','resident_profile.relationship_placeholder',
    'resident_profile.cultural_label','resident_profile.cultural_placeholder',
    'resident_profile.language_label','resident_profile.language_placeholder',
    'resident_profile.lives_at_label','resident_profile.about_label',
    'resident_profile.about_placeholder','resident_profile.no_about_narrative',
    'resident_profile.add_their_story','resident_profile.save_button',
    'resident_profile.add_more_details','resident_profile.add_background_details',
    'resident_profile.view_memory_book','resident_profile.view_care_plan',
    'resident_profile.full_name_required','resident_profile.save_success',
    'resident_profile.save_error','resident_profile.age_label',
    'resident_profile.fields_complete'
  )
ON CONFLICT (key, locale) DO NOTHING;
