/*
  # Update "Free Carer Chat Room" labels

  ## Summary
  Updates the community banner CTA and nav link text to read "Free Carer Chat Room"
  across all 7 supported locales.

  ## Changes
  - `community_banner.cta`: Updated English to "Free Carer Chat Room" with matching
    translations for de, es, fi, fr, it, sv
  - `nav.caregiver_forum`: Inserted new key for all 7 locales so the header nav link
    displays "Free Carer Chat Room"
*/

INSERT INTO ui_translations (key, locale, value, updated_at) VALUES
  ('community_banner.cta', 'en', 'Free Carer Chat Room',  now()),
  ('community_banner.cta', 'de', 'Kostenloser Pflegechat', now()),
  ('community_banner.cta', 'es', 'Chat gratuito para cuidadores', now()),
  ('community_banner.cta', 'fi', 'Ilmainen hoitajakeskustelu', now()),
  ('community_banner.cta', 'fr', 'Tchat gratuit pour aidants', now()),
  ('community_banner.cta', 'it', 'Chat gratuita per caregiver', now()),
  ('community_banner.cta', 'sv', 'Gratis omvårdnadschat', now()),

  ('nav.caregiver_forum', 'en', 'Free Carer Chat Room',  now()),
  ('nav.caregiver_forum', 'de', 'Kostenloser Pflegechat', now()),
  ('nav.caregiver_forum', 'es', 'Chat gratuito para cuidadores', now()),
  ('nav.caregiver_forum', 'fi', 'Ilmainen hoitajakeskustelu', now()),
  ('nav.caregiver_forum', 'fr', 'Tchat gratuit pour aidants', now()),
  ('nav.caregiver_forum', 'it', 'Chat gratuita per caregiver', now()),
  ('nav.caregiver_forum', 'sv', 'Gratis omvårdnadschat', now())
ON CONFLICT (key, locale) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();
