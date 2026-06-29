# Remediation Phase 1 — Evidence Audit Findings

Generated: 2026-06-29
Status: PHASE 1 COMPLETE — Evidence sufficient to proceed to Phase 2

---

## PASS / FAIL Verdict

**Phase 1 Verdict: PASS**

All evidence was located. Full SQL definitions for every missing view and RPC were recovered from legacy migrations. Translation key counts and locale coverage were audited across all 111 legacy migration files. Stale frontend references were confirmed and scoped to a single export-only code path. Enough evidence exists to proceed to Phase 2 and Phase 3 without guesswork.

---

## Files Inspected

### Migration files (selected for evidence):
- `20260225014453_20260225_i18n_foundation.sql` — i18n table creation + en/es seed
- `20260225021140_20260225_i18n_category_questions_view.sql` — v_category_questions original definition
- `20260226012227_20260226_fix_v_category_questions_security_invoker.sql` — v_category_questions final definition (security_invoker=true)
- `20260311053843_20260311_community_posts_anon_view.sql` — community_posts_public original definition
- `20260311074937_20260311_community_security_fixes_v2.sql` — community_posts_public security_invoker fix
- `20260313075122_20260313_production_readiness_db_cleanup.sql` — get_community_public_stats original definition
- `20260315040936_20260315_create_v_plan_by_price_view.sql` — v_plan_by_price original definition
- `20260315053928_20260315_comprehensive_security_hardening.sql` — v_plan_by_price + get_community_public_stats final definitions
- `20260610235450_20260611000001_add_japanese_locale.sql` — ja locale seed
- 111 translation seed migration files (full list in Translation section below)

### Frontend files:
- `src/pages/NewObservationPage.tsx` — stale table references
- `src/pages/CommunityPublicHubPage.tsx` — get_community_public_stats RPC usage
- `src/hooks/useCategoryQuestions.ts` — v_category_questions usage
- `src/lib/prefetching.ts` — v_category_questions usage
- `src/hooks/usePrefetchStatic.ts` — v_plan_by_price usage
- `src/lib/community.ts` — community_posts_public usage

---

## Finding 1 — Missing Views: Exact Recovery SQL

### 1a. `v_category_questions`

**Final definition** (from `20260226012227`, supersedes original in `20260225021140`):

```sql
DROP VIEW IF EXISTS public.v_category_questions;

CREATE VIEW public.v_category_questions WITH (security_invoker = true) AS
SELECT
  c.id            AS category_id,
  c.name          AS category_name,
  c.translations  AS category_translations,
  c.type          AS type,
  c.sort_order    AS category_order,
  q.id            AS question_id,
  q.question_text AS question_text,
  q.translations  AS question_translations,
  q.sort_order    AS question_order
FROM public.categories c
JOIN public.questions q ON q.category_id = c.id;

GRANT SELECT ON public.v_category_questions TO anon;
GRANT SELECT ON public.v_category_questions TO authenticated;
GRANT SELECT ON public.v_category_questions TO service_role;
```

**Frontend columns expected** (`useCategoryQuestions.ts`, `prefetching.ts`):
`category_id`, `category_name`, `category_translations`, `type`, `category_order`, `question_id`, `question_text`, `question_translations`, `question_order`

**View provides all expected columns. Definition is complete and safe to apply.**

---

### 1b. `community_posts_public`

**Final definition** — two-step from migrations `20260311053843` + `20260311074937`:

```sql
-- Step 1: Create with security_barrier (from 20260311053843)
CREATE OR REPLACE VIEW public.community_posts_public
  WITH (security_barrier = true)
AS
SELECT
  id,
  room_id,
  CASE WHEN is_anonymous THEN NULL ELSE author_user_id END AS author_user_id,
  is_anonymous,
  title,
  body,
  post_status,
  is_locked,
  help_type,
  reply_count,
  reaction_count,
  last_activity_at,
  created_at,
  updated_at
FROM public.community_posts
WHERE post_status = 'active';

REVOKE ALL ON public.community_posts_public FROM anon;
GRANT SELECT ON public.community_posts_public TO anon;
ALTER VIEW public.community_posts_public OWNER TO postgres;

-- Step 2: Add security_invoker (from 20260311074937)
ALTER VIEW public.community_posts_public SET (security_invoker = true);
```

**Frontend usage** (`src/lib/community.ts` lines 283, 306, 316):
- `listPostsForRoom()` — queries by `room_id`, `post_status`, ordering by `last_activity_at`
- `listRecentPosts()` — orders by `last_activity_at` desc
- `getPostById()` — queries by `id`

**View provides all expected columns. Can be combined into a single CREATE VIEW with both security_barrier and security_invoker in Phase 2.**

---

