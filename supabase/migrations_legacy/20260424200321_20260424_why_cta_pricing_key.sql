/*
  # Why Page — Add missing cta_pricing key

  Adds the why.cta_pricing translation key used on the Why page hero CTA.
  All 7 locales: en, es, it, fr, de, sv, fi
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
('en', 'why.cta_pricing', 'View plans & pricing'),
('es', 'why.cta_pricing', 'Ver planes y precios'),
('it', 'why.cta_pricing', 'Vedi piani e prezzi'),
('fr', 'why.cta_pricing', 'Voir les plans et tarifs'),
('de', 'why.cta_pricing', 'Pläne & Preise ansehen'),
('sv', 'why.cta_pricing', 'Se planer och priser'),
('fi', 'why.cta_pricing', 'Katso suunnitelmat ja hinnat')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
