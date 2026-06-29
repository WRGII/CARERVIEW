/*
  # Update why.hero_title line 1 copy

  Changes "Caregiving is stressful!" to "Organizing care is stressful!" across all locales.
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
('en', 'why.hero_title', 'Organizing care is stressful!'),
('es', 'why.hero_title', '¡Organizar los cuidados es agotador!'),
('fr', 'why.hero_title', 'Organiser les soins est épuisant !'),
('it', 'why.hero_title', 'Organizzare le cure è stressante!'),
('de', 'why.hero_title', 'Die Pflege zu organisieren ist anstrengend!'),
('sv', 'why.hero_title', 'Att organisera vård är påfrestande!'),
('fi', 'why.hero_title', 'Hoidon järjestäminen on raskasta!')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
