/*
  # Seed Missing i18n Translations — All Non-English Locales

  ## Summary
  This migration adds 49 translation keys that existed in English but were entirely
  missing from all 6 non-English locales (es, it, fr, de, sv, fi).

  ## Affected Namespaces
  - `auth.*` — password strength labels and rule descriptions (6 keys)
  - `auth_error.*` — auth error page messages and resend prompts (13 keys)
  - `community.new_post.*` — community post creation form (10 keys)
  - `community.post.*` — post status notices (5 keys)
  - `community.profile.*` — community profile editor (8 keys)
  - `community.report.*` — report/moderation modal fields (4 keys)
  - `create_account.*` — confirm password field and mismatch error (3 keys)

  ## Important Notes
  1. Uses INSERT ... ON CONFLICT DO NOTHING to be fully safe/idempotent.
  2. Translations are professional quality using appropriate formal register for each language.
  3. No existing translations are modified.
*/

INSERT INTO ui_translations (key, locale, value) VALUES

-- ============================================================
-- auth.* — Password strength & rules
-- ============================================================
('auth.password_strength_weak',  'es', 'Débil'),
('auth.password_strength_weak',  'it', 'Debole'),
('auth.password_strength_weak',  'fr', 'Faible'),
('auth.password_strength_weak',  'de', 'Schwach'),
('auth.password_strength_weak',  'sv', 'Svagt'),
('auth.password_strength_weak',  'fi', 'Heikko'),

('auth.password_strength_fair',  'es', 'Aceptable'),
('auth.password_strength_fair',  'it', 'Accettabile'),
('auth.password_strength_fair',  'fr', 'Acceptable'),
('auth.password_strength_fair',  'de', 'Akzeptabel'),
('auth.password_strength_fair',  'sv', 'Godtagbart'),
('auth.password_strength_fair',  'fi', 'Hyväksyttävä'),

('auth.password_strength_strong', 'es', 'Segura'),
('auth.password_strength_strong', 'it', 'Sicura'),
('auth.password_strength_strong', 'fr', 'Solide'),
('auth.password_strength_strong', 'de', 'Stark'),
('auth.password_strength_strong', 'sv', 'Starkt'),
('auth.password_strength_strong', 'fi', 'Vahva'),

('auth.password_rule_min_length',       'es', 'Mín. 8 caracteres'),
('auth.password_rule_min_length',       'it', 'Min. 8 caratteri'),
('auth.password_rule_min_length',       'fr', 'Min. 8 caractères'),
('auth.password_rule_min_length',       'de', 'Min. 8 Zeichen'),
('auth.password_rule_min_length',       'sv', 'Min. 8 tecken'),
('auth.password_rule_min_length',       'fi', 'Väh. 8 merkkiä'),

('auth.password_rule_needs_number',     'es', 'Añade un número'),
('auth.password_rule_needs_number',     'it', 'Aggiungi un numero'),
('auth.password_rule_needs_number',     'fr', 'Ajoutez un chiffre'),
('auth.password_rule_needs_number',     'de', 'Zahl hinzufügen'),
('auth.password_rule_needs_number',     'sv', 'Lägg till en siffra'),
('auth.password_rule_needs_number',     'fi', 'Lisää numero'),

('auth.password_rule_needs_uppercase',  'es', 'Añade mayúscula'),
('auth.password_rule_needs_uppercase',  'it', 'Aggiungi maiuscola'),
('auth.password_rule_needs_uppercase',  'fr', 'Ajoutez une majuscule'),
('auth.password_rule_needs_uppercase',  'de', 'Großbuchstabe hinzufügen'),
('auth.password_rule_needs_uppercase',  'sv', 'Lägg till versal'),
('auth.password_rule_needs_uppercase',  'fi', 'Lisää isoja kirjaimia'),

