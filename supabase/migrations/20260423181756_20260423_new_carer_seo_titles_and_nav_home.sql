/*
  # New Carer SEO — Improved Page Titles, Meta Descriptions, and nav.home key

  ## Changes
  1. Adds `nav.home` translation key for all 7 supported locales
     (used by the upgraded NewCarerBreadcrumb component on every module page)
  2. Updates New Carer page titles to be search-intent-friendly
  3. Updates meta descriptions to include target keywords and a soft CTA

  ## Supported locales: en, es, it, fr, de, sv, fi
*/

-- ── nav.home ──────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'nav.home', 'Home'),
  ('sv', 'nav.home', 'Hem'),
  ('fi', 'nav.home', 'Koti'),
  ('de', 'nav.home', 'Startseite'),
  ('fr', 'nav.home', 'Accueil'),
  ('es', 'nav.home', 'Inicio'),
  ('it', 'nav.home', 'Home')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Hub page ──────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.page_title', 'New to Caregiving? Where to Start | CarerView'),
  ('en', 'new_carer.meta_desc',  'A practical guide for first-time family carers. Covers care planning, roles, living arrangements, legal documents, health coordination, and carer sustainability. Free on CarerView.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 1 — Big Picture ───────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.bp_page_title', 'What Does Caregiving Actually Involve? | New Carer Guide'),
  ('en', 'new_carer.bp_meta_desc',  'Most new carers underestimate the scope of the role. This guide helps first-time family carers understand what they are taking on before daily tasks take over.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 2 — Care Plan ─────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.cp_page_title', 'How to Build a Care Plan for an Elderly Parent | New Carer'),
  ('en', 'new_carer.cp_meta_desc',  'An eight-pillar care planning framework for new family carers. Covers care needs, decision authority, team, living arrangements, health, paperwork, sustainability, and review.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 3 — Roles ─────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.roles_page_title', 'Family Caregiver Roles and Responsibilities | New Carer Guide'),
  ('en', 'new_carer.roles_meta_desc',  'Understand the full range of caregiver responsibilities — from personal care and health coordination to admin, scheduling, and respite. Know what you are taking on.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 4 — Living Arrangements ───────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.living_page_title', 'Elderly Parent Living Arrangements — Your Options Explained'),
  ('en', 'new_carer.living_meta_desc',  'Weighing up care options for an elderly parent? This guide compares staying at home, moving in with family, in-home support, and care facilities — with a practical planning checklist.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 5 — Documents & Authority ─────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.docs_page_title', 'Caregiver Legal Documents and Authority | Power of Attorney Guide'),
  ('en', 'new_carer.docs_meta_desc',  'Being a family carer does not automatically mean having legal authority. This guide covers what documents you need — medical, financial, and legal — and why acting early matters.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 6 — Health Coordination ───────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.health_page_title', 'How to Manage Health Care for an Elderly Parent | Family Carer'),
  ('en', 'new_carer.health_meta_desc',  'Learn how to coordinate health information, medications, appointments, and care providers for a parent or loved one. Practical guidance for new family carers.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 7 — Sustainability ─────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.sustain_page_title', 'Preventing Caregiver Burnout — Sustainability for Family Carers'),
  ('en', 'new_carer.sustain_meta_desc',  'Caregiver burnout is preventable when sustainability is planned from the start. This guide covers common pressures, respite planning, and how to protect yourself for the long term.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Module 8 — Review Plan ───────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'new_carer.review_page_title', 'How to Review a Care Plan When Things Change | Family Carer'),
  ('en', 'new_carer.review_meta_desc',  'Care needs change — and so should the plan. This guide explains when and how to review a family care plan, what triggers an urgent review, and how to keep your approach up to date.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
