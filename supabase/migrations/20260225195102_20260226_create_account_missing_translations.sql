/*
  # Add missing create_account translation keys

  ## Summary
  Inserts 25 previously missing translation keys used by CreateAccountPage
  for both English (en) and Spanish (es) locales.

  ## Missing Keys Added
  - create_account.subtitle — page tagline
  - create_account.already_have — "Already have an account?" prompt
  - create_account.choose_plan — plan selection section heading
  - create_account.always_free — label for free plan pricing
  - create_account.per_quarter — billing period label
  - create_account.obs_free — free plan observation limit description
  - create_account.obs_primary — primary plan observation description
  - create_account.obs_family — family plan observation description
  - create_account.promo_label — promo code field label
  - create_account.promo_placeholder — promo code input placeholder
  - create_account.promo_prefix — "Promo:" badge prefix
  - create_account.section_title — account details section heading
  - create_account.selected_plan — "Selected plan:" label
  - create_account.name_label — full name field label
  - create_account.name_placeholder — full name input placeholder
  - create_account.password_placeholder — password input placeholder
  - create_account.agree_prefix — terms agreement prefix text
  - create_account.cancel_note — cancellation notice
  - create_account.submit_btn — form submit button text
  - create_account.confirm_email_info — email confirmation notice
  - create_account.email_required — validation error: email required
  - create_account.email_taken — error: email already registered
  - create_account.signup_failed — generic signup error
  - common.creating — loading state text for form submit
  - common.and — conjunction word

  ## Security
  No RLS changes — uses existing ui_translations table policies.

  ## Notes
  Uses ON CONFLICT DO NOTHING so it is safe to re-run and never
  overwrites manually edited values.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  -- English
  ('create_account.subtitle',           'en', 'Set up your account and start tracking today.'),
  ('create_account.already_have',       'en', 'Already have an account?'),
  ('create_account.choose_plan',        'en', 'Choose Your Plan'),
  ('create_account.always_free',        'en', 'Always free'),
  ('create_account.per_quarter',        'en', 'per quarter'),
  ('create_account.obs_free',           'en', 'Up to 10 observations per month'),
  ('create_account.obs_primary',        'en', 'Unlimited observations, 1 caregiver'),
  ('create_account.obs_family',         'en', 'Unlimited observations, up to 5 caregivers'),
  ('create_account.promo_label',        'en', 'Promo code'),
  ('create_account.promo_placeholder',  'en', 'Enter promo code'),
  ('create_account.promo_prefix',       'en', 'Promo:'),
  ('create_account.section_title',      'en', 'Your Account Details'),
  ('create_account.selected_plan',      'en', 'Selected plan:'),
  ('create_account.name_label',         'en', 'Full name'),
  ('create_account.name_placeholder',   'en', 'Your full name'),
  ('create_account.password_placeholder','en', 'Create a password'),
  ('create_account.agree_prefix',       'en', 'By creating an account you agree to our'),
  ('create_account.cancel_note',        'en', '. Cancel anytime.'),
  ('create_account.submit_btn',         'en', 'Create Account'),
  ('create_account.confirm_email_info', 'en', 'Check your email to confirm your account, then return here to complete checkout.'),
  ('create_account.email_required',     'en', 'Email and password are required.'),
  ('create_account.email_taken',        'en', 'An account with that email already exists. Please sign in.'),
  ('create_account.signup_failed',      'en', 'Sign-up failed. Please try again.'),
  ('common.creating',                   'en', 'Creating…'),
  ('common.and',                        'en', 'and'),

  -- Spanish
  ('create_account.subtitle',           'es', 'Configura tu cuenta y comienza a registrar hoy.'),
  ('create_account.already_have',       'es', '¿Ya tienes una cuenta?'),
  ('create_account.choose_plan',        'es', 'Elige tu Plan'),
  ('create_account.always_free',        'es', 'Siempre gratuito'),
  ('create_account.per_quarter',        'es', 'por trimestre'),
  ('create_account.obs_free',           'es', 'Hasta 10 observaciones por mes'),
  ('create_account.obs_primary',        'es', 'Observaciones ilimitadas, 1 cuidador'),
  ('create_account.obs_family',         'es', 'Observaciones ilimitadas, hasta 5 cuidadores'),
  ('create_account.promo_label',        'es', 'Código promocional'),
  ('create_account.promo_placeholder',  'es', 'Ingresa el código promocional'),
  ('create_account.promo_prefix',       'es', 'Promo:'),
  ('create_account.section_title',      'es', 'Detalles de tu Cuenta'),
  ('create_account.selected_plan',      'es', 'Plan seleccionado:'),
  ('create_account.name_label',         'es', 'Nombre completo'),
  ('create_account.name_placeholder',   'es', 'Tu nombre completo'),
  ('create_account.password_placeholder','es', 'Crea una contraseña'),
  ('create_account.agree_prefix',       'es', 'Al crear una cuenta aceptas nuestros'),
  ('create_account.cancel_note',        'es', '. Cancela en cualquier momento.'),
  ('create_account.submit_btn',         'es', 'Crear Cuenta'),
  ('create_account.confirm_email_info', 'es', 'Revisa tu correo para confirmar tu cuenta y luego regresa aquí para completar el pago.'),
  ('create_account.email_required',     'es', 'El correo electrónico y la contraseña son obligatorios.'),
  ('create_account.email_taken',        'es', 'Ya existe una cuenta con ese correo. Por favor inicia sesión.'),
  ('create_account.signup_failed',      'es', 'El registro falló. Por favor intenta de nuevo.'),
  ('common.creating',                   'es', 'Creando…'),
  ('common.and',                        'es', 'y')
ON CONFLICT (key, locale) DO NOTHING;
