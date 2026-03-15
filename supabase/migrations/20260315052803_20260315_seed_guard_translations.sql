/*
  # Seed translations for CaregiverGuard loading state

  ## New keys added
  - guard.preparing_workspace — heading shown while auth loads
  - guard.loading_slow        — sentence shown if loading takes too long
  - guard.sign_in_again       — link text to sign in again
*/

INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('guard.preparing_workspace', 'en', 'Preparing your workspace…'),
  ('guard.loading_slow',        'en', 'If this takes more than a few seconds,'),
  ('guard.sign_in_again',       'en', 'sign in again'),

  ('guard.preparing_workspace', 'es', 'Preparando tu espacio de trabajo…'),
  ('guard.loading_slow',        'es', 'Si esto tarda más de unos segundos,'),
  ('guard.sign_in_again',       'es', 'inicia sesión de nuevo'),

  ('guard.preparing_workspace', 'fr', 'Préparation de votre espace de travail…'),
  ('guard.loading_slow',        'fr', 'Si cela prend plus de quelques secondes,'),
  ('guard.sign_in_again',       'fr', 'reconnectez-vous'),

  ('guard.preparing_workspace', 'de', 'Arbeitsbereich wird vorbereitet…'),
  ('guard.loading_slow',        'de', 'Falls dies länger als ein paar Sekunden dauert,'),
  ('guard.sign_in_again',       'de', 'erneut anmelden'),

  ('guard.preparing_workspace', 'it', 'Preparazione dell''area di lavoro…'),
  ('guard.loading_slow',        'it', 'Se ci vuole più di qualche secondo,'),
  ('guard.sign_in_again',       'it', 'accedi di nuovo'),

  ('guard.preparing_workspace', 'sv', 'Förbereder din arbetsyta…'),
  ('guard.loading_slow',        'sv', 'Om det tar mer än några sekunder,'),
  ('guard.sign_in_again',       'sv', 'logga in igen'),

  ('guard.preparing_workspace', 'fi', 'Valmistellaan työtilaa…'),
  ('guard.loading_slow',        'fi', 'Jos tämä kestää yli muutaman sekunnin,'),
  ('guard.sign_in_again',       'fi', 'kirjaudu uudelleen sisään')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
