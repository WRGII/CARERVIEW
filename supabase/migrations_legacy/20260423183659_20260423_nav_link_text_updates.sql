/*
  # Update nav link display text — all locales

  Updates three Header/Footer navigation labels to shorter, cleaner text.

  ## Changes

  ### nav.why_carerview
  Old: "Why your family needs CarerView" (and equivalents)
  New: "Why CarerView" (and equivalents)

  ### nav.memory_book
  Old: "Why your family needs a Memory Book" (and equivalents)
  New: "Why a Memory Book" (and equivalents)

  ### nav.caregiver_resources
  Old: "Caregiver Resources" (en only — missing other locales)
  New: "Carer Resources" (en) + added for es, it, fr, de, sv, fi
*/

-- nav.why_carerview
UPDATE ui_translations SET value = 'Why CarerView'           WHERE key = 'nav.why_carerview' AND locale = 'en';
UPDATE ui_translations SET value = 'Por qué CarerView'       WHERE key = 'nav.why_carerview' AND locale = 'es';
UPDATE ui_translations SET value = 'Perché CarerView'        WHERE key = 'nav.why_carerview' AND locale = 'it';
UPDATE ui_translations SET value = 'Pourquoi CarerView'      WHERE key = 'nav.why_carerview' AND locale = 'fr';
UPDATE ui_translations SET value = 'Warum CarerView'         WHERE key = 'nav.why_carerview' AND locale = 'de';
UPDATE ui_translations SET value = 'Varför CarerView'        WHERE key = 'nav.why_carerview' AND locale = 'sv';
UPDATE ui_translations SET value = 'Miksi CarerView'         WHERE key = 'nav.why_carerview' AND locale = 'fi';

-- nav.memory_book
UPDATE ui_translations SET value = 'Why a Memory Book'              WHERE key = 'nav.memory_book' AND locale = 'en';
UPDATE ui_translations SET value = 'Por qué un Libro de Memoria'    WHERE key = 'nav.memory_book' AND locale = 'es';
UPDATE ui_translations SET value = 'Perché un Libro dei Ricordi'    WHERE key = 'nav.memory_book' AND locale = 'it';
UPDATE ui_translations SET value = 'Pourquoi un Livre de Mémoire'   WHERE key = 'nav.memory_book' AND locale = 'fr';
UPDATE ui_translations SET value = 'Warum ein Erinnerungsbuch'      WHERE key = 'nav.memory_book' AND locale = 'de';
UPDATE ui_translations SET value = 'Varför en Minnesbok'            WHERE key = 'nav.memory_book' AND locale = 'sv';
UPDATE ui_translations SET value = 'Miksi Muistikirja'              WHERE key = 'nav.memory_book' AND locale = 'fi';

-- nav.caregiver_resources (update en, insert missing locales)
UPDATE ui_translations SET value = 'Carer Resources' WHERE key = 'nav.caregiver_resources' AND locale = 'en';

INSERT INTO ui_translations (locale, key, value) VALUES
  ('es', 'nav.caregiver_resources', 'Recursos para Cuidadores'),
  ('it', 'nav.caregiver_resources', 'Risorse per i Caregiver'),
  ('fr', 'nav.caregiver_resources', 'Ressources pour Aidants'),
  ('de', 'nav.caregiver_resources', 'Pflege-Ressourcen'),
  ('sv', 'nav.caregiver_resources', 'Resurser för Anhörigvårdare'),
  ('fi', 'nav.caregiver_resources', 'Omaishoitajan Resurssit')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
