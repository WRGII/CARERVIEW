
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'obs_edit.form_adl',             'ADL'),
  ('en', 'common', 'obs_edit.form_iadl',            'IADL'),
  ('en', 'common', 'obs_edit.form_comprehensive',   'Comprehensive'),
  ('en', 'common', 'obs_edit.observation_label',    'Observation'),
  ('en', 'common', 'obs_edit.readonly_notice',      'You are viewing this observation in read-only mode because you are not the author.'),
  ('en', 'common', 'obs_edit.frozen_notice',        'Your account has been suspended. You cannot edit observations at this time.'),
  ('en', 'common', 'obs_edit.render_error',         'Something went wrong loading this observation.'),
  ('en', 'common', 'obs_edit.render_error_detail',  'Please refresh the page or go back to the dashboard.'),
  ('en', 'common', 'obs_form.comprehensive_label',  'Comprehensive (ADL + IADL)')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
