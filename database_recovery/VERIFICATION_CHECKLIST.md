# CarerView Post-Restore Verification Checklist

Run through this checklist after any database restore, migration reset, or major schema change.

---

## 1. Migration Folder State

- [ ] `supabase/migrations/` contains exactly the expected number of active files (65 as of 2026-06-29)
- [ ] All files are prefixed `20260629_`
- [ ] No legacy pre-2026-06-29 files exist in `supabase/migrations/`
- [ ] `supabase/migrations_legacy/` contains the archived history (do not run these)
- [ ] Migration count in `supabase_migrations.schema_migrations` matches file count

```sql
SELECT count(*) FROM supabase_migrations.schema_migrations WHERE version LIKE '20260629%';
-- Expected: 65
```

---

## 2. Core Tables Exist

Run:
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Confirm these tables are present:

- [ ] `care_plan_entries`
- [ ] `care_plan_sections`
- [ ] `categories`
- [ ] `community_notifications`
- [ ] `community_posts`
- [ ] `community_profiles`
- [ ] `community_reactions`
- [ ] `community_replies`
- [ ] `community_reports`
- [ ] `community_rooms`
- [ ] `cv_plan_limits`
- [ ] `cv_team`
- [ ] `cv_team_members`
- [ ] `email_audit_log`
- [ ] `guest_tokens`
- [ ] `legend`
- [ ] `memory_book_entries`
- [ ] `observations`
- [ ] `profiles`
- [ ] `questions`
- [ ] `rate_limit_log`
- [ ] `responses`
- [ ] `stripe_customers`
- [ ] `supported_locales`
- [ ] `team_invites`
- [ ] `ui_translations`
- [ ] `user_onboarding`
- [ ] `user_subscriptions`
- [ ] `webhook_events`

---

## 3. Required Views Exist

Run:
```sql
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

Confirm these views are present:

- [ ] `community_posts_public`
- [ ] `cv_v_team_remaining`
- [ ] `v_category_questions`
- [ ] `v_plan_by_price`

---

## 4. Required RPCs / Functions Exist

Run:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

Confirm these functions are present:

- [ ] `check_rate_limit`
- [ ] `cv_accept_invite`
- [ ] `cv_create_invite`
- [ ] `cv_email_registered`
- [ ] `cv_get_solo_quota_remaining`
- [ ] `cv_get_team_quota_remaining`
- [ ] `cv_list_members_with_profile`
- [ ] `cv_peek_invite`
- [ ] `cv_revoke_invite`
- [ ] `get_community_public_stats`
- [ ] `get_translations_for_locale`
- [ ] `mb_get_or_create`
- [ ] `record_webhook_event`

---

## 5. RLS Enabled on User-Data Tables

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false
ORDER BY tablename;
```

Expected result: only `cv_plan_limits` (read-only config — intentional). All other tables must have RLS enabled.

- [ ] Only `cv_plan_limits` appears in this query result
- [ ] All user-data tables have `rowsecurity = true`

---

## 6. Supported Locales

```sql
SELECT code, label, is_active FROM supported_locales ORDER BY sort_order;
```

Expected 8 active locales:

- [ ] `en` — English
- [ ] `es` — Español
- [ ] `fr` — Français
- [ ] `de` — Deutsch
- [ ] `it` — Italiano
- [ ] `sv` — Svenska
- [ ] `fi` — Suomi
- [ ] `ja` — 日本語

---

## 7. `ui_translations` Is Populated

```sql
SELECT locale, COUNT(*) AS rows
FROM ui_translations
GROUP BY locale ORDER BY locale;
```

Expected minimum row counts (as of 2026-06-29 baseline):

- [ ] `en` ≥ 2,584
- [ ] `es` ≥ 1,397
- [ ] `fi` ≥ 1,290
- [ ] `sv` ≥ 1,290
- [ ] `de` ≥ 897
- [ ] `fr` ≥ 897
- [ ] `it` ≥ 897
- [ ] `ja` ≥ 796

---

## 8. Translation RPC Returns Data

```sql
SELECT count(*)
FROM (SELECT jsonb_object_keys(get_translations_for_locale('en')::jsonb)) k;
-- Expected: ~2,577
```

- [ ] EN RPC returns ≥ 2,500 keys
- [ ] JA RPC returns ≥ 700 keys: replace `'en'` with `'ja'` in the above query

---

## 9. Translation Fallback Is Working

The app uses a two-layer fallback in `LocaleProvider.tsx`:

```typescript
const raw = activeMap?.[key] ?? enMap?.[key] ?? key
```

- [ ] `LS_TRANS_VERSION` in `src/i18n/LocaleProvider.tsx` is set to `'v4'` (or higher)
- [ ] If any locale has < 100% coverage, English fallback prevents raw keys from surfacing
- [ ] Non-English users see English text for untranslated keys, never raw key strings

---

## 10. Build Passes

```
npm run build
```

- [ ] Build completes with zero errors
- [ ] All routes prerender successfully
- [ ] Output: `✓ built in ~18s` (timing may vary)

---

## 11. Key Screen Smoke Tests

Test these routes manually after deployment:

| Route | Check |
|-------|-------|
| `/` | Landing page loads, translations display correctly |
| `/pricing` | Pricing cards render with correct plan names and prices |
| `/create-account` | Sign-up form renders and submits |
| `/login` | Login form renders and authenticates |
| `/caregiver` | Dashboard loads for authenticated user |
| `/caregiver/observations/new` | Observation type selection renders |
| `/caregiver/observations/:id` | Observation form loads with questions |
| `/memory-book` (public) | Memory book landing page renders |
| `/caregiver-forum` | Community public hub renders |
| `/admin` | Admin login renders |

- [ ] All routes above load without errors
- [ ] No raw translation keys visible (no `obs.form.title` style strings visible in UI)
- [ ] Language switcher changes displayed language

---

## Checklist Complete

Once all items are checked, record the verification date and sign off:

**Verified by:** ___________________________  
**Date:** ___________________________  
**Build version:** ___________________________
