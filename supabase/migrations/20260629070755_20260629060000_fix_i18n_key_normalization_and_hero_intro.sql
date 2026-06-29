-- Phase 8.2: Fix RPC key normalization and insert missing landing.hero_intro
--
-- WHY: The RPC get_translations_for_locale uses json_object_agg(t.key, t.value)
-- which returns the raw key column value. Rows stored in old format have
-- namespace='landing', key='hero_title' — the RPC returns {"hero_title": "..."}
-- but the frontend looks up "landing.hero_title". This CASE expression normalizes
-- both formats to the dot-path the frontend expects.
-- DISTINCT ON handles rows where both formats coexist — prefer dot-key rows.

CREATE OR REPLACE FUNCTION public.get_translations_for_locale(p_locale text)
 RETURNS json
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
SELECT COALESCE(
  json_object_agg(normalized_key, value ORDER BY normalized_key),
  '{}'::json
)
FROM (
  SELECT DISTINCT ON (
    CASE WHEN key LIKE '%.%' THEN key ELSE namespace || '.' || key END
  )
    CASE WHEN key LIKE '%.%' THEN key ELSE namespace || '.' || key END AS normalized_key,
    value
  FROM ui_translations
  WHERE locale = p_locale
  ORDER BY
    CASE WHEN key LIKE '%.%' THEN key ELSE namespace || '.' || key END,
    -- prefer dot-key rows (key already contains dot) over bare-key rows
    (key LIKE '%.%') DESC
) sub;
$function$;

-- Re-grant execute permissions (preserve existing grants)
GRANT EXECUTE ON FUNCTION public.get_translations_for_locale(text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_translations_for_locale(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_translations_for_locale(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_translations_for_locale(text) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_translations_for_locale(text) TO service_role;

-- Insert missing landing.hero_intro for all active locales
-- Using dot-key format (namespace='common', key='landing.hero_intro') consistent with newer rows
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'landing.hero_intro',
   'A simple way for families and caregivers to record daily abilities, spot changes, and make better care decisions.'),
  ('es', 'common', 'landing.hero_intro',
   'Una forma sencilla para que familias y cuidadores registren capacidades diarias, detecten cambios y tomen mejores decisiones de cuidado.'),
  ('fr', 'common', 'landing.hero_intro',
   'Une façon simple pour les familles et les soignants d''enregistrer les capacités quotidiennes, repérer les changements et prendre de meilleures décisions de soins.'),
  ('de', 'common', 'landing.hero_intro',
   'Eine einfache Möglichkeit für Familien und Pflegepersonen, tägliche Fähigkeiten zu erfassen, Veränderungen zu erkennen und bessere Pflegeentscheidungen zu treffen.'),
  ('it', 'common', 'landing.hero_intro',
   'Un modo semplice per famiglie e caregiver di registrare le capacità quotidiane, individuare i cambiamenti e prendere decisioni di cura migliori.'),
  ('sv', 'common', 'landing.hero_intro',
   'Ett enkelt sätt för familjer och vårdare att registrera dagliga förmågor, upptäcka förändringar och fatta bättre vårdbeslut.'),
  ('fi', 'common', 'landing.hero_intro',
   'Yksinkertainen tapa perheille ja hoitajille kirjata päivittäisiä kykyjä, havaita muutoksia ja tehdä parempia hoitopäätöksiä.'),
  ('ja', 'common', 'landing.hero_intro',
   'ご家族や介護者が日々の能力を記録し、変化を把握して、より良いケアの決断ができるシンプルな方法。')
ON CONFLICT DO NOTHING;
