
-- Add missing community_banner split-tagline keys and landing hero pillar tagline
-- for all 8 active locales. Uses dot-key style (key contains full dot notation, namespace='common').

INSERT INTO public.ui_translations (locale, namespace, key, value)
VALUES
  -- community_banner.tagline_before
  ('en', 'common', 'community_banner.tagline_before', 'For family & in-home caregivers.'),
  ('es', 'common', 'community_banner.tagline_before', 'Para cuidadores familiares y en el hogar.'),
  ('it', 'common', 'community_banner.tagline_before', 'Per caregiver familiari e domiciliari.'),
  ('fr', 'common', 'community_banner.tagline_before', 'Pour les aidants familiaux et à domicile.'),
  ('de', 'common', 'community_banner.tagline_before', 'Für familiäre und häusliche Pflegende.'),
  ('sv', 'common', 'community_banner.tagline_before', 'För familje- och hemvårdare.'),
  ('fi', 'common', 'community_banner.tagline_before', 'Perhe- ja kotihoitajille.'),
  ('ja', 'common', 'community_banner.tagline_before', '家族および在宅介護者のために。'),

  -- community_banner.tagline_after
  ('en', 'common', 'community_banner.tagline_after', 'Share experiences, ask questions, find practical wisdom.'),
  ('es', 'common', 'community_banner.tagline_after', 'Comparte experiencias, haz preguntas, encuentra sabiduría práctica.'),
  ('it', 'common', 'community_banner.tagline_after', 'Condividi esperienze, fai domande, trova saggezza pratica.'),
  ('fr', 'common', 'community_banner.tagline_after', 'Partagez vos expériences, posez des questions, trouvez des conseils pratiques.'),
  ('de', 'common', 'community_banner.tagline_after', 'Erfahrungen teilen, Fragen stellen, praktisches Wissen finden.'),
  ('sv', 'common', 'community_banner.tagline_after', 'Dela erfarenheter, ställ frågor, hitta praktisk visdom.'),
  ('fi', 'common', 'community_banner.tagline_after', 'Jaa kokemuksia, kysy kysymyksiä, löydä käytännön viisautta.'),
  ('ja', 'common', 'community_banner.tagline_after', '経験を共有し、質問し、実践的な知恵を見つけましょう。'),

  -- landing.hero_pillar_tagline
  ('en', 'common', 'landing.hero_pillar_tagline', 'Plan · Coordinate · Observe · Improve'),
  ('es', 'common', 'landing.hero_pillar_tagline', 'Planificar · Coordinar · Observar · Mejorar'),
  ('it', 'common', 'landing.hero_pillar_tagline', 'Pianifica · Coordina · Osserva · Migliora'),
  ('fr', 'common', 'landing.hero_pillar_tagline', 'Planifier · Coordonner · Observer · Améliorer'),
  ('de', 'common', 'landing.hero_pillar_tagline', 'Planen · Koordinieren · Beobachten · Verbessern'),
  ('sv', 'common', 'landing.hero_pillar_tagline', 'Planera · Koordinera · Observera · Förbättra'),
  ('fi', 'common', 'landing.hero_pillar_tagline', 'Suunnittele · Koordinoi · Havainnoi · Paranna'),
  ('ja', 'common', 'landing.hero_pillar_tagline', '計画 · 調整 · 観察 · 改善')

ON CONFLICT (locale, namespace, key) DO NOTHING;
