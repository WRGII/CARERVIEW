/*
  # About Page — Expanded Marketing Story (English)

  Updates and extends the About page i18n keys in English to reflect all three
  CarerView feature sets: New Carer Start, Memory Book, and Observations.

  ## Changes
  - Rewrites `about.page_title`, `about.body_p1`–`p4`, `about.cta_button`, `about.cta_body`
  - Adds new section heading keys: `about.origin_heading`, `about.features_heading`
  - Adds three feature card keys: `about.feature1_title/body`, `about.feature2_title/body`, `about.feature3_title/body`

  ## Notes
  - `about.body_p5` (memorial closing line) is intentionally preserved unchanged
  - All new keys will be propagated to other locales in a follow-up migration
*/

-- Rewrite existing EN keys
UPDATE ui_translations SET value = 'About CarerView'
  WHERE key = 'about.page_title' AND locale = 'en';

UPDATE ui_translations SET value = 'Caring for someone you love is never simple — especially when their abilities and needs change in ways that are hard to predict. Our family lived this first-hand across seven years of dementia-related challenges with our mother. Every day brought something different. Some days felt like small victories. Others felt like the ground had shifted overnight. What we learned, slowly and painfully, was that a single observation never told the full story. True understanding only came from seeing the patterns over time — and from making sure everyone involved in her care was working from the same picture.'
  WHERE key = 'about.body_p1' AND locale = 'en';

UPDATE ui_translations SET value = 'After her passing, we sat with a difficult question: what would have made that journey easier — not just for us, but for every family navigating the same path? The answer kept coming back to the same thing: clarity. Clarity about who the person really is. Clarity about what is changing day to day. And a clear starting point for families who find themselves suddenly responsible for someone else''s care with no map to follow. That reflection became the foundation for CarerView.'
  WHERE key = 'about.body_p2' AND locale = 'en';

UPDATE ui_translations SET value = 'Together, these three tools address the stress, confusion, and loss of continuity that wear family caregivers down over time. When a care team shares the same starting point, the same record of the person, and the same ongoing picture of how things are changing — they can give better care, communicate with less friction, and arrive at medical appointments with something more useful than memory alone. CarerView is not a clinical tool. It is a human one, built for the people who are doing the hardest job in someone else''s life.'
  WHERE key = 'about.body_p3' AND locale = 'en';

UPDATE ui_translations SET value = 'Our goal is to ease the stress, the isolation, and the quiet overwhelm that so often comes with caregiving. We believe that when caregivers have clarity, the person in their care gets better, more consistent, more compassionate attention — and families can focus more on what matters most: time together.'
  WHERE key = 'about.body_p4' AND locale = 'en';

UPDATE ui_translations SET value = 'Get Started'
  WHERE key = 'about.cta_button' AND locale = 'en';

UPDATE ui_translations SET value = 'Join families who are using CarerView to navigate caregiving with more clarity, more confidence, and less isolation. Start your New Carer journey, build a Memory Book, and begin tracking observations — all in one place.'
  WHERE key = 'about.cta_body' AND locale = 'en';

-- Add new EN keys (insert if not present, update if already there)
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.origin_heading',   'en', 'Where CarerView Began'),
  ('about.features_heading', 'en', 'Three Tools. One Clear Picture.'),
  ('about.feature1_title',   'en', 'New Carer Start'),
  ('about.feature1_body',    'en', 'When you first become a family caregiver there is no handbook. CarerView''s New Carer guide walks you through the key decisions, contacts, documents, and care arrangements you need to have in place — so nothing critical falls through the cracks in those overwhelming early weeks.'),
  ('about.feature2_title',   'en', 'Memory Book'),
  ('about.feature2_body',    'en', 'A living record of the person in care — their identity, life history, daily preferences, medical background, and the routines that matter to them. Every family member and professional carer starts from the same understanding of who this person is, not just what their diagnosis says.'),
  ('about.feature3_title',   'en', 'Observations'),
  ('about.feature3_body',    'en', 'Structured daily or weekly check-ins using the same ADL and IADL scales used by healthcare professionals. Over time, individual entries build into a meaningful trend record — one you can share with a GP, specialist, or care team to show what is actually changing and when it started.')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
