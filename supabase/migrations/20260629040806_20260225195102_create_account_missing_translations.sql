/*
  # Add missing create_account translation keys
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  -- English
  ('create_account.subtitle',           'en', 'Set up your account and start tracking today.'),
  ('create_account.already_have',       'en', 'Already have an account?'),
  ('create_account.choose_plan',        'en', 'Choose Your Plan'),
  ('create_account.always_free',        'en', 'Always free'),
  ('create_account.per_quarter',        'en', 'per quarter'),
  ('create_account.section_title',      'en', 'Your Account Details'),
  ('create_account.selected_plan',      'en', 'Selected plan:'),
  ('create_account.name_label',         'en', 'Full name'),
  ('create_account.name_placeholder',   'en', 'Your full name'),
  ('create_account.agree_prefix',       'en', 'By creating an account you agree to our'),
  ('create_account.cancel_note',        'en', '. Cancel anytime.'),
  ('create_account.submit_btn',         'en', 'Create Account'),
  ('common.creating',                   'en', 'Creating…'),
  ('common.and',                        'en', 'and'),
  -- Spanish
  ('create_account.subtitle',           'es', 'Configura tu cuenta y comienza a registrar hoy.'),
  ('create_account.already_have',       'es', '¿Ya tienes una cuenta?'),
  ('create_account.choose_plan',        'es', 'Elige tu Plan'),
  ('create_account.always_free',        'es', 'Siempre gratuito'),
  ('create_account.per_quarter',        'es', 'por trimestre'),
  ('create_account.section_title',      'es', 'Detalles de tu Cuenta'),
  ('create_account.selected_plan',      'es', 'Plan seleccionado:'),
  ('create_account.name_label',         'es', 'Nombre completo'),
  ('create_account.name_placeholder',   'es', 'Tu nombre completo'),
  ('create_account.agree_prefix',       'es', 'Al crear una cuenta aceptas nuestros'),
  ('create_account.cancel_note',        'es', '. Cancela en cualquier momento.'),
  ('create_account.submit_btn',         'es', 'Crear Cuenta'),
  ('common.creating',                   'es', 'Creando…'),
  ('common.and',                        'es', 'y')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();