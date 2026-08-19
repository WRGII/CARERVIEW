-- CarerView Admin Promotion SQL Template
-- Use this after a real user has registered through the normal sign-up flow.
-- NEVER insert directly into auth.users.
-- Replace wrgii@yahoo.com with the actual email address.

UPDATE public.profiles
SET
  role       = 'admin',
  disabled   = false,
  updated_at = now()
WHERE email = 'wrgii@yahoo.com';

-- Verify the change
SELECT id, email, role, disabled, updated_at
FROM public.profiles
WHERE email = 'wrgii@yahoo.com';
