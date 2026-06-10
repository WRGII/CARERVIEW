-- Ensure the admin profile row exists for william.griffith@grifii.com
-- The auth.users row already exists (id: 93b616e0-057c-4d97-88e6-44adc167a7ed)
INSERT INTO public.profiles (id, email, display_name, role, disabled)
SELECT
  u.id,
  u.email,
  'Admin',
  'admin',
  false
FROM auth.users u
WHERE u.email = 'william.griffith@grifii.com'
ON CONFLICT (id) DO UPDATE
  SET role    = 'admin',
      disabled = false,
      email   = EXCLUDED.email;
