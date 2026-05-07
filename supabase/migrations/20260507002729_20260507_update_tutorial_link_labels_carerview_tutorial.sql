/*
  # Update Tutorial Link Labels to "CarerView Tutorial"

  ## Summary
  Standardises the tutorial link label in both the nav header and footer across
  all 7 supported locales. Previously these labels read "Tour the App" / "App Tour"
  (and equivalents). They are now updated to "CarerView Tutorial" in each language.

  Also adds new keys used by the highlighted callout sections on public pages:
  - `tutorial.callout_heading` — section heading
  - `tutorial.callout_body`    — short description paragraph

  ## Changes
  - Updated `nav.tutorial` — all 7 locales
  - Updated `footer.tutorial_link` — all 7 locales
  - New key `tutorial.callout_heading` — all 7 locales
  - New key `tutorial.callout_body` — all 7 locales
*/

INSERT INTO public.ui_translations (key, locale, value)
VALUES
  -- English
  ('nav.tutorial',             'en', 'CarerView Tutorial'),
  ('footer.tutorial_link',     'en', 'CarerView Tutorial'),
  ('tutorial.callout_heading', 'en', 'See CarerView in action'),
  ('tutorial.callout_body',    'en', 'Take the guided CarerView Tutorial to see exactly how the tools work — from care planning to the Memory Book and beyond. It takes about 5 minutes.'),

  -- Spanish
  ('nav.tutorial',             'es', 'Tutorial de CarerView'),
  ('footer.tutorial_link',     'es', 'Tutorial de CarerView'),
  ('tutorial.callout_heading', 'es', 'Ve CarerView en acción'),
  ('tutorial.callout_body',    'es', 'Haz el tutorial guiado de CarerView para ver exactamente cómo funcionan las herramientas — desde la planificación del cuidado hasta el Libro de Memorias y más. Toma unos 5 minutos.'),

  -- Italian
  ('nav.tutorial',             'it', 'Tutorial CarerView'),
  ('footer.tutorial_link',     'it', 'Tutorial CarerView'),
  ('tutorial.callout_heading', 'it', 'Scopri CarerView in azione'),
  ('tutorial.callout_body',    'it', 'Segui il tutorial guidato di CarerView per vedere esattamente come funzionano gli strumenti — dalla pianificazione dell''assistenza al Memory Book e altro ancora. Dura circa 5 minuti.'),

  -- French
  ('nav.tutorial',             'fr', 'Tutoriel CarerView'),
  ('footer.tutorial_link',     'fr', 'Tutoriel CarerView'),
  ('tutorial.callout_heading', 'fr', 'Voir CarerView en action'),
  ('tutorial.callout_body',    'fr', 'Suivez le tutoriel guidé de CarerView pour voir exactement comment fonctionnent les outils — de la planification des soins au Livre de Mémoire et au-delà. Cela prend environ 5 minutes.'),

  -- German
  ('nav.tutorial',             'de', 'CarerView-Tutorial'),
  ('footer.tutorial_link',     'de', 'CarerView-Tutorial'),
  ('tutorial.callout_heading', 'de', 'CarerView in Aktion erleben'),
  ('tutorial.callout_body',    'de', 'Machen Sie das geführte CarerView-Tutorial, um genau zu sehen, wie die Tools funktionieren — von der Pflegeplanung bis zum Erinnerungsbuch und darüber hinaus. Es dauert etwa 5 Minuten.'),

  -- Swedish
  ('nav.tutorial',             'sv', 'CarerView-handledning'),
  ('footer.tutorial_link',     'sv', 'CarerView-handledning'),
  ('tutorial.callout_heading', 'sv', 'Se CarerView i praktiken'),
  ('tutorial.callout_body',    'sv', 'Gör den guidade CarerView-handledningen för att se exakt hur verktygen fungerar — från omsorgsplanering till Minnesboken och mer. Det tar ungefär 5 minuter.'),

  -- Finnish
  ('nav.tutorial',             'fi', 'CarerView-opastus'),
  ('footer.tutorial_link',     'fi', 'CarerView-opastus'),
  ('tutorial.callout_heading', 'fi', 'Katso CarerView toiminnassa'),
  ('tutorial.callout_body',    'fi', 'Tee ohjattu CarerView-opastus nähdäksesi tarkalleen, miten työkalut toimivat — hoitosuunnittelusta Muistikirjaan ja muuhun. Se kestää noin 5 minuuttia.')

ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
