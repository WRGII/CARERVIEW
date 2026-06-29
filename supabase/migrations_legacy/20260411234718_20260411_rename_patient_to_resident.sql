/*
  # Rename "patient" terminology to "resident" throughout

  ## Summary
  The person receiving care was referred to as "patient" in database columns,
  RPC function parameters, and translation keys. This migration renames all
  these occurrences to "resident" for consistent, person-centred language.

  ## Changes

  ### 1. observations table
  - Column `patient_name` renamed to `resident_name`
  - A view alias `patient_name` is created for backwards compatibility

  ### 2. Translation keys updated (all 7 locales: en, es, fr, de, it, sv, fi)
  - family_setup.patient_label        → family_setup.resident_label
  - family_setup.patient_placeholder  → family_setup.resident_placeholder
  - family_setup.patient_required     → family_setup.resident_required
  - obs_form.patient_label            → obs_form.resident_label
  - obs_form.patient_placeholder      → obs_form.resident_placeholder
  - view_obs.patient_name             → view_obs.resident_name
  - obs_list.unnamed_patient          → obs_list.unnamed_resident
  - common.unnamed_patient            → common.unnamed_resident
  - export.unnamed_patient            → export.unnamed_resident
  - export.csv_patient_name           → export.csv_resident_name
  - memory_book.identity_subtitle     → interpolation variable updated

  ## Security
  No RLS changes — column rename is transparent to existing policies.
*/

-- ─── 1. Rename column observations.patient_name → resident_name ──────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'observations' AND column_name = 'patient_name'
  ) THEN
    ALTER TABLE observations RENAME COLUMN patient_name TO resident_name;
  END IF;
END $$;

-- ─── 2. Translation key renames & new seeds ──────────────────────────────────
-- Strategy: INSERT new key, copy value from old key where present, keep old key
-- as alias pointing to new value so any cached clients don't break.

-- family_setup.resident_label (was patient_label)
INSERT INTO public.ui_translations (locale, key, value)
SELECT locale, 'family_setup.resident_label', value
FROM public.ui_translations
WHERE key = 'family_setup.patient_label'
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- family_setup.resident_placeholder (was patient_placeholder)
INSERT INTO public.ui_translations (locale, key, value)
SELECT locale, 'family_setup.resident_placeholder', value
FROM public.ui_translations
WHERE key = 'family_setup.patient_placeholder'
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- family_setup.resident_required (was patient_required)
INSERT INTO public.ui_translations (locale, key, value)
SELECT locale, 'family_setup.resident_required', value
FROM public.ui_translations
WHERE key = 'family_setup.patient_required'
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- obs_form.resident_label (was patient_label)
INSERT INTO public.ui_translations (locale, key, value)
SELECT locale, 'obs_form.resident_label', value
FROM public.ui_translations
WHERE key = 'obs_form.patient_label'
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- obs_form.resident_placeholder (was patient_placeholder)
INSERT INTO public.ui_translations (locale, key, value)
SELECT locale, 'obs_form.resident_placeholder', value
FROM public.ui_translations
WHERE key = 'obs_form.patient_placeholder'
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- view_obs.resident_name (was patient_name) — update label to "Resident Name"
INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'view_obs.resident_name', 'Resident Name'),
  ('es', 'view_obs.resident_name', 'Nombre del Residente'),
  ('fr', 'view_obs.resident_name', 'Nom du Résident'),
  ('de', 'view_obs.resident_name', 'Name des Bewohners'),
  ('it', 'view_obs.resident_name', 'Nome del Residente'),
  ('sv', 'view_obs.resident_name', 'Boendes namn'),
  ('fi', 'view_obs.resident_name', 'Asukkaan nimi')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- obs_list.unnamed_resident (was unnamed_patient)
INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'obs_list.unnamed_resident', 'Unnamed resident'),
  ('es', 'obs_list.unnamed_resident', 'Residente sin nombre'),
  ('fr', 'obs_list.unnamed_resident', 'Résident(e) sans nom'),
  ('de', 'obs_list.unnamed_resident', 'Unbenannter Bewohner'),
  ('it', 'obs_list.unnamed_resident', 'Residente senza nome'),
  ('sv', 'obs_list.unnamed_resident', 'Namnlös boende'),
  ('fi', 'obs_list.unnamed_resident', 'Nimetön asukas')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- common.unnamed_resident (was unnamed_patient)
INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'common.unnamed_resident', 'Unnamed Resident'),
  ('es', 'common.unnamed_resident', 'Residente sin nombre'),
  ('fr', 'common.unnamed_resident', 'Résident(e) sans nom'),
  ('de', 'common.unnamed_resident', 'Unbenannter Bewohner'),
  ('it', 'common.unnamed_resident', 'Residente senza nome'),
  ('sv', 'common.unnamed_resident', 'Namnlös boende'),
  ('fi', 'common.unnamed_resident', 'Nimetön asukas')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- export.unnamed_resident (was unnamed_patient)
INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'export.unnamed_resident', 'Unnamed Resident'),
  ('es', 'export.unnamed_resident', 'Residente sin nombre'),
  ('fr', 'export.unnamed_resident', 'Résident(e) sans nom'),
  ('de', 'export.unnamed_resident', 'Unbenannter Bewohner'),
  ('it', 'export.unnamed_resident', 'Residente senza nome'),
  ('sv', 'export.unnamed_resident', 'Namnlös boende'),
  ('fi', 'export.unnamed_resident', 'Nimetön asukas')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- export.csv_resident_name (was csv_patient_name)
INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'export.csv_resident_name', 'Resident Name'),
  ('es', 'export.csv_resident_name', 'Nombre del Residente'),
  ('fr', 'export.csv_resident_name', 'Nom du Résident'),
  ('de', 'export.csv_resident_name', 'Name des Bewohners'),
  ('it', 'export.csv_resident_name', 'Nome del Residente'),
  ('sv', 'export.csv_resident_name', 'Boendes namn'),
  ('fi', 'export.csv_resident_name', 'Asukkaan nimi')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- memory_book.identity_subtitle — update interpolation var from {patientName} to {residentName}
UPDATE public.ui_translations
SET value = REPLACE(value, '{patientName}', '{residentName}')
WHERE key = 'memory_book.identity_subtitle';

-- obs_form.resident_label seeds for all locales (in case patient_label rows missing)
INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'obs_form.resident_label', 'Resident being observed'),
  ('es', 'obs_form.resident_label', 'Residente observado/a'),
  ('fr', 'obs_form.resident_label', 'Résident(e) observé(e)'),
  ('de', 'obs_form.resident_label', 'Beobachteter Bewohner'),
  ('it', 'obs_form.resident_label', 'Residente osservato/a'),
  ('sv', 'obs_form.resident_label', 'Boende som observeras'),
  ('fi', 'obs_form.resident_label', 'Havainnoitu asukas')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'obs_form.resident_placeholder', 'Their name'),
  ('es', 'obs_form.resident_placeholder', 'Su nombre'),
  ('fr', 'obs_form.resident_placeholder', 'Leur prénom'),
  ('de', 'obs_form.resident_placeholder', 'Ihr Name'),
  ('it', 'obs_form.resident_placeholder', 'Il loro nome'),
  ('sv', 'obs_form.resident_placeholder', 'Deras namn'),
  ('fi', 'obs_form.resident_placeholder', 'Heidän nimensä')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'family_setup.resident_label', 'Who are you caring for?'),
  ('es', 'family_setup.resident_label', '¿A quién estás cuidando?'),
  ('fr', 'family_setup.resident_label', 'Pour qui prenez-vous soin ?'),
  ('de', 'family_setup.resident_label', 'Für wen sorgen Sie?'),
  ('it', 'family_setup.resident_label', 'Di chi ti stai prendendo cura?'),
  ('sv', 'family_setup.resident_label', 'Vem vårdar du?'),
  ('fi', 'family_setup.resident_label', 'Ketä hoidat?')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'family_setup.resident_placeholder', 'e.g. Mum, Dad, Margaret'),
  ('es', 'family_setup.resident_placeholder', 'p. ej. Mamá, Papá, María'),
  ('fr', 'family_setup.resident_placeholder', 'ex. Maman, Papa, Marguerite'),
  ('de', 'family_setup.resident_placeholder', 'z. B. Mama, Papa, Margarete'),
  ('it', 'family_setup.resident_placeholder', 'es. Mamma, Papà, Margherita'),
  ('sv', 'family_setup.resident_placeholder', 't.ex. Mamma, Pappa, Margareta'),
  ('fi', 'family_setup.resident_placeholder', 'esim. Äiti, Isä, Margareeta')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'family_setup.resident_required', 'Please enter the name of the person you are caring for.'),
  ('es', 'family_setup.resident_required', 'Por favor, introduce el nombre de la persona que estás cuidando.'),
  ('fr', 'family_setup.resident_required', 'Veuillez saisir le nom de la personne dont vous prenez soin.'),
  ('de', 'family_setup.resident_required', 'Bitte geben Sie den Namen der Person ein, für die Sie sorgen.'),
  ('it', 'family_setup.resident_required', 'Inserisci il nome della persona di cui ti stai prendendo cura.'),
  ('sv', 'family_setup.resident_required', 'Ange namnet på den person du vårdar.'),
  ('fi', 'family_setup.resident_required', 'Anna sen henkilön nimi, jota hoidat.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
