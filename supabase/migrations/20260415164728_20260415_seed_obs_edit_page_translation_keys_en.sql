/*
  # Seed missing obs_edit.* and fix obs_form.* translation keys (EN)

  ## Summary
  Fixes all missing/broken translation keys visible on the Observation Edit page:

  1. New obs_edit.* keys (8 keys)
     - obs_edit.form_adl         – breadcrumb label for ADL observations
     - obs_edit.form_iadl        – breadcrumb label for IADL observations
     - obs_edit.form_comprehensive – breadcrumb label for Comprehensive observations
     - obs_edit.observation_label  – the word "Observation" appended in the breadcrumb
     - obs_edit.readonly_notice  – banner when viewing someone else's observation
     - obs_edit.frozen_notice    – banner when member account is frozen
     - obs_edit.render_error     – error boundary title
     - obs_edit.render_error_detail – error boundary detail text

  2. Fix obs_form.scored_count variable name mismatch
     - Old value used {count} but code passes { scored, total }
     - Updated to use {scored} so interpolation works correctly
     - This fixes the "{count} of 18 scored" literal display bug

  3. Fix incomplete placeholder values
     - obs_form.notes_placeholder was truncated ("Add notes for")
     - obs_form.cat_notes_placeholder was truncated ("Add notes for")

  4. Add missing obs_form.comprehensive_label key
*/

-- obs_edit.* keys
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('en', 'obs_edit.form_adl',             'ADL'),
  ('en', 'obs_edit.form_iadl',            'IADL'),
  ('en', 'obs_edit.form_comprehensive',   'Comprehensive'),
  ('en', 'obs_edit.observation_label',    'Observation'),
  ('en', 'obs_edit.readonly_notice',      'You are viewing this observation in read-only mode because you are not the author.'),
  ('en', 'obs_edit.frozen_notice',        'Your account has been suspended. You cannot edit observations at this time.'),
  ('en', 'obs_edit.render_error',         'Something went wrong loading this observation.'),
  ('en', 'obs_edit.render_error_detail',  'Please refresh the page or go back to the dashboard.')
ON CONFLICT (locale, key) DO NOTHING;

-- Fix obs_form.scored_count: change {count} → {scored} to match code params
UPDATE ui_translations
SET value = '{scored} of {total} scored'
WHERE locale = 'en' AND key = 'obs_form.scored_count' AND value = '{count} of {total} scored';

-- Fix truncated placeholder values
UPDATE ui_translations
SET value = 'Any general observations about today''s visit…'
WHERE locale = 'en' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations
SET value = 'Add notes specific to this category…'
WHERE locale = 'en' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';

-- Add missing obs_form.comprehensive_label if not present
INSERT INTO ui_translations (locale, key, value)
VALUES ('en', 'obs_form.comprehensive_label', 'Comprehensive (ADL + IADL)')
ON CONFLICT (locale, key) DO NOTHING;
