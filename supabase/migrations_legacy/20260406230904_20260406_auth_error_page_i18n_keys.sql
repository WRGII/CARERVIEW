/*
  # Add i18n keys for the Auth Error page

  ## Summary
  Inserts English translation strings for the new /auth/error page that shows
  a user-friendly message when a password-reset link (or other auth link) has
  expired or been consumed.

  ## New translation keys (namespace: auth_error)
  - auth_error.recovery_title        — headline for an expired recovery link
  - auth_error.recovery_body         — explanatory copy for expired recovery link
  - auth_error.resend_prompt         — sub-heading above the resend form
  - auth_error.email_label           — email field label
  - auth_error.resend_btn            — primary button text
  - auth_error.resend_sending        — button text while request is in-flight
  - auth_error.resend_failed         — inline error when resend API call fails
  - auth_error.resend_success_title  — success state heading
  - auth_error.resend_success_body   — success state body copy
  - auth_error.generic_title         — headline for non-recovery link errors
  - auth_error.generic_body          — body copy for non-recovery errors
  - auth_error.generic_help          — extra guidance for non-recovery errors
  - auth_error.back_home             — back-to-home link label

  ## Notes
  Uses ON CONFLICT DO NOTHING so re-running is safe.
  All other locales will fall back to English (handled by the app's i18n layer).
*/

INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'auth_error.recovery_title',       'Your password reset link has expired'),
  ('en', 'auth_error.recovery_body',        'Password reset links are single-use and expire after a short time. Enter your email below and we''ll send you a fresh one.'),
  ('en', 'auth_error.resend_prompt',        'Send a new reset link'),
  ('en', 'auth_error.email_label',          'Your email address'),
  ('en', 'auth_error.resend_btn',           'Send New Reset Link'),
  ('en', 'auth_error.resend_sending',       'Sending…'),
  ('en', 'auth_error.resend_failed',        'Something went wrong. Please try again.'),
  ('en', 'auth_error.resend_success_title', 'Check your inbox'),
  ('en', 'auth_error.resend_success_body',  'A new password reset link is on its way. It may take a minute to arrive — check your spam folder if you don''t see it.'),
  ('en', 'auth_error.generic_title',        'This link is no longer valid'),
  ('en', 'auth_error.generic_body',         'The link you followed has expired or has already been used.'),
  ('en', 'auth_error.generic_help',         'Return to the home page and sign in, or request a new link from the sign-in page.'),
  ('en', 'auth_error.back_home',            'Back to home')
ON CONFLICT (locale, key) DO NOTHING;
