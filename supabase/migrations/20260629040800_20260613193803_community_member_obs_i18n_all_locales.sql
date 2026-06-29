/*
  # Community Member — Observation quota UI keys, all 7 non-English locales
  
  Adds es, it, fr, de, sv, fi, ja for the 9 keys
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('es', 'new_obs.solo_quota_reached_title', 'Has usado tus 3 observaciones gratuitas'),
  ('it', 'new_obs.solo_quota_reached_title', 'Hai utilizzato le tue 3 osservazioni gratuite'),
  ('fr', 'new_obs.solo_quota_reached_title', 'Vous avez utilisé vos 3 observations gratuites'),
  ('de', 'new_obs.solo_quota_reached_title', 'Sie haben Ihre 3 kostenlosen Beobachtungen verbraucht'),
  ('sv', 'new_obs.solo_quota_reached_title', 'Du har använt dina 3 gratis observationer'),
  ('fi', 'new_obs.solo_quota_reached_title', 'Olet käyttänyt 3 ilmaista havaintoasi'),
  ('ja', 'new_obs.solo_quota_reached_title', '無料の観察3回を使い切りました'),
  ('es', 'caregiver.locked_panel_cta', 'Desbloquear con un plan de pago'),
  ('it', 'caregiver.locked_panel_cta', 'Sblocca con un piano a pagamento'),
  ('fr', 'caregiver.locked_panel_cta', 'Débloquer avec un plan payant'),
  ('de', 'caregiver.locked_panel_cta', 'Mit einem kostenpflichtigen Plan freischalten'),
  ('sv', 'caregiver.locked_panel_cta', 'Lås upp med ett betalt abonnemang'),
  ('fi', 'caregiver.locked_panel_cta', 'Avaa maksullisella suunnitelmalla'),
  ('ja', 'caregiver.locked_panel_cta', '有料プランで解除する'),
  ('es', 'pricing.plan_free_f5', '3 observaciones de cuidado gratuitas (en los últimos 12 meses)'),
  ('it', 'pricing.plan_free_f5', '3 osservazioni di cura gratuite (negli ultimi 12 mesi)'),
  ('fr', 'pricing.plan_free_f5', '3 observations de soins gratuites (sur les 12 derniers mois)'),
  ('de', 'pricing.plan_free_f5', '3 kostenlose Pflegebeobachtungen (letzte 12 Monate)'),
  ('sv', 'pricing.plan_free_f5', '3 gratis vårdsobservationer (senaste 12 månaderna)'),
  ('fi', 'pricing.plan_free_f5', '3 ilmaista hoitohavaintoa (viimeiset 12 kuukautta)'),
  ('ja', 'pricing.plan_free_f5', '無料のケア観察3回（過去12か月）')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();