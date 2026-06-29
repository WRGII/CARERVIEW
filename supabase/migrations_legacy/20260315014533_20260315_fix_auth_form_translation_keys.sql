/*
  # Fix Auth Form Translation Keys

  ## Problem
  AuthForm.tsx uses different key names than what is seeded in ui_translations.
  This causes raw key strings to display in the UI instead of translated text.

  ## Changes
  Inserts the correct keys (as used in code) for all 7 locales: en, de, es, fi, fr, it, sv.

  ### Keys added (code name → mapped from existing DB value):
  - auth.create_account_tab  (was auth.tab_create)
  - auth.sign_in_tab         (was auth.tab_signin)
  - auth.signup_body         (was auth.signup_prompt)
  - auth.free_note           (was auth.free_disclaimer)
  - auth.invalid_credentials (was auth.err_invalid_creds)
  - auth.email_first         (was auth.err_email_first)
  - auth.password_too_short  (was auth.err_password_short)
  - auth.sending_reset       (was auth.reset_sending)
  - auth.signin_failed       (new — no prior key)
  - auth.failed              (new — no prior key)
  - auth.reset_failed        (new — no prior key)
*/

INSERT INTO ui_translations (locale, key, value)
VALUES
  -- auth.create_account_tab
  ('en', 'auth.create_account_tab', 'Create account'),
  ('de', 'auth.create_account_tab', 'Konto erstellen'),
  ('es', 'auth.create_account_tab', 'Crear cuenta'),
  ('fi', 'auth.create_account_tab', 'Luo tili'),
  ('fr', 'auth.create_account_tab', 'Créer un compte'),
  ('it', 'auth.create_account_tab', 'Crea account'),
  ('sv', 'auth.create_account_tab', 'Skapa konto'),

  -- auth.sign_in_tab
  ('en', 'auth.sign_in_tab', 'Sign in'),
  ('de', 'auth.sign_in_tab', 'Anmelden'),
  ('es', 'auth.sign_in_tab', 'Iniciar sesión'),
  ('fi', 'auth.sign_in_tab', 'Kirjaudu sisään'),
  ('fr', 'auth.sign_in_tab', 'Se connecter'),
  ('it', 'auth.sign_in_tab', 'Accedi'),
  ('sv', 'auth.sign_in_tab', 'Logga in'),

  -- auth.signup_body
  ('en', 'auth.signup_body', 'Choose your plan and set up your caregiver account — it only takes a minute.'),
  ('de', 'auth.signup_body', 'Wählen Sie Ihren Plan und richten Sie Ihr Pflegekonto ein – es dauert nur eine Minute.'),
  ('es', 'auth.signup_body', 'Elija su plan y configure su cuenta de cuidador — solo toma un minuto.'),
  ('fi', 'auth.signup_body', 'Valitse suunnitelmasi ja perusta hoitajatilisi – se vie vain minuutin.'),
  ('fr', 'auth.signup_body', 'Choisissez votre plan et configurez votre compte aidant — cela ne prend qu''une minute.'),
  ('it', 'auth.signup_body', 'Scegli il tuo piano e configura il tuo account caregiver — ci vuole solo un minuto.'),
  ('sv', 'auth.signup_body', 'Välj ditt abonnemang och skapa ditt vårdarkonto — det tar bara en minut.'),

  -- auth.free_note
  ('en', 'auth.free_note', 'Free plan available. No credit card required to try.'),
  ('de', 'auth.free_note', 'Kostenloser Plan verfügbar. Keine Kreditkarte erforderlich.'),
  ('es', 'auth.free_note', 'Plan gratuito disponible. No se requiere tarjeta de crédito.'),
  ('fi', 'auth.free_note', 'Ilmainen suunnitelma saatavilla. Ei vaadi luottokorttia.'),
  ('fr', 'auth.free_note', 'Plan gratuit disponible. Aucune carte de crédit requise.'),
  ('it', 'auth.free_note', 'Piano gratuito disponibile. Nessuna carta di credito richiesta.'),
  ('sv', 'auth.free_note', 'Gratis plan tillgänglig. Inget kreditkort krävs.'),

  -- auth.invalid_credentials
  ('en', 'auth.invalid_credentials', 'Incorrect email or password. Please check your credentials or try resetting your password.'),
  ('de', 'auth.invalid_credentials', 'Falsche E-Mail oder falsches Passwort. Bitte überprüfen Sie Ihre Anmeldedaten oder setzen Sie Ihr Passwort zurück.'),
  ('es', 'auth.invalid_credentials', 'Correo electrónico o contraseña incorrectos. Por favor verifique sus credenciales o restablezca su contraseña.'),
  ('fi', 'auth.invalid_credentials', 'Väärä sähköposti tai salasana. Tarkista tunnuksesi tai nollaa salasanasi.'),
  ('fr', 'auth.invalid_credentials', 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants ou réinitialiser votre mot de passe.'),
  ('it', 'auth.invalid_credentials', 'Email o password errata. Controlla le tue credenziali o reimposta la password.'),
  ('sv', 'auth.invalid_credentials', 'Fel e-post eller lösenord. Kontrollera dina uppgifter eller återställ ditt lösenord.'),

  -- auth.email_first
  ('en', 'auth.email_first', 'Enter your email address above first.'),
  ('de', 'auth.email_first', 'Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.'),
  ('es', 'auth.email_first', 'Primero ingrese su dirección de correo electrónico.'),
  ('fi', 'auth.email_first', 'Syötä ensin sähköpostiosoitteesi.'),
  ('fr', 'auth.email_first', 'Veuillez d''abord saisir votre adresse e-mail.'),
  ('it', 'auth.email_first', 'Inserisci prima il tuo indirizzo email.'),
  ('sv', 'auth.email_first', 'Ange din e-postadress ovan först.'),

  -- auth.password_too_short
  ('en', 'auth.password_too_short', 'Password must be at least 8 characters.'),
  ('de', 'auth.password_too_short', 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
  ('es', 'auth.password_too_short', 'La contraseña debe tener al menos 8 caracteres.'),
  ('fi', 'auth.password_too_short', 'Salasanan on oltava vähintään 8 merkkiä pitkä.'),
  ('fr', 'auth.password_too_short', 'Le mot de passe doit comporter au moins 8 caractères.'),
  ('it', 'auth.password_too_short', 'La password deve essere di almeno 8 caratteri.'),
  ('sv', 'auth.password_too_short', 'Lösenordet måste vara minst 8 tecken.'),

  -- auth.sending_reset
  ('en', 'auth.sending_reset', 'Sending…'),
  ('de', 'auth.sending_reset', 'Wird gesendet…'),
  ('es', 'auth.sending_reset', 'Enviando…'),
  ('fi', 'auth.sending_reset', 'Lähetetään…'),
  ('fr', 'auth.sending_reset', 'Envoi en cours…'),
  ('it', 'auth.sending_reset', 'Invio in corso…'),
  ('sv', 'auth.sending_reset', 'Skickar…'),

  -- auth.signin_failed
  ('en', 'auth.signin_failed', 'Sign in failed. Please try again.'),
  ('de', 'auth.signin_failed', 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'),
  ('es', 'auth.signin_failed', 'Error al iniciar sesión. Por favor, inténtelo de nuevo.'),
  ('fi', 'auth.signin_failed', 'Kirjautuminen epäonnistui. Yritä uudelleen.'),
  ('fr', 'auth.signin_failed', 'La connexion a échoué. Veuillez réessayer.'),
  ('it', 'auth.signin_failed', 'Accesso non riuscito. Per favore riprova.'),
  ('sv', 'auth.signin_failed', 'Inloggningen misslyckades. Försök igen.'),

  -- auth.failed
  ('en', 'auth.failed', 'Something went wrong. Please try again.'),
  ('de', 'auth.failed', 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.'),
  ('es', 'auth.failed', 'Algo salió mal. Por favor, inténtelo de nuevo.'),
  ('fi', 'auth.failed', 'Jokin meni pieleen. Yritä uudelleen.'),
  ('fr', 'auth.failed', 'Quelque chose s''est mal passé. Veuillez réessayer.'),
  ('it', 'auth.failed', 'Qualcosa è andato storto. Per favore riprova.'),
  ('sv', 'auth.failed', 'Något gick fel. Försök igen.'),

  -- auth.reset_failed
  ('en', 'auth.reset_failed', 'Failed to send reset email. Please try again.'),
  ('de', 'auth.reset_failed', 'Fehler beim Senden der Reset-E-Mail. Bitte versuchen Sie es erneut.'),
  ('es', 'auth.reset_failed', 'Error al enviar el correo de restablecimiento. Por favor, inténtelo de nuevo.'),
  ('fi', 'auth.reset_failed', 'Palautussähköpostin lähetys epäonnistui. Yritä uudelleen.'),
  ('fr', 'auth.reset_failed', 'Échec de l''envoi de l''e-mail de réinitialisation. Veuillez réessayer.'),
  ('it', 'auth.reset_failed', 'Invio dell''email di ripristino non riuscito. Per favore riprova.'),
  ('sv', 'auth.reset_failed', 'Det gick inte att skicka återställningsmejlet. Försök igen.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
