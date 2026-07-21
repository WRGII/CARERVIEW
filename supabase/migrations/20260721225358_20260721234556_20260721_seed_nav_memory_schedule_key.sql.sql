-- Seed the missing nav.memory_schedule key across all 8 supported locales.
-- This key is referenced in AUTHED_NAV (src/lib/navigation.ts) and rendered by
-- CareHubSideNav.tsx, but was never inserted into ui_translations, causing the
-- raw key string to appear in the authed sidebar.

INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'nav.memory_schedule', 'Memory & Schedule'),
  ('es', 'common', 'nav.memory_schedule', 'Memoria y Agenda'),
  ('fr', 'common', 'nav.memory_schedule', 'Mémoire et Agenda'),
  ('de', 'common', 'nav.memory_schedule', 'Erinnerung & Terminplan'),
  ('it', 'common', 'nav.memory_schedule', 'Memoria e Agenda'),
  ('sv', 'common', 'nav.memory_schedule', 'Minne och Schema'),
  ('fi', 'common', 'nav.memory_schedule', 'Muisti ja Aikataulu'),
  ('ja', 'common', 'nav.memory_schedule', 'メモリーとスケジュール')
ON CONFLICT (locale, namespace, key) DO UPDATE
SET value = EXCLUDED.value;
