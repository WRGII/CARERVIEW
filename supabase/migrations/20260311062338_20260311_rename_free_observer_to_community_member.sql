/*
  # Rename Free Observer to Free Community Member

  ## Summary
  Updates the displayed plan name for the free tier from "Free Observer" to
  "Free Community Member" across all supported locales, and corrects the
  observation limit copy from the stale "Up to 10 per month" text to the
  accurate "3 Observations per Year" that matches the actual enforced quota.

  ## Changes

  ### Translation Key Updates
  - `pricing.plan_free_name` — Updated in all 7 locales (en, es, fr, it, de, sv, fi)
    to the appropriate equivalent of "Free Community Member"
  - `pricing.plan_free_desc` — Updated in all 7 locales to reflect the 3 observations
    per year allowance and community access
  - `create_account.obs_free` — Updated in all 7 locales from "Up to 10 per month"
    to "3 Observations per Year" to match the actual enforced database quota

  ## Notes
  - Uses UPDATE only; rows already exist for all 7 locales
  - Backend quota enforcement (3/year) was already correct — only display text needed fixing
  - No schema changes, no RLS changes
*/

-- pricing.plan_free_name
UPDATE ui_translations SET value = 'Free Community Member' WHERE key = 'pricing.plan_free_name' AND locale = 'en';
UPDATE ui_translations SET value = 'Miembro Gratuito de la Comunidad' WHERE key = 'pricing.plan_free_name' AND locale = 'es';
UPDATE ui_translations SET value = 'Membre Gratuit de la Communauté' WHERE key = 'pricing.plan_free_name' AND locale = 'fr';
UPDATE ui_translations SET value = 'Membro Gratuito della Comunità' WHERE key = 'pricing.plan_free_name' AND locale = 'it';
UPDATE ui_translations SET value = 'Kostenloses Community-Mitglied' WHERE key = 'pricing.plan_free_name' AND locale = 'de';
UPDATE ui_translations SET value = 'Kostnadsfri Community-Medlem' WHERE key = 'pricing.plan_free_name' AND locale = 'sv';
UPDATE ui_translations SET value = 'Ilmainen Yhteisönjäsen' WHERE key = 'pricing.plan_free_name' AND locale = 'fi';

-- pricing.plan_free_desc
UPDATE ui_translations SET value = 'Three free observations per year. Join the community and stay connected—free forever.' WHERE key = 'pricing.plan_free_desc' AND locale = 'en';
UPDATE ui_translations SET value = 'Tres observaciones gratuitas al año. Únase a la comunidad y manténgase conectado—gratis para siempre.' WHERE key = 'pricing.plan_free_desc' AND locale = 'es';
UPDATE ui_translations SET value = 'Trois observations gratuites par an. Rejoignez la communauté et restez connecté—gratuit pour toujours.' WHERE key = 'pricing.plan_free_desc' AND locale = 'fr';
UPDATE ui_translations SET value = 'Tre osservazioni gratuite all''anno. Unisciti alla comunità e rimani connesso—gratuito per sempre.' WHERE key = 'pricing.plan_free_desc' AND locale = 'it';
UPDATE ui_translations SET value = 'Drei kostenlose Beobachtungen pro Jahr. Treten Sie der Community bei und bleiben Sie verbunden—kostenlos für immer.' WHERE key = 'pricing.plan_free_desc' AND locale = 'de';
UPDATE ui_translations SET value = 'Tre kostnadsfria observationer per år. Gå med i communityn och håll kontakten—gratis för alltid.' WHERE key = 'pricing.plan_free_desc' AND locale = 'sv';
UPDATE ui_translations SET value = 'Kolme ilmaista havaintoa vuodessa. Liity yhteisöön ja pysy yhteydessä—ilmaiseksi ikuisesti.' WHERE key = 'pricing.plan_free_desc' AND locale = 'fi';

-- create_account.obs_free (corrects stale "10 per month" copy to actual enforced limit)
UPDATE ui_translations SET value = '3 Observations per Year' WHERE key = 'create_account.obs_free' AND locale = 'en';
UPDATE ui_translations SET value = '3 observaciones por año' WHERE key = 'create_account.obs_free' AND locale = 'es';
UPDATE ui_translations SET value = '3 observations par an' WHERE key = 'create_account.obs_free' AND locale = 'fr';
UPDATE ui_translations SET value = '3 osservazioni all''anno' WHERE key = 'create_account.obs_free' AND locale = 'it';
UPDATE ui_translations SET value = '3 Beobachtungen pro Jahr' WHERE key = 'create_account.obs_free' AND locale = 'de';
UPDATE ui_translations SET value = '3 observationer per år' WHERE key = 'create_account.obs_free' AND locale = 'sv';
UPDATE ui_translations SET value = '3 havaintoa vuodessa' WHERE key = 'create_account.obs_free' AND locale = 'fi';
