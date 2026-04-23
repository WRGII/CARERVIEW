/*
  # Caregiver Resources Page + Community Funnel — i18n Translation Keys

  Adds all English-language translation keys for:

  1. New namespace: `public.caregiver_resources.*`
     - Hero section: heading, intro paragraphs
     - 5 resource cards: titles, domains, descriptions
     - Section headings (Community Bridge, How to Use, Mid-funnel CTA, Final CTA)
     - 3 discussion preview cards: titles, excerpts, link label
     - CTA button labels

  2. New namespace: `public.community.*`
     - "Popular Starting Topics" section heading + intro
     - Same 3 discussion preview cards (reused on both community pages)
     - Interaction lock modal: title, body, buttons

  3. New nav key: `nav.caregiver_resources`

  4. New footer key: `footer.resources_heading`

  5. Only English (locale='en') is seeded. Other locales fall back to English
     via the existing LocaleProvider fallback mechanism.

  Uses ON CONFLICT DO UPDATE to be safe on re-runs.
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- Navigation
('en', 'nav.caregiver_resources', 'Caregiver Resources'),

-- Footer
('en', 'footer.resources_heading', 'Resources'),

-- =========================================================
-- CAREGIVER RESOURCES PAGE
-- =========================================================

-- Page meta
('en', 'public.caregiver_resources.page_title', 'Caregiver Resources for Dementia & Memory Care | CarerView'),
('en', 'public.caregiver_resources.meta_desc', 'Find trusted caregiver resources for dementia and memory care. Simple guides, support organizations, and planning tools to help new caregivers get started.'),

-- Section A: Hero
('en', 'public.caregiver_resources.hero_heading', 'Caregiver Resources for Dementia and Memory Care'),
('en', 'public.caregiver_resources.hero_intro_1', 'If you are new to caring for someone with memory loss or dementia, it can feel overwhelming. You do not need to figure everything out on your own.'),
('en', 'public.caregiver_resources.hero_intro_2', 'Below are trusted organizations and government resources that can help you understand what to expect, plan ahead, and get support.'),

-- Section B: Resource card 1 — Alzheimers.gov
('en', 'public.caregiver_resources.res1_title', 'Alzheimers.gov'),
('en', 'public.caregiver_resources.res1_domain', 'alzheimers.gov'),
('en', 'public.caregiver_resources.res1_desc', 'A U.S. government website designed for people who are new to dementia care. It explains what to expect, how to plan ahead, and where to find help. This is one of the best places to start if you are unsure what to do next.'),

-- Resource card 2 — National Institute on Aging
('en', 'public.caregiver_resources.res2_title', 'National Institute on Aging'),
('en', 'public.caregiver_resources.res2_domain', 'nia.nih.gov'),
('en', 'public.caregiver_resources.res2_desc', 'Provides clear, research-based information about Alzheimer''s and memory conditions. Includes practical guides on caregiving, health changes, and how to take care of yourself as a caregiver.'),

-- Resource card 3 — Alzheimer''s Association
('en', 'public.caregiver_resources.res3_title', 'Alzheimer''s Association'),
('en', 'public.caregiver_resources.res3_domain', 'alz.org'),
('en', 'public.caregiver_resources.res3_desc', 'A leading nonprofit offering caregiver support, education, and a 24/7 helpline. You can find local support groups, talk to someone anytime, and access step-by-step guidance for different stages of care.'),

-- Resource card 4 — Alzheimer''s Foundation of America
('en', 'public.caregiver_resources.res4_title', 'Alzheimer''s Foundation of America'),
('en', 'public.caregiver_resources.res4_domain', 'alzfdn.org'),
('en', 'public.caregiver_resources.res4_desc', 'Focuses on practical support for caregivers, including education, memory screenings, and community programs. Helpful for families looking for hands-on guidance and emotional support.'),

-- Resource card 5 — Family Caregiver Alliance
('en', 'public.caregiver_resources.res5_title', 'Family Caregiver Alliance'),
('en', 'public.caregiver_resources.res5_domain', 'caregiver.org'),
('en', 'public.caregiver_resources.res5_desc', 'Provides support for all types of caregivers, including those caring for people with dementia. Strong focus on long-term planning, caregiver rights, and managing stress over time.'),

-- Section C: Community Bridge
('en', 'public.caregiver_resources.bridge_heading', 'You''re Not Alone'),
('en', 'public.caregiver_resources.bridge_intro_1', 'Many caregivers start in the same place — unsure, overwhelmed, and looking for direction.'),
('en', 'public.caregiver_resources.bridge_intro_2', 'You can read guides, but it also helps to hear from people going through the same experience.'),
('en', 'public.caregiver_resources.bridge_view_discussion', 'View Discussion'),

-- Section D: How to Use
('en', 'public.caregiver_resources.how_to_heading', 'How to Use These Resources'),
('en', 'public.caregiver_resources.how_to_intro', 'Each resource serves a different purpose:'),
('en', 'public.caregiver_resources.how_to_bullet_1', 'Start with government guides to understand the condition'),
('en', 'public.caregiver_resources.how_to_bullet_2', 'Use nonprofit organizations for support and real-world help'),
('en', 'public.caregiver_resources.how_to_bullet_3', 'Look for local services and support groups when you are ready'),
('en', 'public.caregiver_resources.how_to_closing', 'You do not need to use everything at once. Start with one and build from there.'),

-- Section E: Mid-funnel CTA
('en', 'public.caregiver_resources.mid_cta_heading', 'Learn from Other Caregivers'),
('en', 'public.caregiver_resources.mid_cta_body', 'Guides are helpful, but real experiences matter. See what other caregivers are asking and sharing.'),
('en', 'public.caregiver_resources.mid_cta_btn', 'Explore Community'),

-- Section F: Final CTA
('en', 'public.caregiver_resources.final_cta_heading', 'Go Beyond Reading — Start Organizing Care'),
('en', 'public.caregiver_resources.final_cta_body', 'Learn from others. Then take control of your own care plan with CarerView.'),
('en', 'public.caregiver_resources.final_cta_primary_btn', 'Get Started'),
('en', 'public.caregiver_resources.final_cta_secondary_btn', 'Explore Community'),

-- =========================================================
-- COMMUNITY PAGES — Popular Starting Topics
-- =========================================================

('en', 'public.community.popular_topics_heading', 'Popular Starting Topics'),
('en', 'public.community.popular_topics_intro', 'Questions caregivers ask most when they are just getting started.'),

-- Discussion card 1
('en', 'public.community.topic1_title', 'I just became a caregiver. Where do I start?'),
('en', 'public.community.topic1_excerpt', 'I''m suddenly responsible for a parent with memory loss and don''t know what to prioritize first.'),

-- Discussion card 2
('en', 'public.community.topic2_title', 'How do you know when it''s time for more care?'),
('en', 'public.community.topic2_excerpt', 'I''m trying to decide between managing at home or getting outside help.'),

-- Discussion card 3
('en', 'public.community.topic3_title', 'What caught you off guard as a new caregiver?'),
('en', 'public.community.topic3_excerpt', 'Looking back, what do you wish you had planned earlier?'),

-- Interaction lock modal
('en', 'public.community.join_modal_title', 'Join the Community'),
('en', 'public.community.join_modal_body', 'Create a free account to ask questions, share experiences, and connect with other caregivers.'),
('en', 'public.community.join_modal_create_btn', 'Create Free Account'),
('en', 'public.community.join_modal_signin_btn', 'Sign In')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
