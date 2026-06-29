-- Seed English translation keys for the dedicated Sign In page and footer link.
-- Uses ON CONFLICT DO NOTHING so re-running is safe and won't overwrite admin edits.

INSERT INTO public.ui_translations (locale, namespace, key, value) VALUES
  ('en', 'common', 'auth.signin_heading',     'Welcome back'),
  ('en', 'common', 'auth.signin_sub',          'New to CarerView?'),
  ('en', 'common', 'auth.signin_description',  'Sign in to your CarerView account to manage care, track observations, and support your loved one.'),
  ('en', 'common', 'footer.sign_in_link',      'Sign In')
ON CONFLICT (locale, namespace, key) DO NOTHING;
