
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'why.hero_title',       'The heart is where caring begins.'),
  ('en', 'common', 'why.hero_title_line2', 'A plan is how caregiving succeeds.'),
  ('es', 'common', 'why.hero_title',       'El corazón es donde comienza el cuidado.'),
  ('es', 'common', 'why.hero_title_line2', 'Un plan es cómo el cuidado tiene éxito.'),
  ('de', 'common', 'why.hero_title',       'Das Herz ist der Ausgangspunkt der Fürsorge.'),
  ('de', 'common', 'why.hero_title_line2', 'Ein Plan ist der Weg zum Erfolg in der Pflege.'),
  ('fr', 'common', 'why.hero_title',       'Le cœur est là où commence le soin.'),
  ('fr', 'common', 'why.hero_title_line2', 'Un plan est la façon dont l''aide réussit.'),
  ('it', 'common', 'why.hero_title',       'Il cuore è dove inizia la cura.'),
  ('it', 'common', 'why.hero_title_line2', 'Un piano è il modo in cui la cura ha successo.'),
  ('sv', 'common', 'why.hero_title',       'Hjärtat är där omsorgen börjar.'),
  ('sv', 'common', 'why.hero_title_line2', 'En plan är hur omvårdnaden lyckas.'),
  ('fi', 'common', 'why.hero_title',       'Sydän on hoivan alkulähde.'),
  ('fi', 'common', 'why.hero_title_line2', 'Suunnitelma on tapa onnistua hoivassa.'),
  ('ja', 'common', 'why.hero_title',       '心こそが、ケアの始まりです。'),
  ('ja', 'common', 'why.hero_title_line2', '計画こそが、ケアを成功へと導きます。')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
