/*
  # Remove Greek (el) locale

  Removes Greek from the platform entirely:
  - Deletes all ui_translations rows where locale = 'el'
  - Deletes the supported_locales row for 'el'
*/

DELETE FROM ui_translations WHERE locale = 'el';

DELETE FROM supported_locales WHERE code = 'el';
