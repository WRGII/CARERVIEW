# Phase 8.1 — UI Translation Key Diagnosis

**Result: FAIL (root cause identified — fixable in Phase 8.2)**

---

## Root Cause Category: MIXED CAUSE

Two compounding issues explain why raw translation keys appear in the UI:

1. **RPC key-format mismatch (primary — affects 11 en keys, 54–56 per other locale)**
2. **localStorage stale-cache trap (secondary — can re-hide fixed keys after deploy)**

---

## 1. Database Schema

| Column       | Type    | Nullable |
|-------------|---------|----------|
| id          | uuid    | NO       |
| locale      | text    | NO       |
| namespace   | text    | NO       |
| key         | text    | NO       |
| value       | text    | NO       |
| created_at  | timestamptz | YES  |
| updated_at  | timestamptz | YES  |

**Format: namespace + key (separate columns)**

---

## 2. RPC `get_translations_for_locale` — Definition

```sql
CREATE OR REPLACE FUNCTION public.get_translations_for_locale(p_locale text)
 RETURNS json
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
SELECT COALESCE(
  json_object_agg(t.key, t.value),
  '{}'::json
)
FROM ui_translations t
WHERE t.locale = p_locale;
$function$
```

**Critical flaw:** Uses `t.key` only — **does NOT prepend `namespace`**.

- Frontend calls `t('landing.pillars_title')` → looks up `activeMap['landing.pillars_title']`
- RPC returns `{"pillars_title": "A complete system..."}` for OLD-format rows
- Frontend key lookup **fails** → raw key displayed

For NEW-format rows (`key = 'landing.pillars_title'`) the RPC works correctly because the key column already contains the full dot-path.

---

## 3. Locale Records

| code | label    | is_active | is_default | sort_order |
|------|----------|-----------|------------|------------|
| en   | English  | true      | true       | 1          |
| es   | Espanol  | true      | false      | 2          |
| fr   | Français | true      | false      | 3          |
| de   | Deutsch  | true      | false      | 4          |
| it   | Italiano | true      | false      | 5          |
| sv   | Svenska  | true      | false      | 6          |
| fi   | Suomi    | true      | false      | 7          |
| ja   | 日本語   | true      | false      | 8          |

All 8 locales active and correctly configured.

---

## 4. Translation Counts by Locale

| locale | bare-key rows (old) | dot-key rows (new) | total |
|--------|--------------------|--------------------|-------|
| de     | 68                 | 1150               | 1218  |
| en     | 395                | 2189               | 2584  |
| es     | 68                 | 1574               | 1642  |
| fi     | 68                 | 1438               | 1506  |
| fr     | 68                 | 1154               | 1222  |
| it     | 68                 | 1150               | 1218  |
| ja     | 46                 | 1170               | 1216  |
| sv     | 68                 | 1438               | 1506  |

**English has 395 bare-key rows** — far more than other locales because it received more legacy seeding.

---

## 5. Key Format Analysis

The DB contains TWO coexisting formats:

**OLD format** (bare key — invisible to frontend):
```
namespace='landing', key='hero_title'  → RPC returns {"hero_title": "..."}
                                          Frontend needs 'landing.hero_title' → MISS
```

**NEW format** (dot-key — works correctly):
```
namespace='common', key='landing.hero_title' → RPC returns {"landing.hero_title": "..."}
                                                 Frontend needs 'landing.hero_title' → HIT
```

Some logical keys have **BOTH formats** (old bare + new dot). These work because the dot-key row satisfies the frontend lookup.

Some keys have **ONLY old bare format** — these are the ones showing as raw keys.

---

## 6. Orphaned Bare-Key Rows (No Dot-Key Counterpart)

These are **fully invisible** to the frontend:

### English — 11 orphaned keys (all `landing` namespace):

| Expected frontend key       | Current bare key        | Value                                  |
|-----------------------------|------------------------|----------------------------------------|
| `landing.hero_cta_primary`  | `hero_cta_primary`     | Build your care plan                   |
| `landing.hero_cta_secondary`| `hero_cta_secondary`   | See how CarerView works                |
| `landing.hero_pillar_tagline`| `hero_pillar_tagline` | Plan · Coordinate · Observe · Improve  |
| `landing.pillar_coord_title`| `pillar_coord_title`   | Coordinate                             |
| `landing.pillar_obs_title`  | `pillar_obs_title`     | Observe                                |
| `landing.pillar_plan_subtitle`| `pillar_plan_subtitle`| Build the team's operating plan       |
| `landing.pillar_plan_title` | `pillar_plan_title`    | Plan                                   |
| `landing.pillar_review_title`| `pillar_review_title` | Update & Improve                       |
| `landing.pillars_body`      | `pillars_body`         | CarerView brings together...           |
| `landing.pillars_eyebrow`   | `pillars_eyebrow`      | The CarerView system                   |
| `landing.pillars_title`     | `pillars_title`        | A complete system for family caregiving|

**Note:** `landing.hero_intro` does not exist in ANY format.

