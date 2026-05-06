/*
  # Update nav.new_carer translation key to "New Carer Guide"

  Renames the navigation label from "Caregiver Guide" to "New Carer Guide"
  across all 7 supported locales. The key t('nav.new_carer') is used in the
  desktop header, mobile drawer, and public nav — this single DB change
  propagates everywhere automatically.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('nav.new_carer', 'en', 'New Carer Guide'),
  ('nav.new_carer', 'es', 'Guía para Nuevos Cuidadores'),
  ('nav.new_carer', 'it', 'Guida per Nuovi Caregiver'),
  ('nav.new_carer', 'fr', 'Guide du Nouvel Aidant'),
  ('nav.new_carer', 'de', 'Leitfaden für neue Pflegepersonen'),
  ('nav.new_carer', 'sv', 'Guide för nya vårdgivare'),
  ('nav.new_carer', 'fi', 'Opas uusille hoitajille')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
