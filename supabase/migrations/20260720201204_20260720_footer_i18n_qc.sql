/*
# Footer i18n QC — fill missing button/link translations

## Summary
The Footer component uses 21 i18n keys (links, headings, copyright, locations,
sign-in link, etc.). A QC audit found 48 missing rows across non-English
locales — concentrated in de, fr, it, ja (each missing 11 keys), plus
footer.resources_heading missing in fi/sv and footer.sign_in_link missing in
es/fi/sv.

This migration seeds proper translations for every gap so all Footer buttons
and links render in the user's selected language across all 8 supported
locales (en, es, it, fr, de, sv, fi, ja).

## Keys covered
- footer.about_link, footer.pricing_link, footer.sign_in_link
- footer.resources_heading, footer.policies, footer.suggestions
- footer.contact (already present, not touched)
- footer.locations, footer.location_nz, footer.location_us
- footer.privacy_policy, footer.data_policy
- footer.copyright (already present, not touched)
- footer.tagline (already present, not touched)
- nav.* keys shared with Header (already QC'd, not touched here)

## Approach
- Uses INSERT ... ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value
  so existing rows are left untouched and missing rows are created.
- namespace = 'common' to match the existing storage convention.
- Idempotent: safe to re-run.

## Security
- No schema or RLS changes. Data-only seed into the existing ui_translations table.
*/

-- ===== MISSING rows (proper translations) =====

-- footer.about_link (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.about_link', 'Über CarerView'),
       ('fr', 'common', 'footer.about_link', 'À propos de CarerView'),
       ('it', 'common', 'footer.about_link', 'Informazioni su CarerView'),
       ('ja', 'common', 'footer.about_link', 'CarerViewについて')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.data_policy (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.data_policy', 'Datenschutzrichtlinie'),
       ('fr', 'common', 'footer.data_policy', 'Politique de données'),
       ('it', 'common', 'footer.data_policy', 'Informativa sui dati'),
       ('ja', 'common', 'footer.data_policy', 'データポリシー')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.location_nz (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.location_nz', 'Christchurch, Neuseeland'),
       ('fr', 'common', 'footer.location_nz', 'Christchurch, Nouvelle-Zélande'),
       ('it', 'common', 'footer.location_nz', 'Christchurch, Nuova Zelanda'),
       ('ja', 'common', 'footer.location_nz', 'クライストチャッチ、ニュージーランド')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.location_us (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.location_us', 'Denver, Colorado USA'),
       ('fr', 'common', 'footer.location_us', 'Denver, Colorado États-Unis'),
       ('it', 'common', 'footer.location_us', 'Denver, Colorado Stati Uniti'),
       ('ja', 'common', 'footer.location_us', 'デンバー、コロラド州 USA')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.locations (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.locations', 'Standorte:'),
       ('fr', 'common', 'footer.locations', 'Emplacements :'),
       ('it', 'common', 'footer.locations', 'Posizioni:'),
       ('ja', 'common', 'footer.locations', '所在地:')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.policies (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.policies', 'Richtlinien'),
       ('fr', 'common', 'footer.policies', 'Politiques'),
       ('it', 'common', 'footer.policies', 'Informative'),
       ('ja', 'common', 'footer.policies', 'ポリシー')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.pricing_link (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.pricing_link', 'Preise'),
       ('fr', 'common', 'footer.pricing_link', 'Tarifs'),
       ('it', 'common', 'footer.pricing_link', 'Prezzi'),
       ('ja', 'common', 'footer.pricing_link', '料金')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.privacy_policy (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.privacy_policy', 'Datenschutzrichtlinie'),
       ('fr', 'common', 'footer.privacy_policy', 'Politique de confidentialité'),
       ('it', 'common', 'footer.privacy_policy', 'Informativa sulla privacy'),
       ('ja', 'common', 'footer.privacy_policy', 'プライバシーポリシー')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.resources_heading (de, fi, fr, it, ja, sv)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.resources_heading', 'Ressourcen'),
       ('fi', 'common', 'footer.resources_heading', 'Resurssit'),
       ('fr', 'common', 'footer.resources_heading', 'Ressources'),
       ('it', 'common', 'footer.resources_heading', 'Risorse'),
       ('ja', 'common', 'footer.resources_heading', 'リソース'),
       ('sv', 'common', 'footer.resources_heading', 'Resurser')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.sign_in_link (de, es, fi, fr, it, ja, sv)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.sign_in_link', 'Anmelden'),
       ('es', 'common', 'footer.sign_in_link', 'Iniciar sesión'),
       ('fi', 'common', 'footer.sign_in_link', 'Kirjaudu sisään'),
       ('fr', 'common', 'footer.sign_in_link', 'Se connecter'),
       ('it', 'common', 'footer.sign_in_link', 'Accedi'),
       ('ja', 'common', 'footer.sign_in_link', 'サインイン'),
       ('sv', 'common', 'footer.sign_in_link', 'Logga in')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- footer.suggestions (de, fr, it, ja)
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES ('de', 'common', 'footer.suggestions', 'Vorschläge? Fragen?'),
       ('fr', 'common', 'footer.suggestions', 'Suggestions ? Questions ?'),
       ('it', 'common', 'footer.suggestions', 'Suggerimenti? Domande?'),
       ('ja', 'common', 'footer.suggestions', 'ご意見・ご質問')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
