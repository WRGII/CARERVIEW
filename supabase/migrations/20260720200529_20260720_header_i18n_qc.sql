/*
# Header i18n QC — fill missing and untranslated button/link keys

## Summary
The Header (desktop nav, mobile drawer), AccountMenu, and LanguageSwitcher
components use 20 i18n keys. A QC audit found:
- 15 keys missing entirely in 1–4 non-English locales (44 missing rows total).
- 2 keys present but still holding the English value in several locales
  (account_menu.manage_account in de/es/fi/fr/it/sv; nav.family_circle in fi/sv).

This migration seeds proper translations for every gap and fixes every
untranslated value, so all Header buttons and links render in the user's
selected language across all 8 supported locales (en, es, it, fr, de, sv, fi, ja).

## Keys covered
- nav.home_aria, common.app_name, nav.about, nav.why_carerview
- nav.memory_book_short, nav.new_carer, nav.caregiver_resources, nav.pricing
- nav.tutorial_short, nav.sign_in, nav.toggle_menu, nav.dashboard
- account_menu.manage_account, nav.family_circle, upgrade.menu_item
- billing.manage_btn, account_menu.restart_tutorial, nav.sign_out
- lang.switch_aria, lang.current

## Approach
- Uses INSERT ... ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value
  so existing rows are corrected and missing rows are created.
- namespace = 'common' to match the existing storage convention.
- Brand name "CarerView" is intentionally kept as-is in all locales.
- Idempotent: safe to re-run.

## Security
- No schema or RLS changes. Data-only seed into the existing ui_translations table.
*/

-- ===== MISSING rows (proper translations) =====

-- account_menu.manage_account (ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('ja', 'common', 'account_menu.manage_account', 'アカウント管理')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- account_menu.restart_tutorial (ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('ja', 'common', 'account_menu.restart_tutorial', 'チュートリアルを再開')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- billing.manage_btn (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'billing.manage_btn', 'Abrechnung verwalten'),
       ('fr', 'common', 'billing.manage_btn', 'Gérer la facturation'),
       ('it', 'common', 'billing.manage_btn', 'Gestisci fatturazione'),
       ('ja', 'common', 'billing.manage_btn', '請求を管理')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- common.app_name (de, fr, it) — brand name kept as-is
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'common.app_name', 'CarerView'),
       ('fr', 'common', 'common.app_name', 'CarerView'),
       ('it', 'common', 'common.app_name', 'CarerView')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- lang.current (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'lang.current', 'Sprache'),
       ('fr', 'common', 'lang.current', 'Langue'),
       ('it', 'common', 'lang.current', 'Lingua'),
       ('ja', 'common', 'lang.current', '言語')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- lang.switch_aria (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'lang.switch_aria', 'Sprache wechseln'),
       ('fr', 'common', 'lang.switch_aria', 'Changer de langue'),
       ('it', 'common', 'lang.switch_aria', 'Cambia lingua'),
       ('ja', 'common', 'lang.switch_aria', '言語を切り替え')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.about (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.about', 'Über uns'),
       ('fr', 'common', 'nav.about', 'À propos'),
       ('it', 'common', 'nav.about', 'Informazioni'),
       ('ja', 'common', 'nav.about', '私たちについて')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.caregiver_resources (ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('ja', 'common', 'nav.caregiver_resources', '介護者リソース')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.dashboard (de, fr, it)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.dashboard', 'Dashboard'),
       ('fr', 'common', 'nav.dashboard', 'Tableau de bord'),
       ('it', 'common', 'nav.dashboard', 'Cruscotto')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.family_circle (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.family_circle', 'Familienkreis'),
       ('fr', 'common', 'nav.family_circle', 'Cercle familial'),
       ('it', 'common', 'nav.family_circle', 'Cerchio familiare'),
       ('ja', 'common', 'nav.family_circle', 'ファミリーサークル')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.home_aria (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.home_aria', 'CarerView Startseite'),
       ('fr', 'common', 'nav.home_aria', 'Accueil CarerView'),
       ('it', 'common', 'nav.home_aria', 'Home CarerView'),
       ('ja', 'common', 'nav.home_aria', 'CarerViewホーム')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.sign_in (de, fr, it)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.sign_in', 'Anmelden'),
       ('fr', 'common', 'nav.sign_in', 'Se connecter'),
       ('it', 'common', 'nav.sign_in', 'Accedi')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.sign_out (de, fr, it)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.sign_out', 'Abmelden'),
       ('fr', 'common', 'nav.sign_out', 'Se déconnecter'),
       ('it', 'common', 'nav.sign_out', 'Esci')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.toggle_menu (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'nav.toggle_menu', 'Navigationsmenü umschalten'),
       ('fr', 'common', 'nav.toggle_menu', 'Basculer le menu de navigation'),
       ('it', 'common', 'nav.toggle_menu', 'Attiva/disattiva menu di navigazione'),
       ('ja', 'common', 'nav.toggle_menu', 'ナビゲーションメニューの切り替え')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.tutorial_short (ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('ja', 'common', 'nav.tutorial_short', 'チュートリアル')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ===== UNTRANSLATED values (row exists but value equals English) =====

-- account_menu.manage_account: de, es, fi, fr, it, sv (all show "Manage Account")
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'account_menu.manage_account', 'Konto verwalten'),
       ('es', 'common', 'account_menu.manage_account', 'Gestionar cuenta'),
       ('fi', 'common', 'account_menu.manage_account', 'Hallitse tiliä'),
       ('fr', 'common', 'account_menu.manage_account', 'Gérer le compte'),
       ('it', 'common', 'account_menu.manage_account', 'Gestisci account'),
       ('sv', 'common', 'account_menu.manage_account', 'Hantera konto')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- nav.family_circle: fi, sv (show "Family Circle")
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('fi', 'common', 'nav.family_circle', 'Perhepiiri'),
       ('sv', 'common', 'nav.family_circle', 'Familjecirkel')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
