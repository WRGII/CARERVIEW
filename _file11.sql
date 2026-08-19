/*
  # Why page hero title split into two lines

  Updates why.hero_title to "Caregiving is stressful!" and adds
  why.hero_title_line2 "CarerView brings harmony..." for all supported locales.
*/

-- Update line 1
INSERT INTO public.ui_translations (locale, key, value) VALUES
('en', 'why.hero_title', 'Caregiving is stressful!'),
('es', 'why.hero_title', '¡Cuidar es agotador!'),
('fr', 'why.hero_title', 'S''occuper d''un proche est épuisant !'),
('it', 'why.hero_title', 'Prendersi cura è stressante!'),
('de', 'why.hero_title', 'Pflegen ist anstrengend!'),
('sv', 'why.hero_title', 'Att vårda är påfrestande!'),
('fi', 'why.hero_title', 'Hoivaaminen on raskasta!')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Add line 2
INSERT INTO public.ui_translations (locale, key, value) VALUES
('en', 'why.hero_title_line2', 'CarerView brings harmony...'),
('es', 'why.hero_title_line2', 'CarerView trae armonía...'),
('fr', 'why.hero_title_line2', 'CarerView apporte l''harmonie...'),
('it', 'why.hero_title_line2', 'CarerView porta armonia...'),
('de', 'why.hero_title_line2', 'CarerView bringt Harmonie...'),
('sv', 'why.hero_title_line2', 'CarerView skapar harmoni...'),
('fi', 'why.hero_title_line2', 'CarerView tuo harmoniaa...')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
