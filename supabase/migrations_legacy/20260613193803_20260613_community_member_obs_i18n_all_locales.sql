/*
  # Community Member — Observation quota UI keys, all 7 non-English locales
  
  Adds es, it, fr, de, sv, fi, ja for the 9 keys seeded English-only on 2026-06-13:
    new_obs.solo_quota_reached_title/body/cta
    new_obs.solo_remaining_one/other
    caregiver.free_obs_remaining_one/other
    caregiver.locked_panel_cta
    pricing.plan_free_f5
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

  -- new_obs.solo_quota_reached_title
  ('es', 'new_obs.solo_quota_reached_title', 'Has usado tus 3 observaciones gratuitas'),
  ('it', 'new_obs.solo_quota_reached_title', 'Hai utilizzato le tue 3 osservazioni gratuite'),
  ('fr', 'new_obs.solo_quota_reached_title', 'Vous avez utilisé vos 3 observations gratuites'),
  ('de', 'new_obs.solo_quota_reached_title', 'Sie haben Ihre 3 kostenlosen Beobachtungen verbraucht'),
  ('sv', 'new_obs.solo_quota_reached_title', 'Du har använt dina 3 gratis observationer'),
  ('fi', 'new_obs.solo_quota_reached_title', 'Olet käyttänyt 3 ilmaista havaintoasi'),
  ('ja', 'new_obs.solo_quota_reached_title', '無料の観察3回を使い切りました'),

  -- new_obs.solo_quota_reached_body
  ('es', 'new_obs.solo_quota_reached_body', 'Actualiza a un plan de pago para registrar observaciones sin límites.'),
  ('it', 'new_obs.solo_quota_reached_body', 'Passa a un piano a pagamento per registrare osservazioni senza limiti.'),
  ('fr', 'new_obs.solo_quota_reached_body', 'Passez à un plan payant pour suivre les observations sans limites.'),
  ('de', 'new_obs.solo_quota_reached_body', 'Wechseln Sie zu einem kostenpflichtigen Plan, um Beobachtungen ohne Einschränkungen zu verfolgen.'),
  ('sv', 'new_obs.solo_quota_reached_body', 'Uppgradera till ett betalt abonnemang för att spåra observationer utan begränsningar.'),
  ('fi', 'new_obs.solo_quota_reached_body', 'Päivitä maksulliseen suunnitelmaan seurataksesi havaintoja rajoituksetta.'),
  ('ja', 'new_obs.solo_quota_reached_body', '有料プランにアップグレードして、制限なく観察を記録しましょう。'),

  -- new_obs.solo_quota_reached_cta
  ('es', 'new_obs.solo_quota_reached_cta', 'Ver planes'),
  ('it', 'new_obs.solo_quota_reached_cta', 'Visualizza i piani'),
  ('fr', 'new_obs.solo_quota_reached_cta', 'Voir les forfaits'),
  ('de', 'new_obs.solo_quota_reached_cta', 'Pläne ansehen'),
  ('sv', 'new_obs.solo_quota_reached_cta', 'Visa planer'),
  ('fi', 'new_obs.solo_quota_reached_cta', 'Katso suunnitelmat'),
  ('ja', 'new_obs.solo_quota_reached_cta', 'プランを見る'),

  -- new_obs.solo_remaining_one
  ('es', 'new_obs.solo_remaining_one', '1 observación gratuita restante'),
  ('it', 'new_obs.solo_remaining_one', '1 osservazione gratuita rimanente'),
  ('fr', 'new_obs.solo_remaining_one', '1 observation gratuite restante'),
  ('de', 'new_obs.solo_remaining_one', '1 kostenlose Beobachtung verbleibend'),
  ('sv', 'new_obs.solo_remaining_one', '1 gratis observation kvar'),
  ('fi', 'new_obs.solo_remaining_one', '1 ilmainen havainto jäljellä'),
  ('ja', 'new_obs.solo_remaining_one', '無料の観察があと1回残っています'),

  -- new_obs.solo_remaining_other (preserve {{count}} interpolation variable)
  ('es', 'new_obs.solo_remaining_other', '{{count}} observaciones gratuitas restantes'),
  ('it', 'new_obs.solo_remaining_other', '{{count}} osservazioni gratuite rimanenti'),
  ('fr', 'new_obs.solo_remaining_other', '{{count}} observations gratuites restantes'),
  ('de', 'new_obs.solo_remaining_other', '{{count}} kostenlose Beobachtungen verbleibend'),
  ('sv', 'new_obs.solo_remaining_other', '{{count}} gratis observationer kvar'),
  ('fi', 'new_obs.solo_remaining_other', '{{count}} ilmaista havaintoa jäljellä'),
  ('ja', 'new_obs.solo_remaining_other', '無料の観察があと{{count}}回残っています'),

  -- caregiver.free_obs_remaining_one
  ('es', 'caregiver.free_obs_remaining_one', '1 observación gratuita restante (en los últimos 12 meses)'),
  ('it', 'caregiver.free_obs_remaining_one', '1 osservazione gratuita rimanente (negli ultimi 12 mesi)'),
  ('fr', 'caregiver.free_obs_remaining_one', '1 observation gratuite restante (sur les 12 derniers mois)'),
  ('de', 'caregiver.free_obs_remaining_one', '1 kostenlose Beobachtung verbleibend (letzte 12 Monate)'),
  ('sv', 'caregiver.free_obs_remaining_one', '1 gratis observation kvar (senaste 12 månaderna)'),
  ('fi', 'caregiver.free_obs_remaining_one', '1 ilmainen havainto jäljellä (viimeiset 12 kuukautta)'),
  ('ja', 'caregiver.free_obs_remaining_one', '無料の観察があと1回残っています（過去12か月）'),

  -- caregiver.free_obs_remaining_other
  ('es', 'caregiver.free_obs_remaining_other', '{{count}} observaciones gratuitas restantes (en los últimos 12 meses)'),
  ('it', 'caregiver.free_obs_remaining_other', '{{count}} osservazioni gratuite rimanenti (negli ultimi 12 mesi)'),
  ('fr', 'caregiver.free_obs_remaining_other', '{{count}} observations gratuites restantes (sur les 12 derniers mois)'),
  ('de', 'caregiver.free_obs_remaining_other', '{{count}} kostenlose Beobachtungen verbleibend (letzte 12 Monate)'),
  ('sv', 'caregiver.free_obs_remaining_other', '{{count}} gratis observationer kvar (senaste 12 månaderna)'),
  ('fi', 'caregiver.free_obs_remaining_other', '{{count}} ilmaista havaintoa jäljellä (viimeiset 12 kuukautta)'),
  ('ja', 'caregiver.free_obs_remaining_other', '無料の観察があと{{count}}回残っています（過去12か月）'),

  -- caregiver.locked_panel_cta
  ('es', 'caregiver.locked_panel_cta', 'Desbloquear con un plan de pago'),
  ('it', 'caregiver.locked_panel_cta', 'Sblocca con un piano a pagamento'),
  ('fr', 'caregiver.locked_panel_cta', 'Débloquer avec un plan payant'),
  ('de', 'caregiver.locked_panel_cta', 'Mit einem kostenpflichtigen Plan freischalten'),
  ('sv', 'caregiver.locked_panel_cta', 'Lås upp med ett betalt abonnemang'),
  ('fi', 'caregiver.locked_panel_cta', 'Avaa maksullisella suunnitelmalla'),
  ('ja', 'caregiver.locked_panel_cta', '有料プランで解除する'),

  -- pricing.plan_free_f5
  ('es', 'pricing.plan_free_f5', '3 observaciones de cuidado gratuitas (en los últimos 12 meses)'),
  ('it', 'pricing.plan_free_f5', '3 osservazioni di cura gratuite (negli ultimi 12 mesi)'),
  ('fr', 'pricing.plan_free_f5', '3 observations de soins gratuites (sur les 12 derniers mois)'),
  ('de', 'pricing.plan_free_f5', '3 kostenlose Pflegebeobachtungen (letzte 12 Monate)'),
  ('sv', 'pricing.plan_free_f5', '3 gratis vårdsobservationer (senaste 12 månaderna)'),
  ('fi', 'pricing.plan_free_f5', '3 ilmaista hoitohavaintoa (viimeiset 12 kuukautta)'),
  ('ja', 'pricing.plan_free_f5', '無料のケア観察3回（過去12か月）')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
