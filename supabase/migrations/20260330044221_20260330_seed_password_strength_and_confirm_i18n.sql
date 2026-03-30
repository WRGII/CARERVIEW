/*
  # Seed i18n keys for password strength indicator and confirm password field

  ## Summary
  Adds translation keys for:
  - Password strength labels (weak, fair, strong)
  - Password rule hints (min length, number, uppercase)
  - Confirm password field label, placeholder, and mismatch error

  All keys are seeded for English (en) with the definitive values.
  Other locales default to the English value via the fallback system.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('auth.password_strength_weak',          'en', 'Weak'),
  ('auth.password_strength_fair',          'en', 'Fair'),
  ('auth.password_strength_strong',        'en', 'Strong'),
  ('auth.password_rule_min_length',        'en', 'Min 8 chars'),
  ('auth.password_rule_needs_number',      'en', 'Add a number'),
  ('auth.password_rule_needs_uppercase',   'en', 'Add uppercase'),
  ('create_account.confirm_password_label',       'en', 'Confirm Password'),
  ('create_account.confirm_password_placeholder', 'en', 'Re-enter your password'),
  ('create_account.passwords_mismatch',           'en', 'Passwords do not match.')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
