# Phase 8.5 — Targeted UI Text Gap Patch

**Date:** 2026-06-29
**Status:** COMPLETE — PASS

---

## Scope

This phase fixed 4 confirmed missing UI text key sets identified during the Phase 8.5 pre-flight verification. These keys caused raw key strings to render in the UI for all locales (EN included) because the `t()` fallback chain reached the last resort (the key name itself).

---

## Keys Patched

### 1. `landing.careplan_title`
- **Component:** `LandingPage.tsx` line 242 — care plan section `<h2>`
- **Locales seeded:** en, es, it, fr, de, sv, fi (recovered from original migration copy)
- **JA:** English fallback — native translation not found in any repo migration

| Locale | Value |
|--------|-------|
| en | Six sections that cover every dimension of care |
| es | Seis secciones que cubren cada dimensión del cuidado |
| it | Sei sezioni che coprono ogni dimensione dell'assistenza |
| fr | Six sections qui couvrent chaque dimension des soins |
| de | Sechs Abschnitte, die jede Dimension der Pflege abdecken |
| sv | Sex avsnitt som täcker varje dimension av vård |
| fi | Kuusi osiota, jotka kattavat jokaisen hoidon ulottuvuuden |
| ja | Six sections that cover every dimension of care *(EN fallback)* |

---

### 2. `landing.sustainability_title`
- **Component:** `LandingPage.tsx` line 343 — sustainability section `<h2>`
- **Locales seeded:** en, es, it, fr, de, sv, fi (recovered from original migration copy)
- **JA:** English fallback — native translation not found in any repo migration

| Locale | Value |
|--------|-------|
| en | A plan that doesn't account for the carer's limits is not a complete plan |
| es | Un plan que no tiene en cuenta los límites del cuidador no es un plan completo |
| it | Un piano che non tiene conto dei limiti del caregiver non è un piano completo |
| fr | Un plan qui ne tient pas compte des limites de l'aidant n'est pas un plan complet |
| de | Ein Plan, der die Grenzen der Pflegeperson nicht berücksichtigt, ist kein vollständiger Plan |
| sv | En plan som inte tar hänsyn till vårdarens gränser är inte en komplett plan |
| fi | Suunnitelma, joka ei ota huomioon hoitajan rajoja, ei ole täydellinen suunnitelma |
| ja | A plan that doesn't account for the carer's limits is not a complete plan *(EN fallback)* |

---

### 3. `landing.newcarer_title`
- **Component:** `LandingPage.tsx` line 499 — new carer section `<h2>`
- **Locales seeded:** en, es, it, fr, de, sv, fi (recovered from original migration copy)
- **JA:** English fallback — native translation not found in any repo migration

| Locale | Value |
|--------|-------|
| en | Start with our free Caregiver Guide |
| es | Comienza con nuestra guía gratuita para cuidadores |
| it | Inizia con la nostra guida gratuita per caregiver |
| fr | Commencez avec notre guide gratuit pour les aidants |
| de | Beginnen Sie mit unserem kostenlosen Leitfaden für Pflegepersonen |
| sv | Börja med vår kostnadsfria guide för vårdare |
| fi | Aloita ilmaisella hoitajan oppaallamme |
| ja | Start with our free Caregiver Guide *(EN fallback)* |

---

### 4. `community_banner.cta` — `ja` locale only
- **Component:** `CommunityBanner.tsx` — CTA button label
- **Other locales:** Already present, not modified
- **JA:** English fallback — native translation not found in any repo migration

| Locale | Value |
|--------|-------|
| ja | Free Carer Chat Room *(EN fallback)* |

---

## Migration Applied

**File:** `supabase/migrations/20260629070000_patch_missing_ui_text_keys.sql`

Uses `ON CONFLICT (locale, namespace, key) DO NOTHING` — idempotent, safe to re-run.

---

## Frontend Change

**File:** `src/i18n/LocaleProvider.tsx`

Bumped `LS_TRANS_VERSION` from `'v7'` to `'v8'` to bust cached translation maps in user browsers, forcing a fresh fetch that will now include the newly seeded keys.

---

## Verification

### DB check (post-migration)
All 25 rows confirmed present:
- `landing.careplan_title` — 8 rows (en, es, it, fr, de, sv, fi, ja)
- `landing.sustainability_title` — 8 rows (en, es, it, fr, de, sv, fi, ja)
- `landing.newcarer_title` — 8 rows (en, es, it, fr, de, sv, fi, ja)
- `community_banner.cta` for `ja` — 1 row

### Build
`npm run build` — PASS (TypeScript + Vite, no errors)

---

## Outstanding JA Translations

The following keys use English fallback for the `ja` locale and should be translated by a native Japanese speaker in a future pass:

- `landing.careplan_title`
- `landing.sustainability_title`
- `landing.newcarer_title`
- `community_banner.cta`

To update, run an INSERT with `ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value` for each JA entry.

---

## Result

**PHASE 8.5 — PASS**
