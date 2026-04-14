/*
  # Create RPC function to fetch all translations for a locale

  1. New Functions
    - `get_translations_for_locale(p_locale text)` - Returns all translations
      for a given locale as a JSON object (key-value map)

  2. Purpose
    - PostgREST enforces a server-side `db_max_rows` limit (default 1000)
      that silently truncates results from REST queries, even when the
      client specifies a higher `.limit()`.
    - This RPC function bypasses that cap because Postgres functions
      return their full result set outside of PostgREST row limits.
    - With 1,300+ translation keys per locale, the REST endpoint was
      dropping keys beyond position 1000, causing missing translations
      on the landing page hero and elsewhere.

  3. Security
    - Uses SECURITY INVOKER so the caller's RLS policies still apply
    - Existing "Anyone can read translations" SELECT policy on
      ui_translations allows both anon and authenticated roles
    - Function is granted EXECUTE to anon and authenticated roles

  4. Important Notes
    - Returns a single JSON object: { "key1": "value1", "key2": "value2", ... }
    - Single network round-trip replaces paginated fetches
    - Stable function (same inputs always produce same outputs for a given DB state)
*/

CREATE OR REPLACE FUNCTION get_translations_for_locale(p_locale text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    json_object_agg(t.key, t.value),
    '{}'::json
  )
  FROM ui_translations t
  WHERE t.locale = p_locale;
$$;

GRANT EXECUTE ON FUNCTION get_translations_for_locale(text) TO anon, authenticated;
