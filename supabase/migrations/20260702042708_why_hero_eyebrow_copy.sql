
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'why.hero_eyebrow', 'Why CarerView'),
  ('es', 'common', 'why.hero_eyebrow', 'Por qué CarerView'),
  ('de', 'common', 'why.hero_eyebrow', 'Warum CarerView'),
  ('fr', 'common', 'why.hero_eyebrow', 'Pourquoi CarerView'),
  ('it', 'common', 'why.hero_eyebrow', 'Perché CarerView'),
  ('sv', 'common', 'why.hero_eyebrow', 'Varför CarerView'),
  ('fi', 'common', 'why.hero_eyebrow', 'Miksi CarerView'),
  ('ja', 'common', 'why.hero_eyebrow', 'CarerViewとは')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
