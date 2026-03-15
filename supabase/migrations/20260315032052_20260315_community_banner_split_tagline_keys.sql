/*
  # Add split tagline translation keys for CommunityBanner

  ## Summary
  Splits the existing `community_banner.tagline` into two halves so the CTA
  button can be sandwiched between them on desktop layouts.

  ## New Translation Keys
  - `community_banner.tagline_before` — first sentence (audience descriptor)
  - `community_banner.tagline_after`  — second sentence (action descriptors)

  ## Locales Updated
  en, es, it, fr, de, sv, fi (all 7 supported locales)
*/

INSERT INTO public.ui_translations (locale, key, value)
VALUES
  ('en', 'community_banner.tagline_before', 'For family & in-home caregivers.'),
  ('en', 'community_banner.tagline_after',  'Share experiences, ask questions, find practical wisdom.'),

  ('es', 'community_banner.tagline_before', 'Para cuidadores familiares y en el hogar.'),
  ('es', 'community_banner.tagline_after',  'Comparte experiencias, haz preguntas, encuentra sabiduría práctica.'),

  ('it', 'community_banner.tagline_before', 'Per caregiver familiari e domiciliari.'),
  ('it', 'community_banner.tagline_after',  'Condividi esperienze, fai domande, trova saggezza pratica.'),

  ('fr', 'community_banner.tagline_before', 'Pour les aidants familiaux et à domicile.'),
  ('fr', 'community_banner.tagline_after',  'Partagez vos expériences, posez des questions, trouvez des conseils pratiques.'),

  ('de', 'community_banner.tagline_before', 'Für familiäre und häusliche Pflegende.'),
  ('de', 'community_banner.tagline_after',  'Erfahrungen teilen, Fragen stellen, praktisches Wissen finden.'),

  ('sv', 'community_banner.tagline_before', 'För familje- och hemvårdare.'),
  ('sv', 'community_banner.tagline_after',  'Dela erfarenheter, ställ frågor, hitta praktisk visdom.'),

  ('fi', 'community_banner.tagline_before', 'Perhe- ja kotihoitajille.'),
  ('fi', 'community_banner.tagline_after',  'Jaa kokemuksia, kysy kysymyksiä, löydä käytännön viisautta.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
