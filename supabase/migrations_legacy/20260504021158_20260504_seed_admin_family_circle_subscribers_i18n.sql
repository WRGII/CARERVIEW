/*
  # Seed admin.family_circle_subscribers i18n key

  Adds the label used by the new Admin Dashboard stat card
  "Active Family Circle Subscribers" across all 7 supported locales.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('admin.family_circle_subscribers', 'en', 'Family Circle Subscribers'),
  ('admin.family_circle_subscribers', 'es', 'Suscriptores de Círculo Familiar'),
  ('admin.family_circle_subscribers', 'it', 'Iscritti al Circolo Familiare'),
  ('admin.family_circle_subscribers', 'fr', 'Abonnés Cercle Familial'),
  ('admin.family_circle_subscribers', 'de', 'Familienkreis-Abonnenten'),
  ('admin.family_circle_subscribers', 'sv', 'Familjekrens-prenumeranter'),
  ('admin.family_circle_subscribers', 'fi', 'Perhepiirin tilaajat')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
