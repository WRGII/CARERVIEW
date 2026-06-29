-- Update Memory Book public page hero: split title across two lines, refresh descriptor (English only)

UPDATE public.ui_translations
SET value = '"Needs-To-Know"',
    updated_at = now()
WHERE key = 'mb_page.hero_title'
  AND locale = 'en';

UPDATE public.ui_translations
SET value = 'all in one place.',
    updated_at = now()
WHERE key = 'mb_page.hero_title_line2'
  AND locale = 'en';

UPDATE public.ui_translations
SET value = 'The last thing you need is questions without answers. The Memory Book captures who your loved one is — who to call, what to watch for, what brings them comfort. The Care Book keeps every household detail organised and within reach. Together, they mean every carer walks in prepared.',
    updated_at = now()
WHERE key = 'mb_page.hero_body'
  AND locale = 'en';
