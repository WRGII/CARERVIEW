/*
# Spanish translations: replace "capacidades" with "actividades de la vida diaria"

## Problem
Two Spanish (es) translation rows use the plural "capacidades" where the
intended concept is "activities of daily living" (ADLs). The user wants
these changed to "actividades de la vida diaria".

## Scope
Only two rows are affected:
  - about.body_p1        : "sus capacidades y necesidades" -> "sus actividades de la vida diaria y necesidades"
  - landing.hero_intro   : "registren capacidades diarias" -> "registren actividades de la vida diaria"
                           (note: the trailing "diarias" is dropped to avoid "diarias diarias")

Two other rows contain the substring "capacidad" but are NOT changed:
  - landing.testimonial_quote : "capacidad de independencia" (singular, different concept)
  - policy.data_s1_body       : "discapacidad" (disability, unrelated word)

## Approach
- INSERT ... ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value
- namespace = 'common' to match existing storage convention.
- Idempotent: safe to re-run.

## Security
- No schema or RLS changes. Data-only update to ui_translations.
*/

-- about.body_p1
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES (
  'es', 'common', 'about.body_p1',
  'Cuidar a alguien que amas nunca es sencillo, especialmente cuando sus actividades de la vida diaria y necesidades cambian de formas difíciles de predecir. Nuestra familia vivió esto de primera mano durante siete años de desafíos relacionados con la demencia de nuestra madre. Cada día traía algo diferente. Lo que aprendimos fue que una sola observación nunca contaba la historia completa. La verdadera comprensión solo llegó al ver los patrones a lo largo del tiempo y al asegurarnos de que todos los involucrados en su cuidado trabajaran con la misma imagen.'
)
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- landing.hero_intro
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES (
  'es', 'common', 'landing.hero_intro',
  'Una forma sencilla para que familias y cuidadores registren actividades de la vida diaria, detecten cambios y tomen mejores decisiones de cuidado.'
)
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
