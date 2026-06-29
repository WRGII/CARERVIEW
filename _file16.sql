-- Update pricing display strings to reflect June 2026 repricing
-- Primary Caregiver: $12.50 → $25.50 USD/qtr (~$8.50/month)
-- Family Circle:     $25.50 → $45.50 USD/qtr (~$15/month)

INSERT INTO ui_translations (key, locale, value) VALUES
  -- Primary Caregiver price strings
  ('pricing.plan_primary_price', 'en', '$25.50 USD per quarter (~$8.50/month)'),
  ('pricing.plan_primary_price', 'es', '$25.50 USD por trimestre (~$8.50/mes)'),
  ('pricing.plan_primary_price', 'it', '$25,50 USD al trimestre (~$8,50/mese)'),
  ('pricing.plan_primary_price', 'fr', '25,50 $ USD par trimestre (~8,50 $/mois)'),
  ('pricing.plan_primary_price', 'de', '25,50 $ USD pro Quartal (~8,50 $/Monat)'),
  ('pricing.plan_primary_price', 'sv', '25,50 $ USD per kvartal (~8,50 $/månad)'),
  ('pricing.plan_primary_price', 'fi', '25,50 $ USD neljännesvuodessa (~8,50 $/kk)'),
  ('pricing.plan_primary_price', 'ja', '25.50 USD/四半期（月額約8.50ドル）'),
  -- Family Circle price strings
  ('pricing.plan_family_price',  'en', '$45.50 USD per quarter (~$15/month)'),
  ('pricing.plan_family_price',  'es', '$45.50 USD por trimestre (~$15/mes)'),
  ('pricing.plan_family_price',  'it', '$45,50 USD al trimestre (~$15/mese)'),
  ('pricing.plan_family_price',  'fr', '45,50 $ USD par trimestre (~15 $/mois)'),
  ('pricing.plan_family_price',  'de', '45,50 $ USD pro Quartal (~15 $/Monat)'),
  ('pricing.plan_family_price',  'sv', '45,50 $ USD per kvartal (~15 $/månad)'),
  ('pricing.plan_family_price',  'fi', '45,50 $ USD neljännesvuodessa (~15 $/kk)'),
  ('pricing.plan_family_price',  'ja', '45.50 USD/四半期（月額約15ドル）')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
