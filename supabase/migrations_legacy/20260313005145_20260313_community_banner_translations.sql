/*
  # Community Banner i18n Translations

  ## Summary
  Adds translation keys for the new Community Banner component that appears
  above the main header on all non-community pages.

  ## New Translation Keys
  - `community_banner.cta` — Label for the "Community Discussions" CTA button
  - `community_banner.tagline` — Short tagline describing the community value proposition
  - `community_banner.aria_label` — Accessible landmark label for the banner region

  ## Locales Covered
  English (en), Spanish (es), Italian (it), French (fr), German (de), Swedish (sv), Finnish (fi)
*/

INSERT INTO public.ui_translations (locale, key, value)
VALUES
  -- English
  ('en', 'community_banner.cta',       'Community Discussions'),
  ('en', 'community_banner.tagline',   'Free peer-to-peer support for family & in-home caregivers. Share experiences, ask questions, find practical wisdom.'),
  ('en', 'community_banner.aria_label','Community banner'),

  -- Spanish
  ('es', 'community_banner.cta',       'Foro Comunitario'),
  ('es', 'community_banner.tagline',   'Apoyo gratuito entre pares para cuidadores familiares y en el hogar. Comparte experiencias, haz preguntas, encuentra sabiduría práctica.'),
  ('es', 'community_banner.aria_label','Banner comunitario'),

  -- Italian
  ('it', 'community_banner.cta',       'Forum della Comunità'),
  ('it', 'community_banner.tagline',   'Supporto gratuito tra pari per caregiver familiari e domiciliari. Condividi esperienze, fai domande, trova saggezza pratica.'),
  ('it', 'community_banner.aria_label','Banner della comunità'),

  -- French
  ('fr', 'community_banner.cta',       'Discussions Communautaires'),
  ('fr', 'community_banner.tagline',   'Soutien gratuit entre pairs pour les aidants familiaux et à domicile. Partagez vos expériences, posez des questions, trouvez des conseils pratiques.'),
  ('fr', 'community_banner.aria_label','Bannière communautaire'),

  -- German
  ('de', 'community_banner.cta',       'Community-Diskussionen'),
  ('de', 'community_banner.tagline',   'Kostenlose Peer-Unterstützung für familiäre und häusliche Pflegende. Erfahrungen teilen, Fragen stellen, praktisches Wissen finden.'),
  ('de', 'community_banner.aria_label','Community-Banner'),

  -- Swedish
  ('sv', 'community_banner.cta',       'Community-diskussioner'),
  ('sv', 'community_banner.tagline',   'Gratis stöd från jämlikar för familje- och hemvårdare. Dela erfarenheter, ställ frågor, hitta praktisk visdom.'),
  ('sv', 'community_banner.aria_label','Community-banner'),

  -- Finnish
  ('fi', 'community_banner.cta',       'Yhteisökeskustelut'),
  ('fi', 'community_banner.tagline',   'Ilmainen vertaistuki perhe- ja kotihoitajille. Jaa kokemuksia, kysy kysymyksiä, löydä käytännön viisautta.'),
  ('fi', 'community_banner.aria_label','Yhteisöbanneri')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
