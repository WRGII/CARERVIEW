/*
  # Update English community_banner.cta translation

  Changes the English CTA button label from "Community Discussions"
  to "Carer Community Discussions" to better reflect the audience.
*/

UPDATE public.ui_translations
SET value = 'Carer Community Discussions'
WHERE locale = 'en'
  AND key = 'community_banner.cta';
