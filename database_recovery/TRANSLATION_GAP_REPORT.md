# CarerView Translation Gap Report

**Date:** 2026-06-29  
**Scope:** Current state of `ui_translations` table across all active locales  
**Action required:** None at this time — see Deferred section below

---

## Active Locales

8 locales are active in `supported_locales`:

| Code | Language | Default |
|------|----------|---------|
| en | English | YES |
| es | Español | no |
| fr | Français | no |
| de | Deutsch | no |
| it | Italiano | no |
| sv | Svenska | no |
| fi | Suomi | no |
| ja | 日本語 | no |

---

## Translation Row Counts by Locale and Namespace

| Locale | Namespace | Keys |
|--------|-----------|------|
| en | common | 2,186 |
| en | new_carer | 330 |
| en | public.caregiver_resources | 37 |
| en | public.community | 14 |
| en | landing | 13 |
| en | nav | 3 |
| en | footer | 1 |
| **en TOTAL** | | **2,584** |
| es | common | 1,372 |
| es | landing | 13 |
| es | new_carer | 10 |
| es | nav | 2 |
| **es TOTAL** | | **1,397** |
| fi | common | 1,265 |
| fi | landing | 13 |
| fi | new_carer | 10 |
| fi | nav | 2 |
| **fi TOTAL** | | **1,290** |
| sv | common | 1,265 |
| sv | landing | 13 |
| sv | new_carer | 10 |
| sv | nav | 2 |
| **sv TOTAL** | | **1,290** |
| de | common | 872 |
| de | landing | 13 |
| de | new_carer | 10 |
| de | nav | 2 |
| **de TOTAL** | | **897** |
| fr | common | 872 |
| fr | landing | 13 |
| fr | new_carer | 10 |
| fr | nav | 2 |
| **fr TOTAL** | | **897** |
| it | common | 872 |
| it | landing | 13 |
| it | new_carer | 10 |
| it | nav | 2 |
| **it TOTAL** | | **897** |
| ja | common | 796 |
| **ja TOTAL** | | **796** |

---

## Coverage Summary

| Locale | Translated Keys | EN Baseline | Coverage | Fallback Keys |
|--------|----------------|-------------|----------|---------------|
| en | 2,584 | 2,584 | 100% | 0 |
| es | 1,397 | 2,584 | 54.1% | ~1,187 |
| fi | 1,290 | 2,584 | 49.9% | ~1,294 |
| sv | 1,290 | 2,584 | 49.9% | ~1,294 |
| de | 897 | 2,584 | 34.7% | ~1,687 |
| fr | 897 | 2,584 | 34.7% | ~1,687 |
| it | 897 | 2,584 | 34.7% | ~1,687 |
| ja | 796 | 2,584 | 30.8% | ~1,788 |

"Fallback Keys" = keys served in English to non-EN users because no native translation exists. These are served via the fallback chain in `LocaleProvider.tsx`:

```typescript
const raw = activeMap?.[key] ?? enMap?.[key] ?? key
```

No raw translation key strings are visible to any user in any locale.

---

## Namespace Coverage Gaps

The most notable gaps by namespace:

| Namespace | EN Keys | Non-EN Status |
|-----------|---------|---------------|
| `new_carer` | 330 | Only 10 keys translated in non-EN locales (3%) |
| `public.caregiver_resources` | 37 | Not translated in any non-EN locale |
| `public.community` | 14 | Not translated in any non-EN locale |
| `common` | 2,186 | Partial — ES leads at ~63%, JA at ~36% |
| `landing` | 13 | Fully translated in all 7 non-EN locales |
| `nav` | 3 | Partially translated (2 of 3 keys) in all non-EN locales |
| `footer` | 1 | Not translated in any non-EN locale |

---

## Translation Parity Priority Order

When translation parity work begins, prioritise in this order based on user impact:

### Priority 1 — Landing Page
- Namespace: `landing`
- Keys: 13 per locale
- Status: Already complete in all locales
- Action: Verify spot-check only

### Priority 2 — Pricing Page
- Keys in: `common` (pricing.* keys)
- Action: Audit and translate all `pricing.*` keys per locale

### Priority 3 — Authentication and Account Creation
- Keys in: `common` (auth.*, create_account.*, login.*, reset_password.* keys)
- Impact: All users hit these screens on first visit
- Action: Translate all auth flow keys per locale

### Priority 4 — Caregiver Dashboard
- Keys in: `common` (caregiver.*, dashboard.* keys)
- Impact: Core daily-use screen for paid users
- Action: Translate all caregiver dashboard keys per locale

### Priority 5 — New Observation Flow
- Keys in: `common` (obs.*, new_obs.*, obs_form.*, obs_edit.* keys)
- Impact: Core revenue-generating feature
- Action: Translate all observation flow keys per locale

### Priority 6 — Memory Book
- Keys in: `common` (mb.*, memory_book.* keys)
- Impact: Paid feature — team and subscriber users
- Action: Translate all memory book keys per locale

### Priority 7 — Care Plan
- Keys in: `common` (care_plan.*, care_hub.* keys)
- Impact: Paid feature
- Action: Translate all care plan keys per locale

### Priority 8 — New Carer Guide
- Namespace: `new_carer`
- Keys: 330
- Status: Only 10 keys translated in non-EN locales (3%)
- Impact: Public marketing/educational content
- Action: Full translation per locale

### Priority 9 — Community Public Hub
- Keys in: `common` (community.* keys) and `public.community`
- Impact: Public-facing community feature
- Action: Translate all community-related keys per locale

### Priority 10 — Admin Screens
- Keys in: `common` (admin.* keys)
- Impact: Internal only — lowest user impact
- Action: Can be deferred until all user-facing screens are complete

---

## How to Extract Keys for a Locale Gap Report

To get all EN keys not yet translated for a given locale, run:

```sql
SELECT t_en.key, t_en.namespace, t_en.value AS en_value
FROM ui_translations t_en
WHERE t_en.locale = 'en'
  AND NOT EXISTS (
    SELECT 1 FROM ui_translations t
    WHERE t.locale = 'de'  -- replace with target locale
      AND t.namespace = t_en.namespace
      AND t.key = t_en.key
  )
ORDER BY t_en.namespace, t_en.key;
```

Export this to CSV to provide to translators.

---

## Deferred Action

Translation parity work is deferred to a separate phase. No translation changes should be made during the current stabilisation and recovery snapshot phase.

When ready to begin translation parity work, start a new session with the translation gap report above as context.
