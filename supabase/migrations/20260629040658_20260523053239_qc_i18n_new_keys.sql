/*
  # QC i18n: Seed new translation keys from QC audit

  Seeds English translations for all hardcoded strings identified during the
  i18n QC audit.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('common.view',       'en', 'View'),
  ('common.open',       'en', 'Open'),
  ('common.complete',   'en', 'Complete'),
  ('common.incomplete', 'en', 'Incomplete'),
  ('dashboard.resident_title',        'en', 'Resident'),
  ('dashboard.resident_subtitle',     'en', 'Person at the centre of care'),
  ('dashboard.resident_known_as',     'en', 'Known as "{name}"'),
  ('dashboard.resident_age',          'en', 'Age {age}'),
  ('dashboard.resident_profile_pct',  'en', 'Profile {pct}% complete'),
  ('dashboard.resident_complete_cta', 'en', 'Complete the resident profile →'),
  ('dashboard.mb_title',                  'en', 'Memory Book'),
  ('dashboard.mb_subtitle',               'en', 'Know the person'),
  ('dashboard.mb_sections_have_content',  'en', 'of {total} sections have content'),
  ('dashboard.mb_section_identity',       'en', 'Identity'),
  ('dashboard.mb_section_contacts',       'en', 'Contacts'),
  ('dashboard.mb_section_medical',        'en', 'Medical'),
  ('dashboard.mb_section_daily_living',   'en', 'Daily Living & Preferences'),
  ('dashboard.medical_title',       'en', 'Medical Summary'),
  ('dashboard.medical_subtitle',    'en', 'From the Memory Book'),
  ('dashboard.medical_view_link',   'en', 'View Memory Book'),
  ('dashboard.medical_conditions',  'en', 'Conditions'),
  ('dashboard.medical_medications', 'en', 'Medications'),
  ('dashboard.medical_allergies',   'en', 'Allergies'),
  ('dashboard.medical_hearing',     'en', 'Hearing'),
  ('dashboard.medical_vision',      'en', 'Vision'),
  ('care_plan.section_situation',         'en', 'Situation'),
  ('care_plan.section_authority',         'en', 'Authority'),
  ('care_plan.section_responsibilities',  'en', 'Responsibilities'),
  ('care_plan.section_living_arrangement','en', 'Living Arrangement'),
  ('care_plan.section_sustainability',    'en', 'Sustainability'),
  ('care_plan.section_review',            'en', 'Review'),
  ('care_plan.section_counter', 'en', 'Section {current} of {total}'),
  ('care_plan.modal_back',      'en', 'Back'),
  ('caregiver.subtitle_care_plan',    'en', 'Your care plan progress is shown below.'),
  ('caregiver.subtitle_memory_book',  'en', 'Your care plan, memory book and observations progress is shown below.'),
  ('caregiver.subtitle_observations', 'en', 'Your recent observations are shown below.'),
  ('caregiver.subtitle_default',      'en', 'Here is a summary of your current care activities.'),
  ('caregiver.obs_empty',      'en', 'No observations recorded yet.'),
  ('caregiver.obs_empty_cta',  'en', 'Record your first observation →'),
  ('caregiver.obs_view_all',   'en', 'View all {count} observations →'),
  ('caregiver.subscriber_tools_heading', 'en', 'Subscriber tools'),
  ('caregiver.upsell_mb_desc',           'en', 'Know the person — identity, health, preferences, contacts'),
  ('caregiver.upsell_cp_desc',           'en', 'Coordinate the team — roles, authority, sustainability'),
  ('caregiver.upsell_upgrade_cta',       'en', 'Upgrade to access')

ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();