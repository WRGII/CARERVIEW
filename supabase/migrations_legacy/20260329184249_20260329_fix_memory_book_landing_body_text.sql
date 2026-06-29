/*
  # Fix Memory Book landing body text

  Removes the opening sentence "When a new caregiver steps in, the first few hours shouldn't
  be spent asking questions." from the landing.mb_body translation key for the 'en' locale,
  aligning the database value with the enFallback.ts source of truth.
*/

UPDATE ui_translations
SET value = 'The Memory Book is a living care profile for your loved one — covering who they are, who to call, what to watch for, and what makes them feel at home.',
    updated_at = now()
WHERE key = 'landing.mb_body'
  AND locale = 'en';
