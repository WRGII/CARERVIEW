/*
  # Update nav.about translation to "CarerView Origin"

  Changes:
  - Updates the English translation for key `nav.about` from "About" to "CarerView Origin"
  - Only affects the `en` locale; other locales are left unchanged
*/

UPDATE ui_translations
SET value = 'CarerView Origin', updated_at = now()
WHERE key = 'nav.about' AND locale = 'en';
