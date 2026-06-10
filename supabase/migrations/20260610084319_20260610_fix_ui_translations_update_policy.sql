-- CRITICAL: Restrict ui_translations UPDATE to admins only.
-- Previously "Authenticated users can update translations" allowed ANY logged-in caregiver
-- to overwrite UI strings across all locales — a content injection/defacement vector.

DROP POLICY IF EXISTS "Authenticated users can update translations" ON ui_translations;

CREATE POLICY "Admins can update translations" ON ui_translations
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
