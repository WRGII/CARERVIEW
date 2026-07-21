-- Seed common.try_again across all 8 locales (used by ObservationForm error retry button)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'try_again', 'Try Again'),
  ('es', 'common', 'try_again', 'Intentar de nuevo'),
  ('fr', 'common', 'try_again', 'Réessayer'),
  ('de', 'common', 'try_again', 'Erneut versuchen'),
  ('it', 'common', 'try_again', 'Riprova'),
  ('sv', 'common', 'try_again', 'Försök igen'),
  ('fi', 'common', 'try_again', 'Yritä uudelleen'),
  ('ja', 'common', 'try_again', '再試行')
ON CONFLICT (locale, namespace, key) DO UPDATE
SET value = EXCLUDED.value;
