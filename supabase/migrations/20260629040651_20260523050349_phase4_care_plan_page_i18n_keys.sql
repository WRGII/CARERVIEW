/*
  # Phase 4: Care Plan page-level, dashboard panels, and resident profile i18n keys

  Seeds the English translation keys used across the Care Plan and Resident Profile.
*/

INSERT INTO ui_translations (key, locale, value) VALUES

('care_plan.title', 'en', 'Care Plan'),
('care_plan.subtitle', 'en', 'Coordinate the team'),
('care_plan.description', 'en', 'The Care Plan is the care team''s big-picture operating plan. It covers who is responsible for what, what authority exists, how care will be arranged, and when the plan should be reviewed.'),
('care_plan.care_plan_for', 'en', 'Care plan for'),
('care_plan.progress_label', 'en', '{completed} of {total} sections complete'),
('care_plan.view_summary', 'en', 'View summary'),
('care_plan.load_error', 'en', 'Unable to load Care Plan. Please refresh the page.'),
('care_plan.status_complete', 'en', 'Complete'),
('care_plan.status_in_progress', 'en', 'In progress'),
('care_plan.status_not_started', 'en', 'Not started'),
('care_plan.no_team_title', 'en', 'No care team found'),
('care_plan.no_team_body', 'en', 'The Care Plan is linked to your care team. Set up your care team first to get started.'),
('care_plan.go_to_dashboard', 'en', 'Go to Dashboard'),
('care_plan.start_title', 'en', 'Start your Care Plan'),
('care_plan.start_body', 'en', 'Your team doesn''t have a Care Plan yet. Create one to coordinate responsibilities, authority, and living arrangements.'),
('care_plan.creating', 'en', 'Creating...'),
('care_plan.create_button', 'en', 'Create Care Plan'),
('care_plan.no_plan_title', 'en', 'No Care Plan yet'),
('care_plan.no_plan_body', 'en', 'The care team owner has not created a Care Plan yet. Check back later.'),
('care_plan.cta_start', 'en', 'Start'),
('care_plan.cta_open', 'en', 'Open'),
('care_plan.cta_continue', 'en', 'Continue'),
('care_plan.cta_review', 'en', 'Review'),
('care_plan.memory_book_label', 'en', 'Memory Book'),
('care_plan.memory_book_desc', 'en', 'Know the person — identity, health, preferences'),
('care_plan.observations_label', 'en', 'Observations'),
('care_plan.observations_desc', 'en', 'Track change — day-to-day functional notes'),
('care_plan.open_memory_book', 'en', 'Open Memory Book'),
('care_plan.all_sections_complete', 'en', 'All sections complete'),
('care_plan.summary_title', 'en', 'Care Plan Summary'),
('care_plan.summary_breadcrumb', 'en', 'Summary'),
('care_plan.print', 'en', 'Print'),
('care_plan.print_summary', 'en', 'Print summary'),
('care_plan.edit_care_plan', 'en', 'Edit Care Plan'),
('care_hub.title', 'en', 'Care Hub'),
('resident_profile.title', 'en', 'Resident Profile'),
('resident_profile.subtitle', 'en', 'The single source of truth for the person at the centre of your care.'),
('resident_profile.edit_profile', 'en', 'Edit Profile')

ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();