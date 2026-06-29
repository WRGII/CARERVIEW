/*
  # Seed create_account.password_too_short Translation Key

  ## Summary
  The registration form now validates password length client-side and shows
  a `create_account.password_too_short` error message. This migration adds
  the translation string for all 7 active locales.
*/

INSERT INTO public.ui_translations (key, locale, value)
VALUES
  ('create_account.password_too_short', 'en', 'Password must be at least 8 characters.'),
  ('create_account.password_too_short', 'es', 'La contraseña debe tener al menos 8 caracteres.'),
  ('create_account.password_too_short', 'it', 'La password deve contenere almeno 8 caratteri.'),
  ('create_account.password_too_short', 'fr', 'Le mot de passe doit comporter au moins 8 caractères.'),
  ('create_account.password_too_short', 'de', 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
  ('create_account.password_too_short', 'sv', 'Lösenordet måste vara minst 8 tecken.'),
  ('create_account.password_too_short', 'fi', 'Salasanan on oltava vähintään 8 merkkiä.')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
