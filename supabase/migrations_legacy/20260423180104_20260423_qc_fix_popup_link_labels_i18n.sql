/*
  # QC Fix — i18n keys for PopularTopicsSection link labels

  Adds two small UI label keys that were hardcoded instead of going through t():
  - public.community.topics_see_resources  — "See resources" link on public hub page
  - public.community.topics_browse_all     — "Browse all" link on authenticated landing page

  English only; other locales fall back automatically.
*/

INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'public.community.topics_see_resources', 'See resources'),
  ('en', 'public.community.topics_browse_all', 'Browse all')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
