/*
  # Fix create_account.obs_family: align to 3 caregivers across all locales

  The translation key create_account.obs_family was seeded with "up to 5 caregivers"
  across 5 locales. All other Family Circle copy (pricing page, family setup, FAQ,
  plan limits table) consistently says 3 caregivers. This migration corrects the mismatch.

  UPDATE 5 existing rows (en, es, sv, fi, ja) from "5" to "3".
  INSERT 3 missing rows (fr, de, it) with correct "3 caregiver" copy using
  ON CONFLICT DO UPDATE so this is idempotent.

  Mirrors the corrective UPDATE pattern from
  20260311062338_rename_free_observer_to_community_member which fixed the identical
  stale obs_free copy.
*/

UPDATE ui_translations SET value = 'Unlimited observations, up to 3 caregivers'
  WHERE key = 'create_account.obs_family' AND locale = 'en';

UPDATE ui_translations SET value = 'Observaciones ilimitadas, hasta 3 cuidadores'
  WHERE key = 'create_account.obs_family' AND locale = 'es';

UPDATE ui_translations SET value = 'Obegränsade observationer, upp till 3 vårdgivare'
  WHERE key = 'create_account.obs_family' AND locale = 'sv';

UPDATE ui_translations SET value = 'Rajoittamattomat havainnot, enintään 3 hoitajaa'
  WHERE key = 'create_account.obs_family' AND locale = 'fi';

UPDATE ui_translations SET value = '無制限の観察、最大3名のケアラー'
  WHERE key = 'create_account.obs_family' AND locale = 'ja';

INSERT INTO ui_translations (key, locale, value) VALUES
  ('create_account.obs_family', 'fr', 'Observations illimitées, jusqu''à 3 aidants'),
  ('create_account.obs_family', 'de', 'Unbegrenzte Beobachtungen, bis zu 3 Pflegepersonen'),
  ('create_account.obs_family', 'it', 'Osservazioni illimitate, fino a 3 caregiver')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
