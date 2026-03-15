/*
  # Add PricingCard i18n Translation Keys

  ## Summary
  PricingCard had several hardcoded English strings that were not going through
  the i18n system. This migration adds the missing translation keys for all
  7 supported locales.

  ## New Keys
  - pricing.per_quarter      — "/quarter" label on paid plans
  - pricing.most_popular     — "Most Popular" badge
  - pricing.choose_plan_btn  — "Choose Plan" button label
  - pricing.current_plan_btn — "Current Plan" button label (disabled state)
  - pricing.processing       — "Processing..." loading state on button
*/

INSERT INTO public.ui_translations (locale, key, value)
VALUES
  ('en', 'pricing.per_quarter',      '/quarter'),
  ('de', 'pricing.per_quarter',      '/Quartal'),
  ('es', 'pricing.per_quarter',      '/trimestre'),
  ('fi', 'pricing.per_quarter',      '/kvartaali'),
  ('fr', 'pricing.per_quarter',      '/trimestre'),
  ('it', 'pricing.per_quarter',      '/trimestre'),
  ('sv', 'pricing.per_quarter',      '/kvartal'),

  ('en', 'pricing.most_popular',     'Most Popular'),
  ('de', 'pricing.most_popular',     'Am beliebtesten'),
  ('es', 'pricing.most_popular',     'Más popular'),
  ('fi', 'pricing.most_popular',     'Suosituin'),
  ('fr', 'pricing.most_popular',     'Le plus populaire'),
  ('it', 'pricing.most_popular',     'Più popolare'),
  ('sv', 'pricing.most_popular',     'Mest populär'),

  ('en', 'pricing.choose_plan_btn',  'Choose Plan'),
  ('de', 'pricing.choose_plan_btn',  'Plan wählen'),
  ('es', 'pricing.choose_plan_btn',  'Elegir plan'),
  ('fi', 'pricing.choose_plan_btn',  'Valitse suunnitelma'),
  ('fr', 'pricing.choose_plan_btn',  'Choisir ce plan'),
  ('it', 'pricing.choose_plan_btn',  'Scegli piano'),
  ('sv', 'pricing.choose_plan_btn',  'Välj plan'),

  ('en', 'pricing.current_plan_btn', 'Current Plan'),
  ('de', 'pricing.current_plan_btn', 'Aktueller Plan'),
  ('es', 'pricing.current_plan_btn', 'Plan actual'),
  ('fi', 'pricing.current_plan_btn', 'Nykyinen suunnitelma'),
  ('fr', 'pricing.current_plan_btn', 'Plan actuel'),
  ('it', 'pricing.current_plan_btn', 'Piano attuale'),
  ('sv', 'pricing.current_plan_btn', 'Nuvarande plan'),

  ('en', 'pricing.processing',       'Processing…'),
  ('de', 'pricing.processing',       'Verarbeitung…'),
  ('es', 'pricing.processing',       'Procesando…'),
  ('fi', 'pricing.processing',       'Käsitellään…'),
  ('fr', 'pricing.processing',       'Traitement…'),
  ('it', 'pricing.processing',       'Elaborazione…'),
  ('sv', 'pricing.processing',       'Bearbetar…')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
