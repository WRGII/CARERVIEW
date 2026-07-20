/*
# Seed missing nav i18n keys

1. Purpose
- The unified navigation registry (src/lib/navigation.ts) surfaces
  `nav.pricing`, `nav.caregiver_forum`, and `nav.memory_book_short`
  across the header, mobile drawer, sidebar, and footer.
- Several locales are missing values for these keys, which would render
  the raw key string in the UI. This migration seeds the gaps.

2. Keys seeded
- nav.pricing        -> de, fr, it, ja  (en/es/fi/sv already present)
- nav.caregiver_forum -> ja             (all other locales present)
- nav.memory_book_short -> ja           (all other locales present)

3. Approach
- INSERT ... ON CONFLICT (locale, namespace, key) DO NOTHING so re-runs
  are safe and existing translations are never overwritten.
- Namespace is 'common' for all nav.* keys.
*/

INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('de', 'common', 'nav.pricing', 'Preise'),
  ('fr', 'common', 'nav.pricing', 'Tarifs'),
  ('it', 'common', 'nav.pricing', 'Prezzi'),
  ('ja', 'common', 'nav.pricing', '料金'),
  ('ja', 'common', 'nav.caregiver_forum', '介護者コミュニティ'),
  ('ja', 'common', 'nav.memory_book_short', 'メモリーブック')
ON CONFLICT (locale, namespace, key) DO NOTHING;
