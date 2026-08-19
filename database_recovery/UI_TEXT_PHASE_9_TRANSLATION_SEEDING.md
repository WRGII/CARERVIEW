# Phase 9 — Landing Page Translation Seeding

**Date:** 2026-06-29
**Status:** COMPLETE

## Background

After Phase 8.6 restored the `EXECUTE` grant on `get_translations_for_locale()` for the `anon` and `authenticated` roles, hero/pillar title keys loaded correctly. However, pillar subtitles/bullets, careplan, sustainability, newcarer, scenario, and second-testimonial content were absent from `ui_translations`. The original reconstruction migrations (trans_batch1–7) had not included this marketing content from the April 2026 legacy migrations.

## Migrations Applied

### Phase 9.1 — Pillar Subtitles and Bullets
**File:** `supabase/migrations/20260629101133_20260629_phase9_1_landing_pillar_subtitles_and_bullets.sql`

- **Namespace:** `landing`, bare key format
- **Locales:** EN, FR, DE, ES, IT, PT, SV, JA (JA uses EN fallback)
- **Keys (15 total):**
  - `pillar_plan_b1`, `pillar_plan_b2`, `pillar_plan_b3`
  - `pillar_coord_subtitle`, `pillar_coord_b1`, `pillar_coord_b2`, `pillar_coord_b3`
  - `pillar_obs_subtitle`, `pillar_obs_b1`, `pillar_obs_b2`, `pillar_obs_b3`
  - `pillar_review_subtitle`, `pillar_review_b1`, `pillar_review_b2`, `pillar_review_b3`
- **Rows seeded:** 120

### Phase 9.2a — Careplan, Sustainability, New Carer
**File:** `supabase/migrations/20260629101905_20260629_phase9_2a_landing_careplan_sustainability_newcarer.sql`

- **Namespace:** `landing`, bare key format
- **Locales:** EN, FR, DE, ES, IT, PT, SV, JA (JA uses EN fallback)
- **Careplan keys (31 — titles skipped as pre-existing):**
  - `careplan_subtitle`, `careplan_desc1`, `careplan_desc2`
  - `careplan_step1_title`–`careplan_step6_title`
  - `careplan_step1_desc`–`careplan_step6_desc`
  - `careplan_step1_icon`–`careplan_step6_icon`
  - `careplan_cta`
- **Sustainability keys (5 — title skipped):**
  - `sustainability_eyebrow`, `sustainability_subtitle`
  - `sustainability_point1`, `sustainability_point2`, `sustainability_point3`
- **New Carer keys (11 — title skipped):**
  - `newcarer_eyebrow`, `newcarer_subtitle`
  - `newcarer_step1_title`–`newcarer_step4_title`
  - `newcarer_step1_desc`–`newcarer_step4_desc`
- **Rows seeded:** ~376

> **Note:** `careplan_title`, `sustainability_title`, and `newcarer_title` already existed from an earlier reconstruction pass; `ON CONFLICT DO NOTHING` skips them safely. Also corrects a legacy typo `sustainability_eybrow` (missing 'r') present in the April 2026 migration file — the correct key `sustainability_eyebrow` is used here.

### Phase 9.2b — Testimonial 2 and Scenario Cards
**File:** `supabase/migrations/20260629102030_20260629_phase9_2b_landing_testimonial2_scenarios.sql`

- **Namespace:** `common`, dotted key format (matches existing testimonial pattern)
- **Locales:** EN, FR, DE, ES, IT, PT, SV, JA (JA uses EN fallback)
- **Testimonial2 keys (3):**
  - `landing.testimonial2_author`, `landing.testimonial2_role`, `landing.testimonial2_quote`
- **Scenario keys (8):**
  - `landing.scenario1_title`–`landing.scenario3_title`
  - `landing.scenario1_desc`–`landing.scenario3_desc`
  - `landing.scenarios_eyebrow`, `landing.scenarios_subtitle`
- **Additional fix:** `landing.testimonial_loc` missing IT, FR, DE rows — 3 rows added
- **Rows seeded:** ~91

## Cache Bust

**File:** `src/i18n/LocaleProvider.tsx`

```diff
-const LS_TRANS_VERSION = 'v9'
+const LS_TRANS_VERSION = 'v10'
```

This forces all users to invalidate their localStorage translation cache and fetch the newly seeded content on next page load. Without this change, users with a cached v9 state would continue to see missing text.

## Key Format Reference

The `get_translations_for_locale(text)` RPC normalises both formats to the same frontend key:

| Storage format | `namespace` | `key` | Resolved frontend key |
|---|---|---|---|
| Bare key | `landing` | `pillar_plan_b1` | `pillar_plan_b1` |
| Dotted key | `common` | `landing.scenario1_title` | `landing.scenario1_title` |

The RPC rule: if `key LIKE '%.%'` → return key as-is; else → return `namespace || '.' || key`.

## Deferred Items (Phase 3 — skipped by user)

- `mb_page` namespace: FI and SV locales have only ~19 rows vs ~122 expected
- `mb_page` namespace: JA locale has 0 rows
- These gaps do not affect the landing page but may cause missing text on the member/care-plan detail pages for FI, SV, and JA users
