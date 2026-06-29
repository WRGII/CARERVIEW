-- Add observations bullet to Community Member pricing card (EN only)
-- Also updates description to mention the 3 free observations

UPDATE ui_translations
SET value = 'Connect with other caregivers in our peer support forum and try 3 free care observations. Share experiences, ask questions, and find support — no care team needed. Always free.',
    updated_at = now()
WHERE key = 'pricing.plan_free_desc' AND locale = 'en';

-- f1 stays: 'Access all 6 caregiver support rooms'
-- f2 stays: 'Post, reply, and react with other caregivers'
-- f3 stays: 'Post anonymously when you need privacy'
-- f4 stays: 'No invite required — join instantly'

-- New f5: observations allowance
INSERT INTO ui_translations (key, locale, value, updated_at)
VALUES ('pricing.plan_free_f5', 'en', '3 free care observations (rolling 12 months)', now())
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
