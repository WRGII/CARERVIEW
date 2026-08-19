/*
  # QC i18n: Seed new translation keys from QC audit

  ## Summary
  Seeds English translations for all hardcoded strings identified during the
  i18n QC audit, covering:

  1. dashboard.* — DashboardResidentPanel, DashboardMemoryBookPanel, MedicalSummaryCard
  2. common.* — shared UI labels (view, open, complete, incomplete)
  3. care_plan.section_* — getSectionLabels / getSectionSubtitles helper output
  4. care_plan.section_counter, care_plan.modal_back — SectionFormModal
  5. caregiver.* — context subtitles, obs_empty, obs_view_all, subscriber tools, upsell
  6. Patch: adds missing resident_profile.fields_complete Spanish stub

  All non-English locales get [ES]/[FR] etc. stubs so the Admin Translations
  editor can identify untranslated strings.
*/

-- ── 1. common.* shared labels ─────────────────────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('common.view',       'en', 'View'),
  ('common.open',       'en', 'Open'),
  ('common.complete',   'en', 'Complete'),
  ('common.incomplete', 'en', 'Incomplete')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 2. dashboard.* — DashboardResidentPanel ────────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('dashboard.resident_title',        'en', 'Resident'),
  ('dashboard.resident_subtitle',     'en', 'Person at the centre of care'),
  ('dashboard.resident_known_as',     'en', 'Known as "{name}"'),
  ('dashboard.resident_age',          'en', 'Age {age}'),
  ('dashboard.resident_profile_pct',  'en', 'Profile {pct}% complete'),
  ('dashboard.resident_complete_cta', 'en', 'Complete the resident profile →')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 3. dashboard.* — DashboardMemoryBookPanel ─────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('dashboard.mb_title',                  'en', 'Memory Book'),
  ('dashboard.mb_subtitle',               'en', 'Know the person'),
  ('dashboard.mb_sections_have_content',  'en', 'of {total} sections have content'),
  ('dashboard.mb_section_identity',       'en', 'Identity'),
  ('dashboard.mb_section_contacts',       'en', 'Contacts'),
  ('dashboard.mb_section_medical',        'en', 'Medical'),
  ('dashboard.mb_section_daily_living',   'en', 'Daily Living & Preferences')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 4. dashboard.* — MedicalSummaryCard ───────────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('dashboard.medical_title',       'en', 'Medical Summary'),
  ('dashboard.medical_subtitle',    'en', 'From the Memory Book'),
  ('dashboard.medical_view_link',   'en', 'View Memory Book'),
  ('dashboard.medical_conditions',  'en', 'Conditions'),
  ('dashboard.medical_medications', 'en', 'Medications'),
  ('dashboard.medical_allergies',   'en', 'Allergies'),
  ('dashboard.medical_hearing',     'en', 'Hearing'),
  ('dashboard.medical_vision',      'en', 'Vision')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 5. care_plan.section_* — getSectionLabels ─────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('care_plan.section_situation',         'en', 'Situation'),
  ('care_plan.section_authority',         'en', 'Authority'),
  ('care_plan.section_responsibilities',  'en', 'Responsibilities'),
  ('care_plan.section_living_arrangement','en', 'Living Arrangement'),
  ('care_plan.section_sustainability',    'en', 'Sustainability'),
  ('care_plan.section_review',            'en', 'Review')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 6. care_plan.section_subtitle_* — getSectionSubtitles ────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('care_plan.section_subtitle_situation',          'en', 'What is happening and what needs attention'),
  ('care_plan.section_subtitle_authority',          'en', 'Who can make decisions and access information'),
  ('care_plan.section_subtitle_responsibilities',   'en', 'Who owns which care responsibilities'),
  ('care_plan.section_subtitle_living_arrangement', 'en', 'Where and how care should happen'),
  ('care_plan.section_subtitle_sustainability',     'en', 'Protecting the caregiver from overload'),
  ('care_plan.section_subtitle_review',             'en', 'Keeping the plan current over time')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 7. care_plan.section_counter & modal_back — SectionFormModal ─────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('care_plan.section_counter', 'en', 'Section {current} of {total}'),
  ('care_plan.modal_back',      'en', 'Back')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 8. caregiver.* — context subtitles ────────────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('caregiver.subtitle_care_plan',    'en', 'Your care plan progress is shown below.'),
  ('caregiver.subtitle_memory_book',  'en', 'Your care plan, memory book and observations progress is shown below.'),
  ('caregiver.subtitle_observations', 'en', 'Your recent observations are shown below.'),
  ('caregiver.subtitle_default',      'en', 'Here is a summary of your current care activities.')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 9. caregiver.* — observations section ─────────────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('caregiver.obs_empty',      'en', 'No observations recorded yet.'),
  ('caregiver.obs_empty_cta',  'en', 'Record your first observation →'),
  ('caregiver.obs_view_all',   'en', 'View all {count} observations →')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 10. caregiver.* — upsell section (free users) ────────────────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('caregiver.subscriber_tools_heading', 'en', 'Subscriber tools'),
  ('caregiver.upsell_mb_desc',           'en', 'Know the person — identity, health, preferences, contacts'),
  ('caregiver.upsell_cp_desc',           'en', 'Coordinate the team — roles, authority, sustainability'),
  ('caregiver.upsell_upgrade_cta',       'en', 'Upgrade to access')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 11. Patch: resident_profile.fields_complete Spanish stub ──────────────────

