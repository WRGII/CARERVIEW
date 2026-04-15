/*
  # Seed obs_form.notes_placeholder for all locales

  The code references obs_form.notes_placeholder but the database only has
  obs_form.notes_ph. This migration adds the missing _placeholder variant
  by copying the existing notes_ph values for each locale.
*/

INSERT INTO ui_translations (locale, key, value)
SELECT locale, 'obs_form.notes_placeholder', value
FROM ui_translations
WHERE key = 'obs_form.notes_ph'
ON CONFLICT (locale, key) DO NOTHING;
