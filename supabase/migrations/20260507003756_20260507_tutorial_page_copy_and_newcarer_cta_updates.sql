/*
  # Tutorial page copy updates + New Carer CTA label fix

  ## Summary
  - `why.newcarer_cta` updated to "Explore the Free CarerView New Carer Guide" across all 7 locales
  - New key `tutorial.bottom_title` — heading for the bottom CTA section:
    "Begin Your CarerView Support Journey"
  - New key `tutorial.bottom_cta` — button label for the bottom CTA section:
    "Start Your Carer Plan"
  - `tutorial.page_title` updated to "The CarerView Process" (all 7 locales)
*/

INSERT INTO public.ui_translations (key, locale, value)
VALUES
  -- why.newcarer_cta — updated label
  ('why.newcarer_cta', 'en', 'Explore the Free CarerView New Carer Guide'),
  ('why.newcarer_cta', 'es', 'Explora la guía gratuita de CarerView para nuevos cuidadores'),
  ('why.newcarer_cta', 'it', 'Esplora la guida gratuita di CarerView per nuovi caregiver'),
  ('why.newcarer_cta', 'fr', 'Explorer le guide gratuit CarerView pour les nouveaux aidants'),
  ('why.newcarer_cta', 'de', 'Kostenloser CarerView-Leitfaden für neue Pflegepersonen entdecken'),
  ('why.newcarer_cta', 'sv', 'Utforska den kostnadsfria CarerView-guiden för nya vårdgivare'),
  ('why.newcarer_cta', 'fi', 'Tutustu ilmaiseen CarerView-oppaaseen uusille hoitajille'),

  -- tutorial.bottom_title — new key
  ('tutorial.bottom_title', 'en', 'Begin Your CarerView Support Journey'),
  ('tutorial.bottom_title', 'es', 'Comienza tu camino de apoyo con CarerView'),
  ('tutorial.bottom_title', 'it', 'Inizia il tuo percorso di supporto con CarerView'),
  ('tutorial.bottom_title', 'fr', 'Commencez votre parcours d''accompagnement CarerView'),
  ('tutorial.bottom_title', 'de', 'Starten Sie Ihre CarerView-Begleitreise'),
  ('tutorial.bottom_title', 'sv', 'Börja din CarerView-stödresa'),
  ('tutorial.bottom_title', 'fi', 'Aloita CarerView-tukimatkasi'),

  -- tutorial.bottom_cta — new key
  ('tutorial.bottom_cta', 'en', 'Start Your Carer Plan'),
  ('tutorial.bottom_cta', 'es', 'Empieza tu plan de cuidado'),
  ('tutorial.bottom_cta', 'it', 'Inizia il tuo piano di assistenza'),
  ('tutorial.bottom_cta', 'fr', 'Démarrer votre plan de soin'),
  ('tutorial.bottom_cta', 'de', 'Pflegeplan starten'),
  ('tutorial.bottom_cta', 'sv', 'Starta din vårdplan'),
  ('tutorial.bottom_cta', 'fi', 'Aloita hoitosuunnitelmasi'),

  -- tutorial.page_title — "The CarerView Process"
  ('tutorial.page_title', 'en', 'The CarerView Process'),
  ('tutorial.page_title', 'es', 'El proceso de CarerView'),
  ('tutorial.page_title', 'it', 'Il processo CarerView'),
  ('tutorial.page_title', 'fr', 'Le processus CarerView'),
  ('tutorial.page_title', 'de', 'Der CarerView-Prozess'),
  ('tutorial.page_title', 'sv', 'CarerView-processen'),
  ('tutorial.page_title', 'fi', 'CarerView-prosessi')

ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
