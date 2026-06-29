
INSERT INTO supported_locales (code, name, native_name, enabled, label, is_active, is_default, sort_order)
VALUES
  ('fr', 'French', 'Français', true, 'Français', true, false, 3),
  ('de', 'German', 'Deutsch', true, 'Deutsch', true, false, 4),
  ('it', 'Italian', 'Italiano', true, 'Italiano', true, false, 5),
  ('sv', 'Swedish', 'Svenska', true, 'Svenska', true, false, 6),
  ('fi', 'Finnish', 'Suomi', true, 'Suomi', true, false, 7)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  enabled = EXCLUDED.enabled,
  label = EXCLUDED.label,
  is_active = EXCLUDED.is_active;