INSERT INTO ui_translations (key, locale, value) VALUES
  ('resident_profile.fields_complete', 'es', '[ES] {filled} of {total} fields complete')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 12. Spanish stubs for all new keys ────────────────────────────────────────

INSERT INTO ui_translations (key, locale, value)
SELECT key, 'es', '[ES] ' || value
FROM ui_translations
WHERE locale = 'en'
  AND key IN (
    'common.view', 'common.open', 'common.complete', 'common.incomplete',
    'dashboard.resident_title', 'dashboard.resident_subtitle',
    'dashboard.resident_known_as', 'dashboard.resident_age',
    'dashboard.resident_profile_pct', 'dashboard.resident_complete_cta',
    'dashboard.mb_title', 'dashboard.mb_subtitle',
    'dashboard.mb_sections_have_content', 'dashboard.mb_section_identity',
    'dashboard.mb_section_contacts', 'dashboard.mb_section_medical',
    'dashboard.mb_section_daily_living',
    'dashboard.medical_title', 'dashboard.medical_subtitle',
    'dashboard.medical_view_link', 'dashboard.medical_conditions',
    'dashboard.medical_medications', 'dashboard.medical_allergies',
    'dashboard.medical_hearing', 'dashboard.medical_vision',
    'care_plan.section_situation', 'care_plan.section_authority',
    'care_plan.section_responsibilities', 'care_plan.section_living_arrangement',
    'care_plan.section_sustainability', 'care_plan.section_review',
    'care_plan.section_subtitle_situation', 'care_plan.section_subtitle_authority',
    'care_plan.section_subtitle_responsibilities',
    'care_plan.section_subtitle_living_arrangement',
    'care_plan.section_subtitle_sustainability', 'care_plan.section_subtitle_review',
    'care_plan.section_counter', 'care_plan.modal_back',
    'caregiver.subtitle_care_plan', 'caregiver.subtitle_memory_book',
    'caregiver.subtitle_observations', 'caregiver.subtitle_default',
    'caregiver.obs_empty', 'caregiver.obs_empty_cta', 'caregiver.obs_view_all',
    'caregiver.subscriber_tools_heading', 'caregiver.upsell_mb_desc',
    'caregiver.upsell_cp_desc', 'caregiver.upsell_upgrade_cta'
  )
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- ── 13. French, German, Italian, Swedish, Finnish stubs ───────────────────────

INSERT INTO ui_translations (key, locale, value)
SELECT key, other_locale.locale, '[' || upper(other_locale.locale) || '] ' || value
FROM ui_translations
CROSS JOIN (VALUES ('fr'), ('de'), ('it'), ('sv'), ('fi')) AS other_locale(locale)
WHERE ui_translations.locale = 'en'
  AND key IN (
    'common.view', 'common.open', 'common.complete', 'common.incomplete',
    'dashboard.resident_title', 'dashboard.resident_subtitle',
    'dashboard.resident_known_as', 'dashboard.resident_age',
    'dashboard.resident_profile_pct', 'dashboard.resident_complete_cta',
    'dashboard.mb_title', 'dashboard.mb_subtitle',
    'dashboard.mb_sections_have_content', 'dashboard.mb_section_identity',
    'dashboard.mb_section_contacts', 'dashboard.mb_section_medical',
    'dashboard.mb_section_daily_living',
    'dashboard.medical_title', 'dashboard.medical_subtitle',
    'dashboard.medical_view_link', 'dashboard.medical_conditions',
    'dashboard.medical_medications', 'dashboard.medical_allergies',
    'dashboard.medical_hearing', 'dashboard.medical_vision',
    'care_plan.section_situation', 'care_plan.section_authority',
    'care_plan.section_responsibilities', 'care_plan.section_living_arrangement',
    'care_plan.section_sustainability', 'care_plan.section_review',
    'care_plan.section_subtitle_situation', 'care_plan.section_subtitle_authority',
    'care_plan.section_subtitle_responsibilities',
    'care_plan.section_subtitle_living_arrangement',
    'care_plan.section_subtitle_sustainability', 'care_plan.section_subtitle_review',
    'care_plan.section_counter', 'care_plan.modal_back',
    'caregiver.subtitle_care_plan', 'caregiver.subtitle_memory_book',
    'caregiver.subtitle_observations', 'caregiver.subtitle_default',
    'caregiver.obs_empty', 'caregiver.obs_empty_cta', 'caregiver.obs_view_all',
    'caregiver.subscriber_tools_heading', 'caregiver.upsell_mb_desc',
    'caregiver.upsell_cp_desc', 'caregiver.upsell_upgrade_cta'
  )
ON CONFLICT (locale, namespace, key) DO NOTHING;
