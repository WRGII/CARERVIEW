# CarerView Database Recovery Status

**Date of recovery:** 2026-06-29  
**Final status:** PASS

---

## Reason for Recovery

The original Supabase project became unavailable. The database had to be fully rebuilt from the accumulated migration history and source code. A new Supabase project was provisioned and a consolidated migration set was applied from scratch.

---

## What Was Rebuilt

| Component | Status |
|-----------|--------|
| Schema (tables, enums, extensions) | Rebuilt |
| Functions and RPCs | Rebuilt |
| Views | Rebuilt |
| RLS policies | Rebuilt |
| Indexes | Rebuilt |
| Grants | Rebuilt |
| Seed data (categories, questions, legend, plan limits, rooms) | Rebuilt |
| i18n translations (`ui_translations`) | Rebuilt — 9,320 rows across 8 locales |
| Supported locales | Rebuilt — 8 active locales |
| Legacy migrations | Archived to `supabase/migrations_legacy/` |

Auth users (real accounts) were NOT migrated — they must re-register through the app. Admin accounts must be promoted manually using the SQL template in `ADMIN_PROMOTION.sql`.

---

## Remediation Phases Completed

| Phase | Description | Result |
|-------|-------------|--------|
| 1 | Populate `ui_translations` (all locales, all legacy migration files re-applied with corrected ON CONFLICT clauses) | PASS |
| 2 | Restore 4 missing views (`v_category_questions`, `cv_v_team_remaining`, `v_plan_by_price`, `community_posts_public`) and `get_community_public_stats` RPC | PASS |
| 3 | Fix stale schema references in `NewObservationPage.tsx` (removed `observation_categories` and `rating_legend` table refs; replaced with correct nested join pattern) | PASS |
| 4 | Bump `LS_TRANS_VERSION` from `v3` to `v4` in `LocaleProvider.tsx` to invalidate stale localStorage caches | PASS |
| 5 | Archive 269 legacy migration files to `supabase/migrations_legacy/` | PASS |
| 6 | Final post-remediation verification — build, RLS, views, RPCs, translations, smoke tests | PASS |

---

## Active Migration Summary

- **Active folder:** `supabase/migrations/` — 65 files, all prefixed `20260629_`
- **Archived folder:** `supabase/migrations_legacy/` — 282 files (pre-2026-06-29 history)
- **Migration tracker:** 65 entries in `supabase_migrations.schema_migrations`

---

## Known Remaining Gap: Non-English Translation Coverage

Translation coverage is incomplete for all non-English locales. This is a pre-existing backlog — not introduced by the rebuild. English fallback (`enMap?.[key] ?? key`) in `LocaleProvider.tsx` prevents raw translation keys from ever surfacing to users in any locale.

| Locale | Rows | Coverage |
|--------|------|----------|
| en | 2,584 | 100% (baseline) |
| es | 1,397 | ~54% |
| fi | 1,290 | ~50% |
| sv | 1,290 | ~50% |
| de | 897 | ~35% |
| fr | 897 | ~35% |
| it | 897 | ~35% |
| ja | 796 | ~31% |

**Full translation parity is deferred to a separate later phase.** See `TRANSLATION_GAP_REPORT.md` for detailed coverage breakdown and prioritisation.

---

## Build Status

```
vite build && node prerender.mjs
✓ 1896 modules transformed
✓ built in ~18s
Pre-rendering complete (17 routes)
```

Zero compilation errors. Zero TypeScript errors. All routes prerendered successfully.

---

## System Lock Statement

As of 2026-06-29, the CarerView database rebuild and remediation is complete. The system is stable, building cleanly, and ready for continued feature development or a dedicated translation parity project. No further rebuild or remediation work is required at this time.
