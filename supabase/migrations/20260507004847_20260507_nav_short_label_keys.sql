/*
  # Add condensed nav label keys for desktop header

  ## Summary
  The public header desktop nav needs shorter link labels to prevent overflow
  at standard desktop widths. Two new keys are added:

  - `nav.memory_book_short` — compact label for the Memory Book nav link
    ("Memory Book" instead of "Why a Memory Book")
  - `nav.tutorial_short` — compact label for the Tutorial nav link
    ("Tutorial" instead of "CarerView Tutorial"), used alongside the icon

  Full labels are kept for the mobile drawer and any other usage.
*/

INSERT INTO public.ui_translations (key, locale, value)
VALUES
  ('nav.memory_book_short', 'en', 'Memory Book'),
  ('nav.memory_book_short', 'es', 'Libro de Memoria'),
  ('nav.memory_book_short', 'it', 'Libro dei Ricordi'),
  ('nav.memory_book_short', 'fr', 'Livre de Mémoire'),
  ('nav.memory_book_short', 'de', 'Erinnerungsbuch'),
  ('nav.memory_book_short', 'sv', 'Minnesbok'),
  ('nav.memory_book_short', 'fi', 'Muistikirja'),

  ('nav.tutorial_short', 'en', 'Tutorial'),
  ('nav.tutorial_short', 'es', 'Tutorial'),
  ('nav.tutorial_short', 'it', 'Tutorial'),
  ('nav.tutorial_short', 'fr', 'Tutoriel'),
  ('nav.tutorial_short', 'de', 'Tutorial'),
  ('nav.tutorial_short', 'sv', 'Handledning'),
  ('nav.tutorial_short', 'fi', 'Opastus')

ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
