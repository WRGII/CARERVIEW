/*
# Memory Book hero title — consistent two-line split across all locales

## Problem
The Memory Book page hero renders two lines:
  Line 1: mb_page.hero_title       (the "Needs-To-Know" concept phrase)
  Line 2: mb_page.hero_title_line2 (the "all in one place" tail)

English is correct, but every other locale crammed the FULL sentence into
line 1 and then repeated the tail fragment in line 2 — producing redundant
text and an inconsistent layout. Japanese was missing both keys entirely.
German also had broken quote escaping („Wissen-Müssen\" ...).

## Fix
Restructure each locale so line 1 holds only the quoted concept phrase and
line 2 holds only the "all in one place" tail, mirroring the English split.
Use native quotation marks per locale (French guillemets « », Japanese
corner brackets 「」). Japanese rows are created fresh.

## Approach
- INSERT ... ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value
- namespace = 'common' to match existing storage convention.
- Idempotent: safe to re-run.

## Security
- No schema or RLS changes. Data-only update to ui_translations.
*/

-- en (unchanged, included for completeness/idempotency)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('en', 'common', 'mb_page.hero_title', '"Needs-To-Know"'),
       ('en', 'common', 'mb_page.hero_title_line2', 'all in one place.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- es
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('es', 'common', 'mb_page.hero_title', '"Necesitas-Saber"'),
       ('es', 'common', 'mb_page.hero_title_line2', 'todo en un solo lugar.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- it
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('it', 'common', 'mb_page.hero_title', '"Necessità-di-Sapere"'),
       ('it', 'common', 'mb_page.hero_title_line2', 'tutto in un unico posto.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- fr (proper guillemets with non-breaking spaces)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('fr', 'common', 'mb_page.hero_title', '« À-Savoir »'),
       ('fr', 'common', 'mb_page.hero_title_line2', 'tout au même endroit.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- de (fix broken quote escaping)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'mb_page.hero_title', '"Wissen-Müssen"'),
       ('de', 'common', 'mb_page.hero_title_line2', 'alles an einem Ort.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- sv
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('sv', 'common', 'mb_page.hero_title', '"Behöver-Veta"'),
       ('sv', 'common', 'mb_page.hero_title_line2', 'allt på ett ställe.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- fi
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('fi', 'common', 'mb_page.hero_title', '"Täytyy-Tietää"'),
       ('fi', 'common', 'mb_page.hero_title_line2', 'kaikki yhdessä paikassa.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ja (missing entirely — create with native corner brackets)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('ja', 'common', 'mb_page.hero_title', '「知っておくべきこと」'),
       ('ja', 'common', 'mb_page.hero_title_line2', 'すべて一か所に。')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
