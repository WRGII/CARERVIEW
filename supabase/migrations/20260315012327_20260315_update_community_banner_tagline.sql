/*
  # Update Community Banner Tagline

  ## Summary
  Removes the "Free peer-to-peer support" opening phrase from the community_banner.tagline
  translation key across all supported locales, replacing it with a shorter version
  that begins with "For family & in-home caregivers..." (and locale equivalents).

  ## Modified Translation Keys
  - `community_banner.tagline` updated for: en, es, it, fr, de, sv, fi

  ## Notes
  - No tables or columns are created or dropped
  - Uses ON CONFLICT DO UPDATE to safely overwrite existing values
*/

INSERT INTO public.ui_translations (locale, key, value)
VALUES
  ('en', 'community_banner.tagline', 'For family & in-home caregivers. Share experiences, ask questions, find practical wisdom.'),
  ('es', 'community_banner.tagline', 'Para cuidadores familiares y en el hogar. Comparte experiencias, haz preguntas, encuentra sabiduría práctica.'),
  ('it', 'community_banner.tagline', 'Per caregiver familiari e domiciliari. Condividi esperienze, fai domande, trova saggezza pratica.'),
  ('fr', 'community_banner.tagline', 'Pour les aidants familiaux et à domicile. Partagez vos expériences, posez des questions, trouvez des conseils pratiques.'),
  ('de', 'community_banner.tagline', 'Für familiäre und häusliche Pflegende. Erfahrungen teilen, Fragen stellen, praktisches Wissen finden.'),
  ('sv', 'community_banner.tagline', 'För familje- och hemvårdare. Dela erfarenheter, ställ frågor, hitta praktisk visdom.'),
  ('fi', 'community_banner.tagline', 'Perhe- ja kotihoitajille. Jaa kokemuksia, kysy kysymyksiä, löydä käytännön viisautta.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
