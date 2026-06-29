
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('en', 'common', 'new_obs.page_title',          'New Observation'),
  ('en', 'common', 'new_obs.create_title',        'Create a New Observation'),
  ('en', 'common', 'new_obs.choose_type',         'Choose the type of observation you want to record.'),
  ('en', 'common', 'new_obs.adl_title',           'Activities of Daily Living'),
  ('en', 'common', 'new_obs.adl_desc',            'Assess basic self-care tasks such as bathing, dressing, eating, and mobility.'),
  ('en', 'common', 'new_obs.iadl_title',          'Instrumental Activities of Daily Living'),
  ('en', 'common', 'new_obs.iadl_desc',           'Assess complex daily skills such as managing medications, finances, and transportation.'),
  ('en', 'common', 'new_obs.comprehensive_title', 'Comprehensive Assessment'),
  ('en', 'common', 'new_obs.comprehensive_desc',  'A full ADL and IADL assessment in one. Uses 1 of your 100 yearly observations.'),
  ('en', 'common', 'new_obs.remaining_prefix',    'Observations remaining this year:'),
  ('en', 'common', 'common.start',                'Start')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