### Other locales — ~54–56 orphaned bare-key rows each

---

## 7. Specific Keys From Bug Report — Status

| Reported raw key              | In DB? (dot-key format) | RPC returns it? |
|-------------------------------|------------------------|-----------------|
| `common.app_name`             | YES                    | YES — should work |
| `landing.hero_title`          | YES (dot-key exists)   | YES — should work |
| `landing.hero_intro`          | **NO** (any format)    | **MISSING** |
| `landing.pillars_title`       | **NO dot-key** (bare only) | **INVISIBLE** |
| `nav.sign_in`                 | YES                    | YES — should work |
| `nav.about`                   | YES                    | YES — should work |
| `nav.memory_book_short`       | YES                    | YES — should work |
| `nav.new_carer`               | YES (dot-key exists)   | YES — should work |
| `nav.caregiver_resources`     | YES (dot-key exists)   | YES — should work |
| `community_banner.cta`        | YES                    | YES — should work |

**Implication**: Keys like `common.app_name`, `nav.sign_in`, `landing.hero_title` SHOULD work from a pure DB perspective. The fact that they appear raw in the UI points to the secondary issue below.

---

## 8. RPC Grants

| Grantee       | Privilege |
|---------------|-----------|
| PUBLIC        | EXECUTE   |
| anon          | EXECUTE   |
| authenticated | EXECUTE   |
| postgres      | EXECUTE   |
| service_role  | EXECUTE   |

**RLS on `ui_translations`:** `translations_public_read` — `FOR SELECT TO public USING (true)`

No grant or RLS issue. RPC is fully callable.

---

## 9. Frontend Cache Issue (Secondary Root Cause)

**`LocaleProvider.tsx` — LS_TRANS_VERSION = `'v5'`**

```typescript
const LS_TRANS_VERSION = 'v5'
// cache key: cv_trans_en_v5

initialData: () => readBootstrapCache(locale),
initialDataUpdatedAt: () => (readBootstrapCache(locale) ? Date.now() : 0),
```

**The trap:**
- If a browser has ANY `cv_trans_en_v5` data in localStorage (from before the recent migration run), `initialDataUpdatedAt` returns `Date.now()`
- React Query treats this as "just fetched" — fresh within the 30-minute `staleTime`
- **No network fetch is made** — stale pre-migration data is served indefinitely

This explains why keys that DO exist in the DB (`common.app_name`, `nav.sign_in`, etc.) still show as raw in the UI. The cache was populated before those dot-key rows were seeded, and the v5 version string has not been bumped.

---

## 10. Summary of Root Causes

| # | Issue | Impact | Fix in 8.2 |
|---|-------|--------|------------|
| 1 | **localStorage cache version `v5` not bumped** — stale cache blocks fresh DB fetch | ALL keys show raw for any user who loaded the app before June 29 migrations | Bump `LS_TRANS_VERSION` to `v6` in `LocaleProvider.tsx` |
| 2 | **11 English `landing.*` keys stored as bare format** — no dot-key counterpart | `landing.pillars_title`, `landing.hero_cta_primary`, etc. invisible to RPC | Insert dot-key rows for these 11 keys (migration) |
| 3 | **54–56 orphaned bare-key rows per non-English locale** | Same keys invisible in all other locales | Same migration approach per locale |
| 4 | **`landing.hero_intro` completely absent** | Raw key on landing page | Insert new row |

---

## 11. Frontend Loading Logic Confirmation

- Frontend calls `supabase.rpc('get_translations_for_locale', { p_locale: locale })`
- Expects **flat dot-key JSON object**: `{ "common.app_name": "CarerView", "landing.hero_title": "..." }`
- Falls back to English for missing locale keys
- `t(key)` = `activeMap?.[key] ?? enMap?.[key] ?? key` (returns raw key as fallback)

---

## 12. Build Result

```
✓ built in 13.47s
```

**Build: PASS**

---

## Recommended Phase 8.2 Actions (in order)

### Step 1 — Bump cache version (frontend fix, no migration)
Change `LS_TRANS_VERSION = 'v5'` → `'v6'` in `src/i18n/LocaleProvider.tsx`.
This forces all browsers to discard stale caches and fetch fresh translations.

### Step 2 — Fix orphaned bare-key rows (migration)
For all locales, create dot-key versions of the 11 English `landing` orphans and the ~54–56 orphans in other locales. Two approaches:
- **Option A (preferred):** UPDATE the `key` column: `SET key = namespace || '.' || key WHERE key NOT LIKE '%.%'` — eliminates bare rows entirely
- **Option B:** INSERT new dot-key rows alongside existing bare rows — leaves duplicates but safe

Option A is cleaner; Option B is safer if other systems depend on bare keys.

### Step 3 — Insert `landing.hero_intro` (migration)
Seed English (and all locale translations) for the completely absent key.

### Step 4 — Verify with RPC test query
After migration: `SELECT get_translations_for_locale('en')` should contain all 11 fixed keys.

---

**STOP — awaiting Phase 8.2 approval.**