-- ============================================================
-- auth_error.* — Auth error page
-- ============================================================
('auth_error.back_home',            'es', 'Volver al inicio'),
('auth_error.back_home',            'it', 'Torna alla pagina iniziale'),
('auth_error.back_home',            'fr', 'Retour à l''accueil'),
('auth_error.back_home',            'de', 'Zurück zur Startseite'),
('auth_error.back_home',            'sv', 'Tillbaka till start'),
('auth_error.back_home',            'fi', 'Takaisin etusivulle'),

('auth_error.email_label',          'es', 'Tu dirección de correo electrónico'),
('auth_error.email_label',          'it', 'Il tuo indirizzo email'),
('auth_error.email_label',          'fr', 'Votre adresse e-mail'),
('auth_error.email_label',          'de', 'Ihre E-Mail-Adresse'),
('auth_error.email_label',          'sv', 'Din e-postadress'),
('auth_error.email_label',          'fi', 'Sähköpostiosoitteesi'),

('auth_error.generic_body',         'es', 'El enlace que seguiste ha caducado o ya ha sido utilizado.'),
('auth_error.generic_body',         'it', 'Il link che hai seguito è scaduto o è già stato utilizzato.'),
('auth_error.generic_body',         'fr', 'Le lien que vous avez suivi a expiré ou a déjà été utilisé.'),
('auth_error.generic_body',         'de', 'Der Link, dem Sie gefolgt sind, ist abgelaufen oder wurde bereits verwendet.'),
('auth_error.generic_body',         'sv', 'Länken du följde har gått ut eller har redan använts.'),
('auth_error.generic_body',         'fi', 'Seuraamasi linkki on vanhentunut tai jo käytetty.'),

('auth_error.generic_help',         'es', 'Vuelve a la página de inicio e inicia sesión, o solicita un nuevo enlace desde la página de inicio de sesión.'),
('auth_error.generic_help',         'it', 'Torna alla pagina principale e accedi, oppure richiedi un nuovo link dalla pagina di accesso.'),
('auth_error.generic_help',         'fr', 'Retournez à la page d''accueil et connectez-vous, ou demandez un nouveau lien depuis la page de connexion.'),
('auth_error.generic_help',         'de', 'Kehren Sie zur Startseite zurück und melden Sie sich an, oder fordern Sie über die Anmeldeseite einen neuen Link an.'),
('auth_error.generic_help',         'sv', 'Gå tillbaka till startsidan och logga in, eller begär en ny länk från inloggningssidan.'),
('auth_error.generic_help',         'fi', 'Palaa etusivulle ja kirjaudu sisään, tai pyydä uusi linkki kirjautumissivulta.'),

('auth_error.generic_title',        'es', 'Este enlace ya no es válido'),
('auth_error.generic_title',        'it', 'Questo link non è più valido'),
('auth_error.generic_title',        'fr', 'Ce lien n''est plus valide'),
('auth_error.generic_title',        'de', 'Dieser Link ist nicht mehr gültig'),
('auth_error.generic_title',        'sv', 'Den här länken är inte längre giltig'),
('auth_error.generic_title',        'fi', 'Tämä linkki ei ole enää voimassa'),

('auth_error.recovery_body',        'es', 'Los enlaces para restablecer contraseña son de un solo uso y caducan rápidamente. Introduce tu correo electrónico a continuación y te enviaremos uno nuevo.'),
('auth_error.recovery_body',        'it', 'I link di recupero password sono monouso e scadono rapidamente. Inserisci la tua email qui sotto e ne invieremo uno nuovo.'),
('auth_error.recovery_body',        'fr', 'Les liens de réinitialisation de mot de passe sont à usage unique et expirent rapidement. Entrez votre adresse e-mail ci-dessous et nous vous en enverrons un nouveau.'),
('auth_error.recovery_body',        'de', 'Passwort-Reset-Links sind einmalig verwendbar und laufen schnell ab. Geben Sie Ihre E-Mail-Adresse unten ein und wir senden Ihnen einen neuen Link.'),
('auth_error.recovery_body',        'sv', 'Återställningslänkar för lösenord är engångslänkar och går ut snabbt. Ange din e-postadress nedan så skickar vi en ny.'),
('auth_error.recovery_body',        'fi', 'Salasanan palautuslinkit ovat kertakäyttöisiä ja vanhenevat nopeasti. Anna sähköpostiosoitteesi alla ja lähetämme sinulle uuden linkin.'),

