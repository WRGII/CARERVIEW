-- Update English-only pricing copy for the Community Member (free) plan
-- Non-English locales are left unchanged until a dedicated translation pass

UPDATE ui_translations
SET value = 'Community Member', updated_at = now()
WHERE key = 'pricing.plan_free_name' AND locale = 'en';

UPDATE ui_translations
SET value = 'Connect with other caregivers in our peer support forum. Share experiences, ask questions, and find support — no care team needed. Always free.', updated_at = now()
WHERE key = 'pricing.plan_free_desc' AND locale = 'en';

UPDATE ui_translations
SET value = 'Access all 6 caregiver support rooms', updated_at = now()
WHERE key = 'pricing.plan_free_f1' AND locale = 'en';

UPDATE ui_translations
SET value = 'Post, reply, and react with other caregivers', updated_at = now()
WHERE key = 'pricing.plan_free_f2' AND locale = 'en';

UPDATE ui_translations
SET value = 'Post anonymously when you need privacy', updated_at = now()
WHERE key = 'pricing.plan_free_f3' AND locale = 'en';

-- Insert new 4th feature bullet (en only; other locales to be added in a later translation pass)
INSERT INTO ui_translations (key, locale, value, updated_at)
VALUES ('pricing.plan_free_f4', 'en', 'No invite required — join instantly', now())
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
