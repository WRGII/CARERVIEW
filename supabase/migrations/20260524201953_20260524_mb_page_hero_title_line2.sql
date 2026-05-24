/*
  # Memory Book hero title — line 2 i18n key

  Adds mb_page.hero_title_line2 for all 7 locales to support the new
  two-line split heading on the Memory Book public page, matching the
  WhyCarerView hero design pattern.
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
('en', 'mb_page.hero_title_line2', 'in one place.'),
('es', 'mb_page.hero_title_line2', 'en un solo lugar.'),
('fr', 'mb_page.hero_title_line2', 'au même endroit.'),
('it', 'mb_page.hero_title_line2', 'in un unico posto.'),
('de', 'mb_page.hero_title_line2', 'an einem Ort.'),
('sv', 'mb_page.hero_title_line2', 'på ett ställe.'),
('fi', 'mb_page.hero_title_line2', 'yhdessä paikassa.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Trim hero_title to just the first part (remove "in one place" — now on line 2)
INSERT INTO public.ui_translations (locale, key, value) VALUES
('en', 'mb_page.hero_title', 'Everything your care team needs —'),
('es', 'mb_page.hero_title', 'Todo lo que tu equipo de cuidado necesita —'),
('fr', 'mb_page.hero_title', 'Tout ce que votre équipe a besoin —'),
('it', 'mb_page.hero_title', 'Tutto ciò di cui il tuo team ha bisogno —'),
('de', 'mb_page.hero_title', 'Alles, was Ihr Pflegeteam braucht —'),
('sv', 'mb_page.hero_title', 'Allt ditt vårdteam behöver —'),
('fi', 'mb_page.hero_title', 'Kaikki mitä hoitotiimisi tarvitsee —')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
