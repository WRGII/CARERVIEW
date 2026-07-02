
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'landing.hero_title', 'Better care starts with a better plan.'),
  ('en', 'common', 'landing.hero_body',  'CarerView helps families create a living care plan, coordinate responsibilities, track meaningful changes, and keep everyone aligned as care needs evolve.'),

  ('es', 'common', 'landing.hero_title', 'Un mejor cuidado comienza con un mejor plan.'),
  ('es', 'common', 'landing.hero_body',  'CarerView ayuda a las familias a crear un plan de cuidado dinámico, coordinar responsabilidades, registrar cambios importantes y mantener a todos alineados a medida que las necesidades evolucionan.'),

  ('de', 'common', 'landing.hero_title', 'Bessere Pflege beginnt mit einem besseren Plan.'),
  ('de', 'common', 'landing.hero_body',  'CarerView hilft Familien dabei, einen lebendigen Pflegeplan zu erstellen, Verantwortlichkeiten zu koordinieren, bedeutsame Veränderungen zu verfolgen und alle auf dem gleichen Stand zu halten.'),

  ('fr', 'common', 'landing.hero_title', 'Un meilleur soin commence par un meilleur plan.'),
  ('fr', 'common', 'landing.hero_body',  'CarerView aide les familles à créer un plan de soin évolutif, à coordonner les responsabilités, à suivre les changements importants et à maintenir tout le monde aligné à mesure que les besoins évoluent.'),

  ('it', 'common', 'landing.hero_title', 'Una cura migliore inizia con un piano migliore.'),
  ('it', 'common', 'landing.hero_body',  'CarerView aiuta le famiglie a creare un piano di cura dinamico, coordinare le responsabilità, monitorare i cambiamenti significativi e mantenere tutti allineati con l''evolversi dei bisogni.'),

  ('sv', 'common', 'landing.hero_title', 'Bättre omsorg börjar med en bättre plan.'),
  ('sv', 'common', 'landing.hero_body',  'CarerView hjälper familjer att skapa en levande omsorgsplan, samordna ansvar, följa meningsfulla förändringar och hålla alla i linje när behoven förändras.'),

  ('fi', 'common', 'landing.hero_title', 'Parempi hoiva alkaa paremmasta suunnitelmasta.'),
  ('fi', 'common', 'landing.hero_body',  'CarerView auttaa perheitä luomaan elävän hoivasuunnitelman, koordinoimaan vastuita, seuraamaan merkittäviä muutoksia ja pitämään kaikki ajan tasalla hoivatarpeiden kehittyessä.'),

  ('ja', 'common', 'landing.hero_title', 'より良いケアは、より良い計画から始まります。'),
  ('ja', 'common', 'landing.hero_body',  'CarerViewは、家族がケアプランを作成し、責任を調整し、重要な変化を記録し、ケアニーズの変化に合わせて全員の連携を保つためのツールです。')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
