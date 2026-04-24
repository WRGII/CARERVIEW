/*
  # Seed NewCarerCTA paid subscriber translation keys

  ## Summary
  Adds i18n translation keys for the Care Plan CTA text shown to paid subscribers
  on New Carer pages. Previously these strings were hardcoded in English only.

  ## New Keys
  - `new_carer.cta_paid_mid_headline` — mid variant heading
  - `new_carer.cta_paid_mid_body` — mid variant body
  - `new_carer.cta_paid_end_headline` — end variant heading
  - `new_carer.cta_paid_end_body` — end variant body
  - `new_carer.cta_open_care_plan` — inline link label
  - `new_carer.cta_open_builder` — primary button label
  - `new_carer.cta_go_to_hub` — secondary link label

  ## Languages seeded
  en, es, fr, de, sv, fi, it
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
  -- English
  ('en', 'new_carer.cta_paid_mid_headline', 'Ready to build your actual Care Plan?'),
  ('en', 'new_carer.cta_paid_mid_body', 'This guide explains what to think through. The Care Plan Builder helps your team turn that thinking into a saved plan.'),
  ('en', 'new_carer.cta_paid_end_headline', 'Ready to build your actual Care Plan?'),
  ('en', 'new_carer.cta_paid_end_body', 'The New Carer guide helps you understand what to think through. The Care Plan Builder helps your caregiver team turn that thinking into a saved plan.'),
  ('en', 'new_carer.cta_open_care_plan', 'Open Care Plan'),
  ('en', 'new_carer.cta_open_builder', 'Open Care Plan Builder'),
  ('en', 'new_carer.cta_go_to_hub', 'Go to Care Hub'),

  -- Spanish
  ('es', 'new_carer.cta_paid_mid_headline', '¿Listo para construir tu Plan de Cuidados real?'),
  ('es', 'new_carer.cta_paid_mid_body', 'Esta guía explica qué considerar. El Constructor de Plan de Cuidados ayuda a tu equipo a convertir esas ideas en un plan guardado.'),
  ('es', 'new_carer.cta_paid_end_headline', '¿Listo para construir tu Plan de Cuidados real?'),
  ('es', 'new_carer.cta_paid_end_body', 'La guía para nuevos cuidadores te ayuda a comprender qué considerar. El Constructor de Plan de Cuidados ayuda a tu equipo a convertirlo en un plan guardado.'),
  ('es', 'new_carer.cta_open_care_plan', 'Abrir Plan de Cuidados'),
  ('es', 'new_carer.cta_open_builder', 'Abrir Constructor de Plan de Cuidados'),
  ('es', 'new_carer.cta_go_to_hub', 'Ir al Centro de Cuidados'),

  -- French
  ('fr', 'new_carer.cta_paid_mid_headline', 'Prêt à construire votre vrai Plan de soins ?'),
  ('fr', 'new_carer.cta_paid_mid_body', 'Ce guide explique quoi réfléchir. Le Constructeur de Plan de soins aide votre équipe à transformer cette réflexion en plan sauvegardé.'),
  ('fr', 'new_carer.cta_paid_end_headline', 'Prêt à construire votre vrai Plan de soins ?'),
  ('fr', 'new_carer.cta_paid_end_body', 'Le guide du nouveau soignant vous aide à comprendre quoi réfléchir. Le Constructeur de Plan de soins aide votre équipe à transformer cela en plan sauvegardé.'),
  ('fr', 'new_carer.cta_open_care_plan', 'Ouvrir le Plan de soins'),
  ('fr', 'new_carer.cta_open_builder', 'Ouvrir le Constructeur de Plan de soins'),
  ('fr', 'new_carer.cta_go_to_hub', 'Aller au Centre de soins'),

  -- German
  ('de', 'new_carer.cta_paid_mid_headline', 'Bereit, Ihren echten Pflegeplan zu erstellen?'),
  ('de', 'new_carer.cta_paid_mid_body', 'Dieser Leitfaden erklärt, was Sie durchdenken sollten. Der Pflegeplan-Builder hilft Ihrem Team, diese Überlegungen in einen gespeicherten Plan umzuwandeln.'),
  ('de', 'new_carer.cta_paid_end_headline', 'Bereit, Ihren echten Pflegeplan zu erstellen?'),
  ('de', 'new_carer.cta_paid_end_body', 'Der Leitfaden für neue Pflegende hilft Ihnen zu verstehen, was zu bedenken ist. Der Pflegeplan-Builder hilft Ihrem Team, dies in einen gespeicherten Plan umzuwandeln.'),
  ('de', 'new_carer.cta_open_care_plan', 'Pflegeplan öffnen'),
  ('de', 'new_carer.cta_open_builder', 'Pflegeplan-Builder öffnen'),
  ('de', 'new_carer.cta_go_to_hub', 'Zum Pflege-Hub'),

  -- Swedish
  ('sv', 'new_carer.cta_paid_mid_headline', 'Redo att bygga din riktiga Omsorgsplan?'),
  ('sv', 'new_carer.cta_paid_mid_body', 'Den här guiden förklarar vad du bör tänka igenom. Omsorgsplan-byggaren hjälper ditt team att omvandla dessa tankar till en sparad plan.'),
  ('sv', 'new_carer.cta_paid_end_headline', 'Redo att bygga din riktiga Omsorgsplan?'),
  ('sv', 'new_carer.cta_paid_end_body', 'Guiden för nya vårdare hjälper dig förstå vad du bör tänka igenom. Omsorgsplan-byggaren hjälper ditt team att omvandla det till en sparad plan.'),
  ('sv', 'new_carer.cta_open_care_plan', 'Öppna Omsorgsplan'),
  ('sv', 'new_carer.cta_open_builder', 'Öppna Omsorgsplan-byggaren'),
  ('sv', 'new_carer.cta_go_to_hub', 'Gå till Omsorgshubben'),

  -- Finnish
  ('fi', 'new_carer.cta_paid_mid_headline', 'Valmis rakentamaan todellisen Hoitosuunnitelmasi?'),
  ('fi', 'new_carer.cta_paid_mid_body', 'Tämä opas selittää, mitä sinun tulee miettiä. Hoitosuunnitelma-rakentaja auttaa tiimiäsi muuttamaan nämä ajatukset tallennetuksi suunnitelmaksi.'),
  ('fi', 'new_carer.cta_paid_end_headline', 'Valmis rakentamaan todellisen Hoitosuunnitelmasi?'),
  ('fi', 'new_carer.cta_paid_end_body', 'Uuden hoitajan opas auttaa sinua ymmärtämään, mitä tulee miettiä. Hoitosuunnitelma-rakentaja auttaa tiimiäsi muuttamaan sen tallennetuksi suunnitelmaksi.'),
  ('fi', 'new_carer.cta_open_care_plan', 'Avaa Hoitosuunnitelma'),
  ('fi', 'new_carer.cta_open_builder', 'Avaa Hoitosuunnitelma-rakentaja'),
  ('fi', 'new_carer.cta_go_to_hub', 'Siirry Hoitokeskukseen'),

  -- Italian
  ('it', 'new_carer.cta_paid_mid_headline', 'Pronto a costruire il tuo vero Piano di Cura?'),
  ('it', 'new_carer.cta_paid_mid_body', 'Questa guida spiega cosa considerare. Il Costruttore di Piano di Cura aiuta il tuo team a trasformare queste riflessioni in un piano salvato.'),
  ('it', 'new_carer.cta_paid_end_headline', 'Pronto a costruire il tuo vero Piano di Cura?'),
  ('it', 'new_carer.cta_paid_end_body', 'La guida per i nuovi caregiver ti aiuta a capire cosa considerare. Il Costruttore di Piano di Cura aiuta il tuo team a trasformarlo in un piano salvato.'),
  ('it', 'new_carer.cta_open_care_plan', 'Apri Piano di Cura'),
  ('it', 'new_carer.cta_open_builder', 'Apri Costruttore di Piano di Cura'),
  ('it', 'new_carer.cta_go_to_hub', 'Vai al Centro di Cura')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
