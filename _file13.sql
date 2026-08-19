-- Add missing navigation translation keys for Care Hub, Memory Book, Care Plan, Observations, Resident
INSERT INTO public.ui_translations (locale, key, value) VALUES
  -- English
  ('en', 'nav.care_hub', 'Care Hub'),
  ('en', 'nav.care_plan', 'Care Plan'),
  ('en', 'nav.observations', 'Observations'),
  ('en', 'nav.resident', 'Resident'),
  -- Spanish
  ('es', 'nav.care_hub', 'Centro de Cuidado'),
  ('es', 'nav.care_plan', 'Plan de Cuidado'),
  ('es', 'nav.observations', 'Observaciones'),
  ('es', 'nav.resident', 'Residente'),
  -- Italian
  ('it', 'nav.care_hub', 'Centro di Cura'),
  ('it', 'nav.care_plan', 'Piano di Cura'),
  ('it', 'nav.observations', 'Osservazioni'),
  ('it', 'nav.resident', 'Residente'),
  -- French
  ('fr', 'nav.care_hub', 'Centre de Soins'),
  ('fr', 'nav.care_plan', 'Plan de Soins'),
  ('fr', 'nav.observations', 'Observations'),
  ('fr', 'nav.resident', 'Résident'),
  -- German
  ('de', 'nav.care_hub', 'Pflegezentrum'),
  ('de', 'nav.care_plan', 'Pflegeplan'),
  ('de', 'nav.observations', 'Beobachtungen'),
  ('de', 'nav.resident', 'Bewohner'),
  -- Swedish
  ('sv', 'nav.care_hub', 'Vårdcenter'),
  ('sv', 'nav.care_plan', 'Vårdplan'),
  ('sv', 'nav.observations', 'Observationer'),
  ('sv', 'nav.resident', 'Boende'),
  -- Finnish
  ('fi', 'nav.care_hub', 'Hoitokeskus'),
  ('fi', 'nav.care_plan', 'Hoitosuunnitelma'),
  ('fi', 'nav.observations', 'Havainnot'),
  ('fi', 'nav.resident', 'Asukas')
ON CONFLICT (locale, namespace, key) DO NOTHING;