# Phase 8.6 — RPC EXECUTE Grant Fix

**Date:** 2026-06-29
**Status:** COMPLETE — PASS

---

## Root Cause

`get_translations_for_locale(text)` was missing an EXECUTE grant for the `anon` and `authenticated` roles. The function was recreated during the Phase 8 database reconstruction (`consolidated_06_missing_views_and_rpc`) but the EXECUTE grant was not included in that migration.

Every browser-side translation fetch silently failed (PostgreSQL permission denied, swallowed by the React Query `retry: 3` loop). The RLS policy on `ui_translations` (`translations_public_read`, `TO public`) was correct — the failure was exclusively at the function-call level.

## Why It Became Visible Now

The `v8` cache bust (Phase 8.5) cleared the `cv_trans_en_v8` / `cv_trans_*_v8` localStorage keys, forcing every user to fetch fresh translations. Before the bust, users were served from the `v7` cache which was populated when the grant was still present. After the bust, the fresh fetch failed and `t(key)` fell back to returning the raw key string for every key.

## Symptoms

All three were the same failure:
- Nav bar link labels showing raw strings (`nav.dashboard`, `nav.observations`, etc.)
- Community banner not rendering (`community_banner.tagline_before`, `.cta`, `.tagline_after`)
- All other UI text showing raw key strings site-wide

## Fix Applied

**Migration:** `supabase/migrations/20260629100000_grant_execute_get_translations_rpc.sql`

```sql
GRANT EXECUTE ON FUNCTION get_translations_for_locale(text) TO anon, authenticated;
```

**Frontend:** `src/i18n/LocaleProvider.tsx`

Bumped `LS_TRANS_VERSION` from `'v8'` to `'v9'` to force a fresh fetch for users who loaded the broken `v8` state.

## Verification

Post-migration grant check confirmed `anon`, `authenticated`, `service_role`, `postgres`, and `PUBLIC` all have EXECUTE on the function.

Build: `npm run build` — PASS.

## Prevention

When recreating or replacing any RPC function used by the frontend:
1. Always include `GRANT EXECUTE ON FUNCTION <name> TO anon, authenticated` in the same migration
2. The original grant was in `20260414_create_get_translations_rpc.sql` — any reconstruction that recreates this function must replicate that grant

---

## Result

**PHASE 8.6 — PASS**
