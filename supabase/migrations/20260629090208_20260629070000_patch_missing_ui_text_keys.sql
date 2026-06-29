-- Phase 8.5: Targeted UI text gap patch
-- Inserts 4 missing key sets: landing.careplan_title, landing.sustainability_title,
-- landing.newcarer_title (all 8 locales), and community_banner.cta for ja only.
-- Source: recovered from legacy migrations. JA fallback = EN copy (no native found).

-- landing.careplan_title
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('en', 'landing', 'careplan_title', 'Six sections that cover every dimension of care'),
  ('es', 'landing', 'careplan_title', 'Seis secciones que cubren cada dimensión del cuidado'),
  ('it', 'landing', 'careplan_title', 'Sei sezioni che coprono ogni dimensione dell''assistenza'),
  ('fr', 'landing', 'careplan_title', 'Six sections qui couvrent chaque dimension des soins'),
  ('de', 'landing', 'careplan_title', 'Sechs Abschnitte, die jede Dimension der Pflege abdecken'),
  ('sv', 'landing', 'careplan_title', 'Sex avsnitt som täcker varje dimension av vård'),
  ('fi', 'landing', 'careplan_title', 'Kuusi osiota, jotka kattavat jokaisen hoidon ulottuvuuden'),
  -- ja: no native translation found in repo; using EN fallback per Phase 8.5 rules
  ('ja', 'landing', 'careplan_title', 'Six sections that cover every dimension of care')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- landing.sustainability_title
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('en', 'landing', 'sustainability_title', 'A plan that doesn''t account for the carer''s limits is not a complete plan'),
  ('es', 'landing', 'sustainability_title', 'Un plan que no tiene en cuenta los límites del cuidador no es un plan completo'),
  ('it', 'landing', 'sustainability_title', 'Un piano che non tiene conto dei limiti del caregiver non è un piano completo'),
  ('fr', 'landing', 'sustainability_title', 'Un plan qui ne tient pas compte des limites de l''aidant n''est pas un plan complet'),
  ('de', 'landing', 'sustainability_title', 'Ein Plan, der die Grenzen der Pflegeperson nicht berücksichtigt, ist kein vollständiger Plan'),
  ('sv', 'landing', 'sustainability_title', 'En plan som inte tar hänsyn till vårdarens gränser är inte en komplett plan'),
  ('fi', 'landing', 'sustainability_title', 'Suunnitelma, joka ei ota huomioon hoitajan rajoja, ei ole täydellinen suunnitelma'),
  -- ja: no native translation found in repo; using EN fallback per Phase 8.5 rules
  ('ja', 'landing', 'sustainability_title', 'A plan that doesn''t account for the carer''s limits is not a complete plan')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- landing.newcarer_title
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('en', 'landing', 'newcarer_title', 'Start with our free Caregiver Guide'),
  ('es', 'landing', 'newcarer_title', 'Comienza con nuestra guía gratuita para cuidadores'),
  ('it', 'landing', 'newcarer_title', 'Inizia con la nostra guida gratuita per caregiver'),
  ('fr', 'landing', 'newcarer_title', 'Commencez avec notre guide gratuit pour les aidants'),
  ('de', 'landing', 'newcarer_title', 'Beginnen Sie mit unserem kostenlosen Leitfaden für Pflegepersonen'),
  ('sv', 'landing', 'newcarer_title', 'Börja med vår kostnadsfria guide för vårdare'),
  ('fi', 'landing', 'newcarer_title', 'Aloita ilmaisella hoitajan oppaallamme'),
  -- ja: no native translation found in repo; using EN fallback per Phase 8.5 rules
  ('ja', 'landing', 'newcarer_title', 'Start with our free Caregiver Guide')
ON CONFLICT (locale, namespace, key) DO NOTHING;

-- community_banner.cta for ja only (other locales already present)
-- ja: no native translation found in repo; using EN fallback per Phase 8.5 rules
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('ja', 'community_banner', 'cta', 'Free Carer Chat Room')
ON CONFLICT (locale, namespace, key) DO NOTHING;
