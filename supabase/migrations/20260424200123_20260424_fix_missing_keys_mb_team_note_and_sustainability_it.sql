/*
  # Fix: Add missing mb_team_note key and fix Italian sustainability eyebrow typo

  Adds the landing.mb_team_note key for all 7 locales.
  Fixes the Italian sustainability_eyebrow key (was accidentally seeded as sustainability_eybrow).
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

-- mb_team_note
('en', 'landing.mb_team_note', 'Every team member knows what they are responsible for. The Memory Book gives them the context to do it well — instantly, with no setup required.'),
('es', 'landing.mb_team_note', 'Cada miembro del equipo sabe de qué es responsable. El Memory Book les da el contexto para hacerlo bien, de forma instantánea, sin configuración necesaria.'),
('it', 'landing.mb_team_note', 'Ogni membro del team sa di cosa è responsabile. Il Memory Book fornisce loro il contesto per farlo bene — istantaneamente, senza configurazione richiesta.'),
('fr', 'landing.mb_team_note', 'Chaque membre de l''équipe sait ce dont il est responsable. Le Memory Book leur donne le contexte pour le faire correctement — instantanément, sans configuration requise.'),
('de', 'landing.mb_team_note', 'Jedes Teammitglied weiß, wofür es verantwortlich ist. Das Memory Book gibt ihnen den Kontext, es gut zu machen — sofort, ohne Einrichtung erforderlich.'),
('sv', 'landing.mb_team_note', 'Varje teammedlem vet vad de ansvarar för. Memory Book ger dem kontexten att göra det bra — omedelbart, utan krav på installation.'),
('fi', 'landing.mb_team_note', 'Jokainen tiimin jäsen tietää mistä he ovat vastuussa. Muistokirja antaa heille kontekstin tehdä sen hyvin — välittömästi, ilman asennusta.'),

-- Fix Italian sustainability eyebrow typo
('it', 'landing.sustainability_eyebrow', 'Benessere del Caregiver')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
