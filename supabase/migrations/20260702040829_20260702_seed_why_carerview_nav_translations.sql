INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('de', 'common', 'nav.why_carerview', 'Warum Ihre Familie CarerView braucht'),
  ('fr', 'common', 'nav.why_carerview', 'Pourquoi votre famille a besoin de CarerView'),
  ('it', 'common', 'nav.why_carerview', 'Perché la tua famiglia ha bisogno di CarerView'),
  ('ja', 'common', 'nav.why_carerview', 'ご家族にCarerViewが必要な理由')
ON CONFLICT (locale, namespace, key) DO NOTHING;
