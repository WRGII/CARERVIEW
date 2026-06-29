/*
  # Add USD denomination to pricing plan price strings

  ## Summary
  International customers need to know prices are in USD.
  This migration updates the plan price i18n strings to include "USD" denomination
  for all supported locales: en, es, it, fr, de, sv, fi.

  ## Changes
  - Updates pricing.plan_primary_price for all 7 locales
  - Updates pricing.plan_family_price for all 7 locales
  - Uses INSERT ... ON CONFLICT DO UPDATE to safely upsert
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('pricing.plan_primary_price', 'en', '$12.50 USD per quarter (< $1/week)'),
  ('pricing.plan_primary_price', 'es', '$12.50 USD por trimestre (< $1/semana)'),
  ('pricing.plan_primary_price', 'it', '$12,50 USD al trimestre (< $1/settimana)'),
  ('pricing.plan_primary_price', 'fr', '12,50 $ USD par trimestre (< 1 $/semaine)'),
  ('pricing.plan_primary_price', 'de', '12,50 $ USD pro Quartal (< 1 $/Woche)'),
  ('pricing.plan_primary_price', 'sv', '12,50 $ USD per kvartal (< 1 $/vecka)'),
  ('pricing.plan_primary_price', 'fi', '12,50 $ USD neljännesvuodessa (< 1 $/viikko)'),
  ('pricing.plan_family_price',  'en', '$25.50 USD per quarter (< $9/month)'),
  ('pricing.plan_family_price',  'es', '$25.50 USD por trimestre (< $9/mes)'),
  ('pricing.plan_family_price',  'it', '$25,50 USD al trimestre (< $9/mese)'),
  ('pricing.plan_family_price',  'fr', '25,50 $ USD par trimestre (< 9 $/mois)'),
  ('pricing.plan_family_price',  'de', '25,50 $ USD pro Quartal (< 9 $/Monat)'),
  ('pricing.plan_family_price',  'sv', '25,50 $ USD per kvartal (< 9 $/månad)'),
  ('pricing.plan_family_price',  'fi', '25,50 $ USD neljännesvuodessa (< 9 $/kk)')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();