('auth_error.recovery_title',       'es', 'Tu enlace de restablecimiento de contraseña ha caducado'),
('auth_error.recovery_title',       'it', 'Il tuo link per reimpostare la password è scaduto'),
('auth_error.recovery_title',       'fr', 'Votre lien de réinitialisation de mot de passe a expiré'),
('auth_error.recovery_title',       'de', 'Ihr Passwort-Reset-Link ist abgelaufen'),
('auth_error.recovery_title',       'sv', 'Din länk för lösenordsåterställning har gått ut'),
('auth_error.recovery_title',       'fi', 'Salasanan palautuslinkki on vanhentunut'),

('auth_error.resend_btn',           'es', 'Enviar nuevo enlace de restablecimiento'),
('auth_error.resend_btn',           'it', 'Invia nuovo link di reimpostazione'),
('auth_error.resend_btn',           'fr', 'Envoyer un nouveau lien de réinitialisation'),
('auth_error.resend_btn',           'de', 'Neuen Reset-Link senden'),
('auth_error.resend_btn',           'sv', 'Skicka ny återställningslänk'),
('auth_error.resend_btn',           'fi', 'Lähetä uusi palautuslinkki'),

('auth_error.resend_failed',        'es', 'Algo salió mal. Por favor, inténtalo de nuevo.'),
('auth_error.resend_failed',        'it', 'Qualcosa è andato storto. Per favore riprova.'),
('auth_error.resend_failed',        'fr', 'Quelque chose s''est mal passé. Veuillez réessayer.'),
('auth_error.resend_failed',        'de', 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.'),
('auth_error.resend_failed',        'sv', 'Något gick fel. Försök igen.'),
('auth_error.resend_failed',        'fi', 'Jokin meni pieleen. Yritä uudelleen.'),

('auth_error.resend_prompt',        'es', 'Enviar un nuevo enlace de restablecimiento'),
('auth_error.resend_prompt',        'it', 'Invia un nuovo link di reimpostazione'),
('auth_error.resend_prompt',        'fr', 'Envoyer un nouveau lien de réinitialisation'),
('auth_error.resend_prompt',        'de', 'Neuen Reset-Link anfordern'),
('auth_error.resend_prompt',        'sv', 'Skicka en ny återställningslänk'),
('auth_error.resend_prompt',        'fi', 'Lähetä uusi palautuslinkki'),

('auth_error.resend_sending',       'es', 'Enviando…'),
('auth_error.resend_sending',       'it', 'Invio in corso…'),
('auth_error.resend_sending',       'fr', 'Envoi en cours…'),
('auth_error.resend_sending',       'de', 'Wird gesendet…'),
('auth_error.resend_sending',       'sv', 'Skickar…'),
('auth_error.resend_sending',       'fi', 'Lähetetään…'),

('auth_error.resend_success_body',  'es', 'Hay un nuevo enlace de restablecimiento de contraseña en camino. Puede tardar un minuto en llegar — revisa tu carpeta de spam si no lo ves.'),
('auth_error.resend_success_body',  'it', 'Un nuovo link per reimpostare la password è in arrivo. Potrebbe impiegare un minuto — controlla la cartella spam se non lo vedi.'),
('auth_error.resend_success_body',  'fr', 'Un nouveau lien de réinitialisation de mot de passe est en route. Cela peut prendre une minute — vérifiez votre dossier spam si vous ne le voyez pas.'),
('auth_error.resend_success_body',  'de', 'Ein neuer Passwort-Reset-Link ist unterwegs. Es kann eine Minute dauern — überprüfen Sie Ihren Spam-Ordner, wenn Sie ihn nicht sehen.'),
('auth_error.resend_success_body',  'sv', 'En ny länk för lösenordsåterställning är på väg. Det kan ta en minut — kolla din skräppostmapp om du inte ser den.'),
('auth_error.resend_success_body',  'fi', 'Uusi salasanan palautuslinkki on matkalla. Se saattaa kestää minuutin — tarkista roskapostikansio jos et näe sitä.'),

('auth_error.resend_success_title', 'es', 'Revisa tu bandeja de entrada'),
('auth_error.resend_success_title', 'it', 'Controlla la tua casella di posta'),
('auth_error.resend_success_title', 'fr', 'Vérifiez votre boîte de réception'),
('auth_error.resend_success_title', 'de', 'Überprüfen Sie Ihren Posteingang'),
('auth_error.resend_success_title', 'sv', 'Kolla din inkorg'),
('auth_error.resend_success_title', 'fi', 'Tarkista postilaatikkosi'),

-- ============================================================
-- community.new_post.* — New post form
-- ============================================================
('community.new_post.anonymous_active_desc',    'es', 'Tu nombre de usuario no se mostrará a otros usuarios. Tu identidad sigue registrada internamente para moderación.'),
('community.new_post.anonymous_active_desc',    'it', 'Il tuo nome utente non sarà mostrato agli altri utenti. La tua identità è comunque registrata internamente per la moderazione.'),
('community.new_post.anonymous_active_desc',    'fr', 'Votre pseudonyme ne sera pas affiché aux autres utilisateurs. Votre identité est toujours enregistrée en interne à des fins de modération.'),
('community.new_post.anonymous_active_desc',    'de', 'Ihr Benutzername wird anderen Nutzern nicht angezeigt. Ihre Identität wird intern zur Moderation erfasst.'),
('community.new_post.anonymous_active_desc',    'sv', 'Ditt användarnamn visas inte för andra användare. Din identitet registreras ändå internt för moderering.'),
('community.new_post.anonymous_active_desc',    'fi', 'Käyttäjätunnustasi ei näytetä muille käyttäjille. Henkilöllisyytesi tallennetaan sisäisesti moderointia varten.'),

('community.new_post.anonymous_active_label',   'es', 'Publicando de forma anónima'),
('community.new_post.anonymous_active_label',   'it', 'Pubblicazione in forma anonima'),
('community.new_post.anonymous_active_label',   'fr', 'Publication de façon anonyme'),
('community.new_post.anonymous_active_label',   'de', 'Anonym veröffentlichen'),
('community.new_post.anonymous_active_label',   'sv', 'Publicerar anonymt'),
('community.new_post.anonymous_active_label',   'fi', 'Julkaistaan nimettömästi'),

('community.new_post.anonymous_desc',           'es', 'Se mostrará tu nombre de usuario. Actívalo para ocultarlo a otros usuarios.'),
('community.new_post.anonymous_desc',           'it', 'Verrà mostrato il tuo nome utente. Attivalo per nasconderlo agli altri utenti.'),
('community.new_post.anonymous_desc',           'fr', 'Votre pseudonyme sera affiché. Activez-le pour le masquer aux autres utilisateurs.'),
('community.new_post.anonymous_desc',           'de', 'Ihr Benutzername wird angezeigt. Schalten Sie es ein, um ihn vor anderen Nutzern zu verbergen.'),
('community.new_post.anonymous_desc',           'sv', 'Ditt användarnamn visas. Slå på det för att dölja det för andra användare.'),
('community.new_post.anonymous_desc',           'fi', 'Käyttäjätunnuksesi näytetään. Kytke päälle piilottaaksesi sen muilta käyttäjiltä.'),

('community.new_post.anonymous_label',          'es', 'Publicar de forma anónima'),
('community.new_post.anonymous_label',          'it', 'Pubblica in forma anonima'),
('community.new_post.anonymous_label',          'fr', 'Publier de façon anonyme'),
('community.new_post.anonymous_label',          'de', 'Anonym veröffentlichen'),
('community.new_post.anonymous_label',          'sv', 'Posta anonymt'),
('community.new_post.anonymous_label',          'fi', 'Julkaise nimettömästi'),

('community.new_post.body_label',               'es', 'Tu publicación'),
('community.new_post.body_label',               'it', 'Il tuo post'),
('community.new_post.body_label',               'fr', 'Votre message'),
('community.new_post.body_label',               'de', 'Ihr Beitrag'),
('community.new_post.body_label',               'sv', 'Ditt inlägg'),
('community.new_post.body_label',               'fi', 'Viestisi'),

('community.new_post.body_placeholder',         'es', 'Comparte tu experiencia, pregunta o reflexión. Recuerda: no incluyas datos identificativos sobre la persona a tu cargo.'),
('community.new_post.body_placeholder',         'it', 'Condividi la tua esperienza, domanda o riflessione. Ricorda: non includere dettagli identificativi sulla persona che assisti.'),
('community.new_post.body_placeholder',         'fr', 'Partagez votre expérience, question ou réflexion. N''oubliez pas : ne partagez pas de détails permettant d''identifier la personne dont vous vous occupez.'),
('community.new_post.body_placeholder',         'de', 'Teilen Sie Ihre Erfahrung, Frage oder Gedanken. Denken Sie daran: Keine identifizierenden Details über die betreute Person angeben.'),
('community.new_post.body_placeholder',         'sv', 'Dela din erfarenhet, fråga eller tankar. Kom ihåg: inkludera inga identifierande uppgifter om personen du vårdar.'),
('community.new_post.body_placeholder',         'fi', 'Jaa kokemuksesi, kysymyksesi tai ajatuksesi. Muista: älä sisällytä tunnistavia tietoja hoidettavasta henkilöstä.'),

('community.new_post.posting_in',               'es', 'Publicando en'),
('community.new_post.posting_in',               'it', 'Pubblicazione in'),
('community.new_post.posting_in',               'fr', 'Publication dans'),
('community.new_post.posting_in',               'de', 'Veröffentlichen in'),
('community.new_post.posting_in',               'sv', 'Publicerar i'),
('community.new_post.posting_in',               'fi', 'Julkaistaan kohteessa'),

('community.new_post.posting_restricted',       'es', 'Publicación restringida'),
('community.new_post.posting_restricted',       'it', 'Pubblicazione limitata'),
('community.new_post.posting_restricted',       'fr', 'Publication restreinte'),
('community.new_post.posting_restricted',       'de', 'Veröffentlichung eingeschränkt'),
('community.new_post.posting_restricted',       'sv', 'Publicering begränsad'),
('community.new_post.posting_restricted',       'fi', 'Julkaiseminen rajoitettu'),

('community.new_post.posting_restricted_desc',  'es', 'Tu cuenta ha sido restringida de publicar en la comunidad. Si crees que es un error, contacta con soporte.'),
('community.new_post.posting_restricted_desc',  'it', 'Il tuo account è stato limitato dalla pubblicazione nella community. Se ritieni che sia un errore, contatta il supporto.'),
('community.new_post.posting_restricted_desc',  'fr', 'Votre compte a été restreint dans la communauté. Si vous pensez qu''il s''agit d''une erreur, veuillez contacter le support.'),
('community.new_post.posting_restricted_desc',  'de', 'Ihr Konto wurde vom Posten in der Community eingeschränkt. Wenn Sie glauben, dass dies ein Fehler ist, wenden Sie sich an den Support.'),
('community.new_post.posting_restricted_desc',  'sv', 'Ditt konto har begränsats från att posta i communityn. Om du tror att detta är ett misstag, kontakta support.'),
('community.new_post.posting_restricted_desc',  'fi', 'Tilisi on rajoitettu julkaisemasta yhteisössä. Jos uskot tämän olevan virhe, ota yhteyttä tukeen.'),

('community.new_post.title_label',              'es', 'Título'),
('community.new_post.title_label',              'it', 'Titolo'),
('community.new_post.title_label',              'fr', 'Titre'),
('community.new_post.title_label',              'de', 'Titel'),
('community.new_post.title_label',              'sv', 'Titel'),
('community.new_post.title_label',              'fi', 'Otsikko'),

('community.new_post.title_placeholder',        'es', '¿Cuál es tu pregunta o tema?'),
('community.new_post.title_placeholder',        'it', 'Qual è la tua domanda o argomento?'),
('community.new_post.title_placeholder',        'fr', 'Quelle est votre question ou votre sujet?'),
('community.new_post.title_placeholder',        'de', 'Was ist Ihre Frage oder Ihr Thema?'),
('community.new_post.title_placeholder',        'sv', 'Vad är din fråga eller ditt ämne?'),
('community.new_post.title_placeholder',        'fi', 'Mikä on kysymyksesi tai aiheesi?'),

-- ============================================================
-- community.post.* — Post status notices
-- ============================================================
('community.post.first_reply',     'es', 'Primera respuesta'),
('community.post.first_reply',     'it', 'Prima risposta'),
('community.post.first_reply',     'fr', 'Première réponse'),
('community.post.first_reply',     'de', 'Erste Antwort'),
('community.post.first_reply',     'sv', 'Första svaret'),
('community.post.first_reply',     'fi', 'Ensimmäinen vastaus'),

('community.post.hidden_notice',   'es', 'Tu publicación está actualmente oculta por un moderador y no es visible para otros miembros.'),
('community.post.hidden_notice',   'it', 'Il tuo post è attualmente nascosto da un moderatore e non è visibile agli altri membri.'),
('community.post.hidden_notice',   'fr', 'Votre publication est actuellement masquée par un modérateur et n''est pas visible par les autres membres.'),
('community.post.hidden_notice',   'de', 'Ihr Beitrag wurde von einem Moderator ausgeblendet und ist für andere Mitglieder nicht sichtbar.'),
('community.post.hidden_notice',   'sv', 'Ditt inlägg är för närvarande dolt av en moderator och syns inte för andra medlemmar.'),
('community.post.hidden_notice',   'fi', 'Moderaattori on piilottanut julkaisusi, eikä se näy muille jäsenille.'),

('community.post.removed_body',    'es', 'Esta publicación ha sido eliminada y ya no es visible para la comunidad.'),
('community.post.removed_body',    'it', 'Questo post è stato rimosso e non è più visibile alla community.'),
('community.post.removed_body',    'fr', 'Cette publication a été supprimée et n''est plus visible dans la communauté.'),
('community.post.removed_body',    'de', 'Dieser Beitrag wurde entfernt und ist in der Community nicht mehr sichtbar.'),
('community.post.removed_body',    'sv', 'Det här inlägget har tagits bort och är inte längre synligt för communityn.'),
('community.post.removed_body',    'fi', 'Tämä julkaisu on poistettu eikä ole enää näkyvissä yhteisölle.'),

('community.post.removed_notice',  'es', 'Tu publicación ha sido eliminada por un moderador y ya no es visible para otros miembros.'),
('community.post.removed_notice',  'it', 'Il tuo post è stato rimosso da un moderatore e non è più visibile agli altri membri.'),
('community.post.removed_notice',  'fr', 'Votre publication a été supprimée par un modérateur et n''est plus visible par les autres membres.'),
('community.post.removed_notice',  'de', 'Ihr Beitrag wurde von einem Moderator entfernt und ist für andere Mitglieder nicht mehr sichtbar.'),
('community.post.removed_notice',  'sv', 'Ditt inlägg har tagits bort av en moderator och syns inte längre för andra medlemmar.'),
('community.post.removed_notice',  'fi', 'Moderaattori on poistanut julkaisusi, eikä se enää näy muille jäsenille.'),

('community.post.reply_removed',   'es', 'Esta respuesta ha sido eliminada por un moderador.'),
('community.post.reply_removed',   'it', 'Questa risposta è stata rimossa da un moderatore.'),
('community.post.reply_removed',   'fr', 'Cette réponse a été supprimée par un modérateur.'),
('community.post.reply_removed',   'de', 'Diese Antwort wurde von einem Moderator entfernt.'),
('community.post.reply_removed',   'sv', 'Det här svaret har tagits bort av en moderator.'),
('community.post.reply_removed',   'fi', 'Moderaattori on poistanut tämän vastauksen.'),

-- ============================================================
-- community.profile.* — Community profile editor
-- ============================================================
('community.profile.avatar_color_label',    'es', 'Color de avatar'),
('community.profile.avatar_color_label',    'it', 'Colore avatar'),
('community.profile.avatar_color_label',    'fr', 'Couleur de l''avatar'),
('community.profile.avatar_color_label',    'de', 'Avatar-Farbe'),
('community.profile.avatar_color_label',    'sv', 'Avatarfärg'),
('community.profile.avatar_color_label',    'fi', 'Avatarin väri'),

('community.profile.avatar_preview',        'es', 'Vista previa de tu avatar'),
('community.profile.avatar_preview',        'it', 'Anteprima del tuo avatar'),
('community.profile.avatar_preview',        'fr', 'Aperçu de votre avatar'),
('community.profile.avatar_preview',        'de', 'Vorschau Ihres Avatars'),
('community.profile.avatar_preview',        'sv', 'Förhandsgranskning av din avatar'),
('community.profile.avatar_preview',        'fi', 'Esikatselu avatarista'),

('community.profile.caregiver_type_label',  'es', '¿Qué tipo de cuidador eres?'),
('community.profile.caregiver_type_label',  'it', 'Che tipo di caregiver sei?'),
('community.profile.caregiver_type_label',  'fr', 'Quel type d''aidant êtes-vous?'),
('community.profile.caregiver_type_label',  'de', 'Welche Art von Pflegeperson sind Sie?'),
('community.profile.caregiver_type_label',  'sv', 'Vilken typ av vårdare är du?'),
('community.profile.caregiver_type_label',  'fi', 'Minkälainen hoitaja olet?'),

('community.profile.caregiver_type_optional', 'es', '(opcional)'),
('community.profile.caregiver_type_optional', 'it', '(opzionale)'),
('community.profile.caregiver_type_optional', 'fr', '(optionnel)'),
('community.profile.caregiver_type_optional', 'de', '(optional)'),
('community.profile.caregiver_type_optional', 'sv', '(valfritt)'),
('community.profile.caregiver_type_optional', 'fi', '(valinnainen)'),

('community.profile.handle_hint',           'es', 'Letras, números, guiones bajos, guiones. 3–30 caracteres.'),
('community.profile.handle_hint',           'it', 'Lettere, numeri, trattini bassi, trattini. 3–30 caratteri.'),
('community.profile.handle_hint',           'fr', 'Lettres, chiffres, tirets bas, tirets. 3–30 caractères.'),
('community.profile.handle_hint',           'de', 'Buchstaben, Zahlen, Unterstriche, Bindestriche. 3–30 Zeichen.'),
('community.profile.handle_hint',           'sv', 'Bokstäver, siffror, understreck, bindestreck. 3–30 tecken.'),
('community.profile.handle_hint',           'fi', 'Kirjaimet, numerot, alaviivat, väliviivastreet. 3–30 merkkiä.'),

('community.profile.handle_label',          'es', 'Nombre de usuario en la comunidad'),
('community.profile.handle_label',          'it', 'Nome utente nella community'),
('community.profile.handle_label',          'fr', 'Pseudonyme dans la communauté'),
('community.profile.handle_label',          'de', 'Community-Benutzername'),
('community.profile.handle_label',          'sv', 'Communityhanteringsnamn'),
('community.profile.handle_label',          'fi', 'Yhteisön käyttäjätunnus'),

('community.profile.handle_visible',        'es', '(visible para otros)'),
('community.profile.handle_visible',        'it', '(visibile agli altri)'),
('community.profile.handle_visible',        'fr', '(visible par les autres)'),
('community.profile.handle_visible',        'de', '(für andere sichtbar)'),
('community.profile.handle_visible',        'sv', '(synlig för andra)'),
('community.profile.handle_visible',        'fi', '(näkyvissä muille)'),

-- ============================================================
-- community.report.* — Report modal
-- ============================================================
('community.report.additional_details', 'es', 'Detalles adicionales'),
('community.report.additional_details', 'it', 'Dettagli aggiuntivi'),
('community.report.additional_details', 'fr', 'Détails supplémentaires'),
('community.report.additional_details', 'de', 'Weitere Details'),
('community.report.additional_details', 'sv', 'Ytterligare detaljer'),
('community.report.additional_details', 'fi', 'Lisätiedot'),

('community.report.describe_issue',     'es', 'Por favor describe el problema...'),
('community.report.describe_issue',     'it', 'Per favore descrivi il problema...'),
('community.report.describe_issue',     'fr', 'Veuillez décrire le problème...'),
('community.report.describe_issue',     'de', 'Bitte beschreiben Sie das Problem...'),
('community.report.describe_issue',     'sv', 'Beskriv problemet...'),
('community.report.describe_issue',     'fi', 'Kuvaile ongelma...'),

('community.report.optional',           'es', '(opcional)'),
('community.report.optional',           'it', '(opzionale)'),
('community.report.optional',           'fr', '(optionnel)'),
('community.report.optional',           'de', '(optional)'),
('community.report.optional',           'sv', '(valfritt)'),
('community.report.optional',           'fi', '(valinnainen)'),

('community.report.select_reason',      'es', 'Selecciona el motivo que mejor describe el problema.'),
('community.report.select_reason',      'it', 'Seleziona il motivo che meglio descrive il problema.'),
('community.report.select_reason',      'fr', 'Sélectionnez la raison qui décrit le mieux le problème.'),
('community.report.select_reason',      'de', 'Wählen Sie den Grund, der das Problem am besten beschreibt.'),
('community.report.select_reason',      'sv', 'Välj den anledning som bäst beskriver problemet.'),
('community.report.select_reason',      'fi', 'Valitse syy, joka parhaiten kuvaa ongelmaa.'),

-- ============================================================
-- create_account.* — Confirm password field
-- ============================================================
('create_account.confirm_password_label',       'es', 'Confirmar contraseña'),
('create_account.confirm_password_label',       'it', 'Conferma password'),
('create_account.confirm_password_label',       'fr', 'Confirmer le mot de passe'),
('create_account.confirm_password_label',       'de', 'Passwort bestätigen'),
('create_account.confirm_password_label',       'sv', 'Bekräfta lösenord'),
('create_account.confirm_password_label',       'fi', 'Vahvista salasana'),

('create_account.confirm_password_placeholder', 'es', 'Vuelve a introducir tu contraseña'),
('create_account.confirm_password_placeholder', 'it', 'Reinserisci la tua password'),
('create_account.confirm_password_placeholder', 'fr', 'Ressaisissez votre mot de passe'),
('create_account.confirm_password_placeholder', 'de', 'Passwort erneut eingeben'),
('create_account.confirm_password_placeholder', 'sv', 'Ange lösenordet igen'),
('create_account.confirm_password_placeholder', 'fi', 'Syötä salasana uudelleen'),

('create_account.passwords_mismatch',           'es', 'Las contraseñas no coinciden.'),
('create_account.passwords_mismatch',           'it', 'Le password non corrispondono.'),
('create_account.passwords_mismatch',           'fr', 'Les mots de passe ne correspondent pas.'),
('create_account.passwords_mismatch',           'de', 'Die Passwörter stimmen nicht überein.'),
('create_account.passwords_mismatch',           'sv', 'Lösenorden matchar inte.'),
('create_account.passwords_mismatch',           'fi', 'Salasanat eivät täsmää.')

ON CONFLICT (key, locale) DO NOTHING;
