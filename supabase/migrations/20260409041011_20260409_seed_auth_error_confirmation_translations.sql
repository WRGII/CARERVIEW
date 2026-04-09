/*
  # Seed auth_error confirmation translations

  ## Summary
  Adds three new i18n keys for the confirmation link expired flow on the auth error page:
  - auth_error.confirmation_title
  - auth_error.confirmation_body
  - auth_error.confirmation_resend_prompt

  These are needed because email clients (e.g. Yahoo Mail) sometimes pre-fetch confirmation links,
  expiring the OTP before the user clicks it. The error page now shows a targeted message with a
  "Resend confirmation email" form for this case.
*/

INSERT INTO ui_translations (locale, key, value)
VALUES
  ('en', 'auth_error.confirmation_title',        'Your confirmation link has expired'),
  ('en', 'auth_error.confirmation_body',         'Email confirmation links expire quickly and can only be used once. Some email providers scan links automatically, which can cause this. Enter your email below and we''ll send you a fresh one.'),
  ('en', 'auth_error.confirmation_resend_prompt','Resend your confirmation email'),

  ('es', 'auth_error.confirmation_title',        'Tu enlace de confirmación ha expirado'),
  ('es', 'auth_error.confirmation_body',         'Los enlaces de confirmación de correo expiran rápidamente y solo pueden usarse una vez. Algunos proveedores de correo escanean los enlaces automáticamente, lo que puede causar esto. Introduce tu correo a continuación y te enviaremos uno nuevo.'),
  ('es', 'auth_error.confirmation_resend_prompt','Reenviar tu correo de confirmación'),

  ('fr', 'auth_error.confirmation_title',        'Votre lien de confirmation a expiré'),
  ('fr', 'auth_error.confirmation_body',         'Les liens de confirmation par e-mail expirent rapidement et ne peuvent être utilisés qu''une seule fois. Certains fournisseurs de messagerie analysent les liens automatiquement, ce qui peut provoquer cela. Entrez votre e-mail ci-dessous et nous vous en enverrons un nouveau.'),
  ('fr', 'auth_error.confirmation_resend_prompt','Renvoyer votre e-mail de confirmation'),

  ('de', 'auth_error.confirmation_title',        'Ihr Bestätigungslink ist abgelaufen'),
  ('de', 'auth_error.confirmation_body',         'E-Mail-Bestätigungslinks laufen schnell ab und können nur einmal verwendet werden. Einige E-Mail-Anbieter scannen Links automatisch, was dies verursachen kann. Geben Sie Ihre E-Mail-Adresse unten ein und wir senden Ihnen einen neuen.'),
  ('de', 'auth_error.confirmation_resend_prompt','Bestätigungs-E-Mail erneut senden'),

  ('it', 'auth_error.confirmation_title',        'Il tuo link di conferma è scaduto'),
  ('it', 'auth_error.confirmation_body',         'I link di conferma e-mail scadono rapidamente e possono essere utilizzati solo una volta. Alcuni provider di posta elettronica scansionano i link automaticamente, il che può causare questo problema. Inserisci la tua email qui sotto e ti invieremo un nuovo link.'),
  ('it', 'auth_error.confirmation_resend_prompt','Invia nuovamente l''e-mail di conferma'),

  ('sv', 'auth_error.confirmation_title',        'Din bekräftelselänk har gått ut'),
  ('sv', 'auth_error.confirmation_body',         'E-postbekräftelselänkar löper ut snabbt och kan bara användas en gång. Vissa e-postleverantörer skannar länkar automatiskt, vilket kan orsaka detta. Ange din e-postadress nedan så skickar vi en ny.'),
  ('sv', 'auth_error.confirmation_resend_prompt','Skicka om ditt bekräftelsemail'),

  ('fi', 'auth_error.confirmation_title',        'Vahvistuslinkkisi on vanhentunut'),
  ('fi', 'auth_error.confirmation_body',         'Sähköpostin vahvistuslinkit vanhenevat nopeasti ja niitä voi käyttää vain kerran. Jotkut sähköpostipalvelut skannaavat linkit automaattisesti, mikä voi aiheuttaa tämän. Syötä sähköpostiosoitteesi alla niin lähetämme sinulle uuden.'),
  ('fi', 'auth_error.confirmation_resend_prompt','Lähetä vahvistussähköposti uudelleen')

ON CONFLICT (locale, key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();
