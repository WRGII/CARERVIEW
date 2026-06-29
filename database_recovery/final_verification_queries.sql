-- CarerView Final Verification Queries
-- Run these after any database restore, migration reset, or schema change.
-- All queries are read-only and safe to run against production.

-- ============================================================
-- 1. ACTIVE LOCALES
-- ============================================================

SELECT code, label, is_active, is_default, sort_order
FROM supported_locales
ORDER BY sort_order;
-- Expected: 8 rows (en, es, fr, de, it, sv, fi, ja) all is_active = true


-- ============================================================
-- 2. TRANSLATION ROW COUNTS BY LOCALE
-- ============================================================

SELECT locale, COUNT(*) AS total_keys
FROM ui_translations
GROUP BY locale
ORDER BY locale;
-- Expected minimums (as of 2026-06-29 baseline):
-- en: 2584, es: 1397, fi: 1290, sv: 1290, de: 897, fr: 897, it: 897, ja: 796


-- ============================================================
-- 3. TRANSLATION COUNTS BY LOCALE AND NAMESPACE
-- ============================================================

SELECT locale, namespace, COUNT(*) AS keys
FROM ui_translations
GROUP BY locale, namespace
ORDER BY locale, namespace;


-- ============================================================
-- 4. MISSING KEYS BY LOCALE (compared to English baseline)
-- Locales with untranslated keys fall back to English in the app.
-- ============================================================

SELECT
  locales.locale,
  COUNT(*) AS missing_key_count
FROM (
  SELECT DISTINCT locale FROM ui_translations WHERE locale != 'en'
) locales
CROSS JOIN (
  SELECT DISTINCT namespace, key FROM ui_translations WHERE locale = 'en'
) en_keys
WHERE NOT EXISTS (
  SELECT 1 FROM ui_translations t
  WHERE t.locale = locales.locale
    AND t.namespace = en_keys.namespace
    AND t.key = en_keys.key
)
GROUP BY locales.locale
ORDER BY locales.locale;


-- ============================================================
-- 5. COVERAGE PERCENTAGE BY LOCALE
-- ============================================================

WITH en_count AS (
  SELECT COUNT(DISTINCT namespace || '.' || key) AS total FROM ui_translations WHERE locale = 'en'
),
locale_counts AS (
  SELECT locale, COUNT(DISTINCT namespace || '.' || key) AS translated
  FROM ui_translations
  WHERE locale != 'en'
  GROUP BY locale
)
SELECT
  lc.locale,
  lc.translated,
  ec.total AS en_baseline,
  ROUND(100.0 * lc.translated / ec.total, 1) AS coverage_pct
FROM locale_counts lc, en_count ec
ORDER BY coverage_pct DESC;


-- ============================================================
-- 6. TRANSLATION RPC RETURNS DATA
-- ============================================================

SELECT count(*)
FROM (SELECT jsonb_object_keys(get_translations_for_locale('en')::jsonb)) k;
-- Expected: ~2577

SELECT count(*)
FROM (SELECT jsonb_object_keys(get_translations_for_locale('ja')::jsonb)) k;
-- Expected: ~796


-- ============================================================
-- 7. CORE TABLES EXIST
-- ============================================================

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Confirm presence of: observations, responses, profiles, categories, questions,
-- legend, cv_team, cv_team_members, cv_plan_limits, ui_translations,
-- supported_locales, community_posts, community_rooms, community_replies,
-- community_reactions, community_profiles, community_reports,
-- memory_book_entries, care_plan_entries, care_plan_sections,
-- user_onboarding, team_invites, stripe_customers, user_subscriptions,
-- guest_tokens, rate_limit_log, webhook_events, email_audit_log


-- ============================================================
-- 8. REQUIRED VIEWS EXIST
-- ============================================================

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'v_category_questions',
    'cv_v_team_remaining',
    'v_plan_by_price',
    'community_posts_public'
  )
ORDER BY table_name;
-- Expected: 4 rows, all table_type = 'VIEW'


-- ============================================================
-- 9. REQUIRED FUNCTIONS / RPCS EXIST
-- ============================================================

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_translations_for_locale',
    'get_community_public_stats',
    'cv_create_invite',
    'cv_accept_invite',
    'cv_revoke_invite',
    'cv_peek_invite',
    'cv_list_members_with_profile',
    'cv_get_team_quota_remaining',
    'cv_get_solo_quota_remaining',
    'cv_email_registered',
    'mb_get_or_create',
    'check_rate_limit',
    'record_webhook_event'
  )
ORDER BY routine_name;
-- Expected: 13 rows


-- ============================================================
-- 10. RLS POLICY COUNTS PER TABLE
-- ============================================================

SELECT
  schemaname,
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;


-- ============================================================
-- 11. TABLES WITH RLS DISABLED (should only be cv_plan_limits)
-- ============================================================

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;
-- Expected: only cv_plan_limits


-- ============================================================
-- 12. ORPHANED / DROPPED TABLES — CONFIRM THESE DO NOT EXIST
-- ============================================================

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'observation_categories',  -- stale legacy name
    'rating_legend',           -- stale legacy name
    'stripe_orders',           -- dropped in cleanup migration
    'app_secrets'              -- dropped in cleanup migration
  );
-- Expected: 0 rows


-- ============================================================
-- 13. STALE SCHEMA APP NAMESPACE — CONFIRM NOT IN USE
-- ============================================================

SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'app';
-- Expected: 0 rows (no 'app' schema should exist)


-- ============================================================
-- 14. MIGRATION TRACKING — COUNT OF ACTIVE MIGRATIONS
-- ============================================================

SELECT
  COUNT(*) FILTER (WHERE version LIKE '20260629%') AS active_migrations,
  COUNT(*) FILTER (WHERE version NOT LIKE '20260629%') AS unexpected_old_migrations
FROM supabase_migrations.schema_migrations;
-- Expected: active_migrations = 65, unexpected_old_migrations = 0


-- ============================================================
-- 15. PLAN LIMITS — VERIFY STRIPE PRICE IDS ARE POPULATED
-- ============================================================

SELECT plan_name, stripe_price_id, team_quota_year, solo_quota_year, price_cents
FROM cv_plan_limits
ORDER BY price_cents;
-- Verify stripe_price_id values match live Stripe environment


-- ============================================================
-- 16. COMMUNITY ROOMS — VERIFY SEEDED AND ACTIVE
-- ============================================================

SELECT id, name, slug, is_active, sort_order
FROM community_rooms
ORDER BY sort_order;


-- ============================================================
-- 17. GET A SAMPLE OF EN KEYS NOT YET IN A GIVEN LOCALE
-- (Replace 'de' with target locale to audit gaps)
-- ============================================================

SELECT t_en.namespace, t_en.key, t_en.value AS en_value
FROM ui_translations t_en
WHERE t_en.locale = 'en'
  AND NOT EXISTS (
    SELECT 1 FROM ui_translations t
    WHERE t.locale = 'de'
      AND t.namespace = t_en.namespace
      AND t.key = t_en.key
  )
ORDER BY t_en.namespace, t_en.key
LIMIT 50;
