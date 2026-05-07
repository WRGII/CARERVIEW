/*
  # Update Memory Book hero title — remove "Carers" prefix

  Changes `mb_page.hero_title` from:
    "Carers 'needs to know' all in one place"
  to:
    "'Needs-To-Know' all in one place"

  Applied to all 7 supported locales. Each locale's phrasing is adapted
  to match its existing style while removing the "Carers" word.
*/

INSERT INTO public.ui_translations (key, locale, value)
VALUES
  ('mb_page.hero_title', 'en', '"Needs-To-Know" all in one place'),
  ('mb_page.hero_title', 'es', '"Necesitas-Saber" todo en un solo lugar'),
  ('mb_page.hero_title', 'it', '"Necessità-di-Sapere" tutto in un unico posto'),
  ('mb_page.hero_title', 'fr', '«À-Savoir» tout au même endroit'),
  ('mb_page.hero_title', 'de', '„Wissen-Müssen" alles an einem Ort'),
  ('mb_page.hero_title', 'sv', '"Behöver-Veta" allt på ett ställe'),
  ('mb_page.hero_title', 'fi', '"Täytyy-Tietää" kaikki yhdessä paikassa')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
