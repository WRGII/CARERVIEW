/*
  Consolidated Schema - Part 5: Seed Configuration Data
*/

-- ===== SUBSCRIPTION PLANS =====
INSERT INTO public.subscription_plans (
  id, name, interval, price_cents, currency, obs_limit, usage_window,
  stripe_price_id, observations_quota_year, seats_limit
) VALUES
  ('family_qtr', 'Family Circle', 'quarter', 2550, 'USD', NULL, 'year',
   'price_1SCMJVGiqZeZmBYJkoSNcopS', 100, 3),
  ('primary_qtr', 'Primary Caregiver', 'quarter', 1250, 'USD', NULL, 'year',
   'price_1SCMJYGiqZeZmBYJo31EKRFG', 30, NULL),
  ('free', 'Free', 'none', 0, 'USD', 3, 'year', NULL, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  interval = EXCLUDED.interval,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  obs_limit = EXCLUDED.obs_limit,
  usage_window = EXCLUDED.usage_window,
  stripe_price_id = EXCLUDED.stripe_price_id,
  observations_quota_year = EXCLUDED.observations_quota_year,
  seats_limit = EXCLUDED.seats_limit;

-- ===== CV PLAN LIMITS =====
INSERT INTO public.cv_plan_limits (plan_id, seats, team_quota_year) VALUES
  ('family_qtr', 3, 100),
  ('primary_qtr', 1, 100),
  ('free', 1, 3)
ON CONFLICT (plan_id) DO UPDATE SET
  seats = EXCLUDED.seats,
  team_quota_year = EXCLUDED.team_quota_year;

-- ===== SUPPORTED LOCALES =====
INSERT INTO public.supported_locales (code, label, is_active, is_default, sort_order) VALUES
  ('en', 'English',  true, true,  1),
  ('es', 'Espanol',  true, false, 2),
  ('ja', '日本語', true, false, 8)
ON CONFLICT (code) DO UPDATE SET
  label      = EXCLUDED.label,
  is_active  = EXCLUDED.is_active,
  is_default = EXCLUDED.is_default,
  sort_order = EXCLUDED.sort_order;

-- ===== LEGEND =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 1) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (1, 'Fully Independent', '{"es":"Completamente Independiente","sv":"Helt självständig","fi":"Täysin itsenäinen","de":"Vollständig Unabhängig","fr":"Totalement Indépendant","it":"Completamente Indipendente"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 2) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (2, 'Independent with Difficulty', '{"es":"Independiente con Dificultad","sv":"Självständig med svårighet","fi":"Itsenäinen vaikeuksin","de":"Unabhängig mit Schwierigkeiten","fr":"Indépendant avec Difficultés","it":"Indipendente con Difficoltà"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 3) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (3, 'Independent with Support', '{"es":"Independiente con Apoyo","sv":"Självständig med stöd","fi":"Itsenäinen tuella","de":"Unabhängig mit Unterstützung","fr":"Indépendant avec Soutien","it":"Indipendente con Supporto"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 4) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (4, 'Constant Shared Effort', '{"es":"Esfuerzo Compartido Constante","sv":"Konstant delad ansträngning","fi":"Jatkuva jaettu ponnistus","de":"Konstante gemeinsame Anstrengung","fr":"Effort Partagé Constant","it":"Sforzo Condiviso Costante"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 5) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (5, 'Total Assistance', '{"es":"Asistencia Total","sv":"Total assistans","fi":"Täysi apu","de":"Vollständige Unterstützung","fr":"Assistance Totale","it":"Assistenza Totale"}');
  END IF;
END $$;

-- ===== CATEGORIES =====
INSERT INTO public.categories (id, name, type, sort_order, translations)
VALUES
  (gen_random_uuid(), 'Bathing & Personal Hygiene',  'ADL',  1, '{"es":"Baño e Higiene Personal","sv":"Personlig hygien","fi":"Peseytyminen ja hygienia","de":"Baden & persönliche Hygiene","fr":"Bain & Hygiène Personnelle","it":"Bagno & Igiene Personale"}'),
  (gen_random_uuid(), 'Dressing & Grooming',         'ADL',  2, '{"es":"Vestirse y Arreglarse","sv":"Påklädning","fi":"Pukeutuminen","de":"Anziehen & Pflege","fr":"Habillage & Soins","it":"Abbigliamento & Cura Personale"}'),
  (gen_random_uuid(), 'Eating & Drinking',           'ADL',  3, '{"es":"Comer y Beber","sv":"Äta och dricka","fi":"Syöminen ja juominen","de":"Essen & Trinken","fr":"Manger & Boire","it":"Mangiare & Bere"}'),
  (gen_random_uuid(), 'Toileting & Continence',      'ADL',  4, '{"es":"Uso del Baño y Continencia","sv":"Toalettbesök","fi":"WC-käynnit ja pidätyskyky","de":"Toilettennutzung","fr":"Toilette & Continence","it":"Servizi igienici & Continenza"}'),
  (gen_random_uuid(), 'Mobility & Transfers',        'ADL',  5, '{"es":"Movilidad y Traslados","sv":"Rörlighet och förflyttning","fi":"Liikkuminen ja siirtyminen","de":"Mobilität & Transfers","fr":"Mobilité & Transferts","it":"Mobilità & Trasferimenti"}'),
  (gen_random_uuid(), 'Safety Awareness',            'ADL',  6, '{"es":"Conciencia de Seguridad","sv":"Säkerhetsmedvetenhet","fi":"Turvallisuustietoisuus","de":"Sicherheitsbewusstsein","fr":"Conscience de la Sécurité","it":"Consapevolezza della Sicurezza"}'),
  (gen_random_uuid(), 'Medication Management',       'IADL', 7, '{"es":"Manejo de Medicamentos","sv":"Läkemedelshantering","fi":"Lääkehallinta","de":"Medikamentenmanagement","fr":"Gestion des Médicaments","it":"Gestione dei Farmaci"}'),
  (gen_random_uuid(), 'Meals & Groceries',           'IADL', 8, '{"es":"Comidas y Compras","sv":"Mat och inköp","fi":"Ruokailu ja ostokset","de":"Mahlzeiten & Lebensmitteleinkauf","fr":"Repas & Courses","it":"Pasti & Spesa"}'),
  (gen_random_uuid(), 'Housekeeping & Laundry',      'IADL', 9, '{"es":"Limpieza del Hogar y Lavandería","sv":"Städning och tvätt","fi":"Siivous ja pyykki","de":"Haushaltsführung & Wäsche","fr":"Ménage & Lessive","it":"Faccende Domestiche & Bucato"}'),
  (gen_random_uuid(), 'Finances & Paperwork',        'IADL', 10,'{"es":"Finanzas y Papeleo","sv":"Ekonomi och pappersarbete","fi":"Talous ja paperityöt","de":"Finanzen & Papierkram","fr":"Finances & Paperasse","it":"Finanze & Pratiche Burocratiche"}'),
  (gen_random_uuid(), 'Communication & Memory',      'IADL', 11,'{"es":"Comunicación y Memoria","sv":"Kommunikation och minne","fi":"Viestintä ja muisti","de":"Kommunikation & Gedächtnis","fr":"Communication & Mémoire","it":"Comunicazione & Memoria"}'),
  (gen_random_uuid(), 'Transportation & Errands',    'IADL', 12,'{"es":"Transporte y Diligencias","sv":"Transport och ärenden","fi":"Liikenne ja asiointi","de":"Transport & Besorgungen","fr":"Transport & Courses","it":"Trasporto & Commissioni"}')
ON CONFLICT (name) DO UPDATE
  SET sort_order   = EXCLUDED.sort_order,
      type         = EXCLUDED.type,
      translations = EXCLUDED.translations;

-- ===== COMMUNITY ROOMS =====
INSERT INTO public.community_rooms (slug, name, description, icon_name, color, sort_order, is_active)
VALUES
  ('general-support', 'General Support', 'A welcoming space for all caregivers. Share your story, ask anything, and find others who understand what you''re going through.', 'MessageCircle', '#00BCD4', 1, true),
  ('tips-and-tactics', 'Tips & Tactics', 'Share practical techniques, routines, and day-to-day strategies that make caregiving easier for everyone.', 'Lightbulb', '#FFB74D', 2, true),
  ('dementia-support', 'Dementia Support', 'A dedicated space for caregivers supporting someone with dementia or cognitive decline. Share experiences and find guidance.', 'Brain', '#81C784', 3, true),
  ('burnout-and-overwhelm', 'Burnout & Overwhelm', 'Honest conversations about caregiver fatigue, stress, and self-care. You are not alone — this is a safe space to be real.', 'Heart', '#E57373', 4, true),
  ('family-conflict', 'Family Conflict', 'Navigating disagreements, unequal sharing of care responsibilities, and difficult family dynamics. Get support from those who understand.', 'Users', '#7986CB', 5, true),
  ('new-to-caregiving', 'New to Caregiving', 'Just starting out? This room is for questions, orientation, and connecting with experienced caregivers who can help you find your footing.', 'Compass', '#4DB6AC', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name   = EXCLUDED.icon_name,
  color       = EXCLUDED.color,
  sort_order  = EXCLUDED.sort_order,
  is_active   = EXCLUDED.is_active;

-- ===== SITE SETTINGS =====
INSERT INTO public.site_settings (logo_url) VALUES ('')
ON CONFLICT DO NOTHING;
