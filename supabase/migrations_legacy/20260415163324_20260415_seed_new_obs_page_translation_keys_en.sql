/*
  # Seed missing New Observation page translation keys (English)

  ## Summary
  Adds 11 missing English translation keys used by the New Observation page
  (/caregiver/observations/new). These keys were referenced in code but absent
  from the database, causing raw key names to be displayed instead of text.

  ## New Keys Added (locale = 'en')
  - new_obs.page_title       - Browser/page title
  - new_obs.create_title     - Main heading on the page
  - new_obs.choose_type      - Subheading instructing the user to pick a type
  - new_obs.adl_title        - ADL tile title
  - new_obs.adl_desc         - ADL tile description
  - new_obs.iadl_title       - IADL tile title
  - new_obs.iadl_desc        - IADL tile description
  - new_obs.comprehensive_title - Comprehensive tile title
  - new_obs.comprehensive_desc  - Comprehensive tile description (mentions 100/year quota)
  - new_obs.remaining_prefix - Label before remaining quota count
  - common.start             - Generic "Start" button label

  ## Notes
  - Uses ON CONFLICT DO NOTHING to be safe if any key already exists
  - English only; other locales to be added separately
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('new_obs.page_title',          'en', 'New Observation'),
  ('new_obs.create_title',        'en', 'Create a New Observation'),
  ('new_obs.choose_type',         'en', 'Choose the type of observation you want to record.'),
  ('new_obs.adl_title',           'en', 'Activities of Daily Living'),
  ('new_obs.adl_desc',            'en', 'Assess basic self-care tasks such as bathing, dressing, eating, and mobility.'),
  ('new_obs.iadl_title',          'en', 'Instrumental Activities of Daily Living'),
  ('new_obs.iadl_desc',           'en', 'Assess complex daily skills such as managing medications, finances, and transportation.'),
  ('new_obs.comprehensive_title', 'en', 'Comprehensive Assessment'),
  ('new_obs.comprehensive_desc',  'en', 'A full ADL and IADL assessment in one. Uses 1 of your 100 yearly observations.'),
  ('new_obs.remaining_prefix',    'en', 'Observations remaining this year:'),
  ('common.start',                'en', 'Start')
ON CONFLICT (key, locale) DO NOTHING;