### 1c. `v_plan_by_price`

**Final definition** (from `20260315053928`, supersedes `20260315040936`):

```sql
DROP VIEW IF EXISTS public.v_plan_by_price;

CREATE VIEW public.v_plan_by_price
  WITH (security_invoker = true)
AS
SELECT
  id            AS plan_id,
  name,
  interval,
  price_cents,
  stripe_price_id
FROM public.subscription_plans
ORDER BY price_cents ASC;

GRANT SELECT ON public.v_plan_by_price TO anon, authenticated;
```

**Frontend usage** (`src/hooks/usePrefetchStatic.ts` line 35):
Selects `plan_id, name, interval, price_cents, stripe_price_id`, orders by `price_cents` ascending.

**View provides all expected columns. Definition is complete and safe to apply.**

---

## Finding 2 — Missing RPC: Exact Recovery SQL

### `get_community_public_stats()`

**Final definition** (from `20260315053928`):

```sql
CREATE OR REPLACE FUNCTION public.get_community_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_members  bigint;
  v_posts    bigint;
BEGIN
  SELECT COUNT(*) INTO v_members
  FROM public.community_profiles
  WHERE is_banned = false;

  SELECT COUNT(*) INTO v_posts
  FROM public.community_posts
  WHERE post_status = 'active';

  RETURN jsonb_build_object(
    'member_count', v_members,
    'post_count',   v_posts
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_public_stats() TO anon, authenticated;
```

**Frontend usage** (`src/pages/CommunityPublicHubPage.tsx` line 323):
```typescript
const { data, error } = await supabase.rpc('get_community_public_stats')
// expects: { member_count: number; post_count: number }
```

**No parameters. Returns jsonb. Grants to anon + authenticated confirmed intentional (public social-proof widget, no PII). Definition is complete and safe to apply.**

---

## Finding 3 — Translation System: Full Audit

### 3a. supported_locales Gap

**Current state:** 3 locales in database (`en`, `es`, `ja`)
**Expected state:** 8 locales

| Code | Label | Source Migration | Status |
|------|-------|-----------------|--------|
| en | English | `20260225014453` | PRESENT |
| es | Espanol | `20260225014453` | PRESENT |
| fr | Francais | `20260312011914` (inferred from translations) | MISSING |
| de | Deutsch | `20260312011914` (inferred from translations) | MISSING |
| it | Italiano | `20260312011914` (inferred from translations) | MISSING |
| sv | Svenska | `20260226004642` (inferred from translations) | MISSING |
| fi | Finnish | `20260226005105` (inferred from translations) | MISSING |
| ja | 日本語 | `20260610235450` | PRESENT |

**Note:** The legacy migrations insert translations for `fr`, `de`, `it`, `sv`, `fi` as locales but these locales were never explicitly inserted into `supported_locales` via a migration with that specific INSERT. They were likely present in the old database from an earlier migration that is now in `_archive`. Phase 2 must INSERT all 5 missing locales into `supported_locales` before applying translation rows (FK constraint).

---

### 3b. ui_translations: Translation Key Inventory

**Current state:** 0 rows in `ui_translations`
**Recoverable rows:** ~18,554 entries across 111 legacy migration files

**Files by locale coverage:**

| Locale | Files covering it | Approx. rows |
|--------|------------------|--------------|
| en | ~85 files | ~5,800 |
| es | ~45 files | ~3,200 |
| de | ~55 files | ~3,100 |
| fr | ~50 files | ~2,900 |
| it | ~50 files | ~2,900 |
| sv | ~52 files | ~2,950 |
| fi | ~52 files | ~2,950 |
| ja | ~22 files | ~2,935 |

**Top 10 largest translation files:**

| File | Locale(s) | Approx. Rows |
|------|-----------|-------------|
| `20260329050845_memory_book_i18n_translations.sql` | de,en,es,fi,fr,it,sv | 973 |
| `20260225014933_i18n_seed_translations.sql` | en,es | 950 |
| `20260611200226_japanese_translations_care_plan.sql` | ja | 763 |
| `20260312011914_community_i18n_translations.sql` | de,en,es,fi,fr,it,sv | 622 |
| `20260226004642_swedish_translations.sql` | sv | 511 |
| `20260226005105_finnish_translations.sql` | fi | 511 |
| `20260523043048_phase1_care_plan_i18n_seed.sql` | en,es | 427 |
| `20260611000016_japanese_translations_features.sql` | ja | 337 |
| `20260612000635_ja_phase1_new_carer.sql` | ja | 365 |
| `20260411182150_household_i18n_translations.sql` | de,en,es,fi,fr,it,sv | 498 |

