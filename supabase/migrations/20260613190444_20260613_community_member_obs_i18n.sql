/*
  # i18n keys for Community Member solo observation quota UI
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES
  -- New Observation page — quota reached upgrade prompt
  ('en', 'new_obs.solo_quota_reached_title', 'You''ve used your 3 free observations'),
  ('en', 'new_obs.solo_quota_reached_body',  'Upgrade to a paid plan to track observations without limits.'),
  ('en', 'new_obs.solo_quota_reached_cta',   'View plans'),
  -- Remaining count on New Observation page (for solo users)
  ('en', 'new_obs.solo_remaining_one',        '1 free observation remaining'),
  ('en', 'new_obs.solo_remaining_other',      '{{count}} free observations remaining'),
  -- Dashboard remaining count badge
  ('en', 'caregiver.free_obs_remaining_one',  '1 free observation remaining (rolling 12 months)'),
  ('en', 'caregiver.free_obs_remaining_other','{{count}} free observations remaining (rolling 12 months)'),
  -- Locked panel upgrade label
  ('en', 'caregiver.locked_panel_cta',        'Unlock with a paid plan'),
  -- Pricing card — 5th bullet for free plan
  ('en', 'pricing.plan_free_f5',              '3 free care observations (rolling 12 months)')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
