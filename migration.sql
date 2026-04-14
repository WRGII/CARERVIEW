-- ============================================================================
-- Migration: Update translation keys for "Why" messaging
-- ============================================================================
--
-- This migration updates two translation keys across 7 locales:
--
-- 1. nav.why_carerview - Navigation label for the "Why" section
--    Updated to: "Why your family needs Observations" (or locale equivalent)
--
-- 2. landing.cta_why - Call-to-action button text
--    Updated to: "Learn why Observations matter" (or locale equivalent)
--
-- These keys use different messaging to serve their specific purposes:
-- - nav.why_carerview is a navigation label
-- - landing.cta_why is a call-to-action prompt
--
-- Locales updated: en, es, fr, de, it, sv, fi
-- Table: ui_translations
-- Columns: key, locale, value, updated_at
--
-- ============================================================================

-- Update nav.why_carerview translations
UPDATE ui_translations
SET value = 'Why your family needs Observations', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'en';

UPDATE ui_translations
SET value = 'Por qué tu familia necesita Observaciones', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'es';

UPDATE ui_translations
SET value = 'Pourquoi votre famille a besoin d''Observations', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'fr';

UPDATE ui_translations
SET value = 'Warum Ihre Familie Beobachtungen braucht', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'de';

UPDATE ui_translations
SET value = 'Perché la tua famiglia ha bisogno di Osservazioni', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'it';

UPDATE ui_translations
SET value = 'Varför din familj behöver Observationer', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'sv';

UPDATE ui_translations
SET value = 'Miksi perheesi tarvitsee Havaintoja', updated_at = now()
WHERE key = 'nav.why_carerview' AND locale = 'fi';

-- Update landing.cta_why translations
UPDATE ui_translations
SET value = 'Learn why Observations matter', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'en';

UPDATE ui_translations
SET value = 'Descubre por qué importan las Observaciones', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'es';

UPDATE ui_translations
SET value = 'Découvrez pourquoi les Observations comptent', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'fr';

UPDATE ui_translations
SET value = 'Erfahren Sie, warum Beobachtungen wichtig sind', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'de';

UPDATE ui_translations
SET value = 'Scopri perché le Osservazioni contano', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'it';

UPDATE ui_translations
SET value = 'Läs varför Observationer är viktiga', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'sv';

UPDATE ui_translations
SET value = 'Lue miksi Havainnot ovat tärkeitä', updated_at = now()
WHERE key = 'landing.cta_why' AND locale = 'fi';