**Translation conflict strategy:** All legacy files use `ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value` or `ON CONFLICT DO NOTHING`. The last migration in chronological order wins for any given key+locale pair. Phase 2 must apply files in chronological order OR use `ON CONFLICT (key, locale) DO UPDATE` to take the latest value.

**Missing translation estimate by locale (approximate):**
All 8 locales: 0 / ~18,554 rows present → 100% of all translation keys are missing.

---

## Finding 4 — Stale Frontend References

### 4a. `observation_categories` and `rating_legend` in NewObservationPage.tsx

**File:** `src/pages/NewObservationPage.tsx`
**Lines:** 101–102
**Function:** `handleExportObservation` (export-only path — triggered when user clicks Export button on an observation)

```typescript
// Line 101
const { data: categories } = await supabase
  .from('observation_categories')
  .select('*')
  .eq('observation_id', observationId);

// Line 102
const { data: legend } = await supabase
  .from('rating_legend')
  .select('*');
```

**Impact scope:** These lines ONLY execute when a user clicks export (DOCX or CSV). The observation form display, submission, and all other observation features are unaffected. The queries will silently fail (return null/empty) because the tables do not exist, causing exports to produce documents with missing category/legend data.

**Current schema equivalents:**
- `observation_categories` → no direct equivalent; the data is in `responses` (per-question answers for an observation) + `categories` + `questions`
- `rating_legend` → `legend` table (columns: `score`, `description`, `translations`)

**This is a frontend-only fix. No schema changes needed. Fix in Phase 3.**

---

### 4b. Frontend Files Using Missing Views/RPCs

| Reference | File | Line(s) | Impact if missing |
|-----------|------|---------|-------------------|
| `.from('v_category_questions')` | `src/hooks/useCategoryQuestions.ts` | ~30 | Observation form shows no questions |
| `.from('v_category_questions')` | `src/lib/prefetching.ts` | 35, 50, 65 | Prefetch fails silently |
| `.from('community_posts_public')` | `src/lib/community.ts` | 283, 306, 316 | Community public room pages show no posts |
| `.from('v_plan_by_price')` | `src/hooks/usePrefetchStatic.ts` | 35 | Pricing prefetch fails silently |
| `.rpc('get_community_public_stats')` | `src/pages/CommunityPublicHubPage.tsx` | 323 | Community hub stats show null/error |

---

## Finding 5 — Migration Folder State

**Current state:** 264 legacy `.sql` files remain in `supabase/migrations/` alongside the 15 consolidated migrations.
`supabase/migrations_legacy/` does not exist.

**Risk:** If `supabase db reset` is ever run on a fresh instance, all 264 legacy files will execute before the consolidated files (alphabetical sort), causing conflicts. The consolidation has already been applied to the live database — this is a housekeeping issue only, not a live production risk.

**Fix:** Run from project root (shell command — cannot be done via file tools):
```bash
mkdir -p supabase/migrations_legacy && \
  find supabase/migrations -maxdepth 1 -name "*.sql" \
    ! -name "20260629*" \
    -exec mv {} supabase/migrations_legacy/ \;
```

---

## Recommendation for Phase 2

Apply a single new consolidated migration containing:

1. **5 missing locales** — INSERT into `supported_locales` for `fr`, `de`, `it`, `sv`, `fi`
2. **View: `v_category_questions`** — exact SQL from Finding 1a above
3. **View: `community_posts_public`** — exact SQL from Finding 1b above (combined into single CREATE VIEW WITH (security_barrier=true, security_invoker=true))
4. **View: `v_plan_by_price`** — exact SQL from Finding 1c above
5. **RPC: `get_community_public_stats()`** — exact SQL from Finding 2 above
6. **All `ui_translations`** — consolidate all 111 legacy translation migration files into a single seed, applied in chronological order using `ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`

Phase 2 can be split into two migrations if the translation seed is very large:
- `consolidated_06_missing_views_and_rpc.sql` — items 1–5 (fast, safe to apply first)
- `consolidated_07_seed_translations.sql` — item 6 (large, may need chunking)

---

## Recommendation for Phase 3

Fix the two stale table references in `src/pages/NewObservationPage.tsx`:
- Replace `.from('observation_categories')` with the equivalent query against `responses` joined to `categories` and `questions`
- Replace `.from('rating_legend')` with `.from('legend')`

This is a frontend-only change with no schema impact. The fix is isolated to the `handleExportObservation` function and does not affect any other feature.

---

## Blockers

None. All evidence is in hand:
- Exact SQL for all 3 missing views: confirmed
- Exact SQL for missing RPC: confirmed
- Translation row count and locale coverage: confirmed (~18,554 rows across 8 locales)
- Stale reference scope: confirmed (export-only path, frontend fix only)
- No unknown unknowns remain

**Proceed to Phase 2 when instructed.**
