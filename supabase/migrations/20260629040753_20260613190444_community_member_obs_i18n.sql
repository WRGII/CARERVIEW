/*
  # i18n keys for Community Member solo observation quota UI
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'new_obs.solo_quota_reached_title', 'You''ve used your 3 free observations'),
  ('en', 'new_obs.solo_quota_reached_body',  'Upgrade to a paid plan to track observations without limits.'),
  ('en', 'new_obs.solo_quota_reached_cta',   'View plans'),
  ('en', 'new_obs.solo_remaining_one',        '1 free observation remaining'),
  ('en', 'new_obs.solo_remaining_other',      '{{count}} free observations remaining'),
  ('en', 'caregiver.free_obs_remaining_one',  '1 free observation remaining (rolling 12 months)'),
  ('en', 'caregiver.free_obs_remaining_other','{{count}} free observations remaining (rolling 12 months)'),
  ('en', 'caregiver.locked_panel_cta',        'Unlock with a paid plan'),
  ('en', 'pricing.plan_free_f5',              '3 free care observations (rolling 12 months)')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();