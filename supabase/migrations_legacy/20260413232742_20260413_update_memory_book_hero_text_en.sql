/*
  # Update Memory Book Hero Text (English)

  ## Changes
  - Updates `mb_page.hero_title` (en) to new shorter headline
  - Updates `mb_page.hero_body` (en) to remove the opening sentence
  - Updates `landing.mb_title` (en) to match the new headline
*/

UPDATE ui_translations
SET value = 'Carers "needs to know" all in one place'
WHERE locale = 'en' AND key = 'mb_page.hero_title';

UPDATE ui_translations
SET value = 'The Memory Book captures who your loved one is, who to call, what to watch for, and what brings them comfort — shared instantly with everyone on your care team.'
WHERE locale = 'en' AND key = 'mb_page.hero_body';

UPDATE ui_translations
SET value = 'Carers "needs to know" all in one place'
WHERE locale = 'en' AND key = 'landing.mb_title';
