/*
  # Phase 1: Care Plan, Care Hub, and Resident Profile i18n Translation Keys

  Seeds all English (en) and Spanish stub (es) translation keys.
*/

INSERT INTO ui_translations (key, locale, value) VALUES

('care_plan.modal_section_of', 'en', 'Section {current} of {total}'),
('care_plan.modal_close', 'en', 'Close'),
('care_plan.modal_read_only_notice', 'en', 'You can view this section but only the team owner can make changes.'),
('care_plan.modal_unsaved_changes', 'en', 'You have unsaved changes. Leave without saving?'),
('care_plan.modal_save_error', 'en', 'Save failed. Please check your connection and try again.'),
('care_plan.modal_save', 'en', 'Save'),
('care_plan.modal_saving', 'en', 'Saving...'),
('care_plan.modal_saved', 'en', 'Saved'),
('care_plan.modal_mark_complete', 'en', 'Mark complete'),
('care_plan.situation_preamble', 'en', 'Describe the current care situation at a high level. This section should capture the big picture — not clinical detail (that belongs in the Memory Book).'),
('care_plan.situation_field_current_label', 'en', 'What is the current care situation?'),
('care_plan.situation_field_current_hint', 'en', 'A brief summary of what has led to the caring role and what care is currently needed.'),
('care_plan.situation_field_current_placeholder', 'en', 'e.g. Mum was diagnosed with early-stage dementia in January. She lives alone and has been managing well but is starting to need daily support with medications and appointments...'),
('care_plan.situation_field_trigger_label', 'en', 'What changed recently that triggered the need for more care?'),
('care_plan.situation_field_trigger_hint', 'en', 'A specific event, decline, or decision that brought things to a head.'),
('care_plan.situation_field_trigger_placeholder', 'en', 'e.g. A fall at home in March, a hospital stay, a GP referral, or a noticeable change in capacity...'),
('care_plan.situation_field_concerns_label', 'en', 'What are the biggest concerns right now?'),
('care_plan.situation_field_concerns_hint', 'en', 'Select all that apply.'),
('care_plan.authority_preamble', 'en', 'Authority must be established, not assumed. Being the nearest relative does not automatically mean having legal authority over health decisions, finances, or records. Use this section to map what is in place and what still needs to be resolved.'),
('care_plan.authority_status_confirmed', 'en', 'Confirmed'),
('care_plan.authority_status_unclear', 'en', 'Unclear'),
('care_plan.authority_status_missing', 'en', 'Missing'),
('care_plan.authority_status_not_applicable', 'en', 'Not applicable')

ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();