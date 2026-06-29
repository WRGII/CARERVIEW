/*
  # Add admin.return_to_dashboard translation key

  ## Summary
  Adds a new i18n translation key `admin.return_to_dashboard` used for the
  standardised "Return to Admin Dashboard" back-navigation link that appears
  at the top-left of every admin sub-page.

  ## New Keys
  - `admin.return_to_dashboard` — back-navigation link label on all admin sub-pages

  ## Supported Locales
  en, es, it, fr, de, sv, fi (all 7 active locales)
*/

INSERT INTO ui_translations (key, locale, value)
VALUES
  ('admin.return_to_dashboard', 'en', 'Return to Admin Dashboard'),
  ('admin.return_to_dashboard', 'es', 'Volver al panel de administración'),
  ('admin.return_to_dashboard', 'it', 'Torna alla dashboard di amministrazione'),
  ('admin.return_to_dashboard', 'fr', 'Retour au tableau de bord admin'),
  ('admin.return_to_dashboard', 'de', 'Zurück zum Admin-Dashboard'),
  ('admin.return_to_dashboard', 'sv', 'Tillbaka till adminpanelen'),
  ('admin.return_to_dashboard', 'fi', 'Takaisin hallintapaneeliin')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
