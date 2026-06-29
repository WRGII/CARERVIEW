-- Fix: grant EXECUTE on get_translations_for_locale to anon and authenticated.
-- This function was recreated during the Phase 8 database reconstruction but the
-- EXECUTE grant was not included, causing every browser-side translation fetch
-- to fail with a permissions error. The RLS policy on ui_translations (public SELECT)
-- is correct; only the function-level grant was missing.
GRANT EXECUTE ON FUNCTION get_translations_for_locale(text) TO anon, authenticated;
