/*
  # QC Missing Translation Keys

  ## Summary
  Seeds all translation keys introduced or identified as missing during the
  Primary Caregiver flow QC audit. Covers 7 locales: en, es, it, fr, de, sv, fi.

  ## New Keys Added

  ### team_guard.*
  - upgrade_title, upgrade_body_primary, upgrade_body_default, upgrade_cta
  - Shown when a primary_qtr user tries to access Family Circle routes

  ### team.invite_expires_on
  - Shown below the invite link to communicate the 7-day expiry

  ### accept_invite.error_* keys
  - Specific messages for expired, consumed, and generic invite errors
  - accept_invite.error_title, error_expired_title, error_expired_body
  - accept_invite.error_consumed_title, error_consumed_body

  ### community.loading
  - Replaces the hardcoded "Loading community…" string in CommunityGuard

  ### auth_callback.verifying
  - Replaces the hardcoded "Verifying your link..." string in AuthCallbackPage

  ### common.go_home
  - Generic "Go Home" link label used in AcceptInvite error states

  ## Notes
  - All non-English locales get sensible translations; English is the canonical value.
  - Uses INSERT ... ON CONFLICT DO UPDATE to be fully idempotent.
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ─────────────────────────────────────────────
-- team_guard.* keys
-- ─────────────────────────────────────────────
('en', 'team_guard.upgrade_title',        'Family Circle is a Team Feature'),
('en', 'team_guard.upgrade_body_primary', 'Your Primary Caregiver plan is great for solo caregivers. Upgrade to the Family Circle plan to invite family members and share the care journey together.'),
('en', 'team_guard.upgrade_body_default', 'The Family Circle plan lets you build a shared care team, invite family members, and keep everyone on the same page.'),
('en', 'team_guard.upgrade_cta',          'Upgrade to Family Circle'),

('es', 'team_guard.upgrade_title',        'El Círculo Familiar es una Función de Equipo'),
('es', 'team_guard.upgrade_body_primary', 'Tu plan de Cuidador Principal es ideal para cuidadores en solitario. Actualiza al plan Círculo Familiar para invitar a familiares y compartir el cuidado juntos.'),
('es', 'team_guard.upgrade_body_default', 'El plan Círculo Familiar te permite crear un equipo de cuidado compartido, invitar a familiares y mantener a todos informados.'),
('es', 'team_guard.upgrade_cta',          'Actualizar al Círculo Familiar'),

('fr', 'team_guard.upgrade_title',        'Le Cercle Familial est une Fonctionnalité d''Équipe'),
('fr', 'team_guard.upgrade_body_primary', 'Votre plan Aidant Principal est idéal pour les aidants en solo. Passez au plan Cercle Familial pour inviter des membres de votre famille et partager le parcours de soin.'),
('fr', 'team_guard.upgrade_body_default', 'Le plan Cercle Familial vous permet de créer une équipe de soin partagée, d''inviter des membres de la famille et de tenir tout le monde informé.'),
('fr', 'team_guard.upgrade_cta',          'Passer au Cercle Familial'),

('de', 'team_guard.upgrade_title',        'Familienkreis ist eine Teamfunktion'),
('de', 'team_guard.upgrade_body_primary', 'Ihr Hauptpflegeperson-Plan eignet sich gut für Einzelpflegende. Upgraden Sie auf den Familienkreis-Plan, um Familienmitglieder einzuladen und die Pflege gemeinsam zu teilen.'),
('de', 'team_guard.upgrade_body_default', 'Der Familienkreis-Plan ermöglicht es Ihnen, ein gemeinsames Pflegeteam zu bilden, Familienmitglieder einzuladen und alle auf dem Laufenden zu halten.'),
('de', 'team_guard.upgrade_cta',          'Auf Familienkreis upgraden'),

('it', 'team_guard.upgrade_title',        'Il Cerchio Familiare è una Funzionalità di Squadra'),
('it', 'team_guard.upgrade_body_primary', 'Il tuo piano Caregiver Principale è ottimo per chi si prende cura da solo. Passa al piano Cerchio Familiare per invitare i familiari e condividere il percorso di cura insieme.'),
('it', 'team_guard.upgrade_body_default', 'Il piano Cerchio Familiare ti permette di creare un team di cura condiviso, invitare familiari e tenere tutti aggiornati.'),
('it', 'team_guard.upgrade_cta',          'Passa al Cerchio Familiare'),

('sv', 'team_guard.upgrade_title',        'Familjecirkeln är en Teamfunktion'),
('sv', 'team_guard.upgrade_body_primary', 'Din plan för Primär Vårdgivare är bra för ensamvårdare. Uppgradera till Familjecirkel-planen för att bjuda in familjemedlemmar och dela omsorgsresan tillsammans.'),
('sv', 'team_guard.upgrade_body_default', 'Familjecirkel-planen låter dig bygga ett delat vårdteam, bjuda in familjemedlemmar och hålla alla uppdaterade.'),
('sv', 'team_guard.upgrade_cta',          'Uppgradera till Familjecirkeln'),

('fi', 'team_guard.upgrade_title',        'Perhepiiri on Tiimitoiminto'),
('fi', 'team_guard.upgrade_body_primary', 'Ensisijaisen hoitajan suunnitelmasi sopii hyvin yksin hoitaville. Päivitä Perhepiiri-suunnitelmaan, jotta voit kutsua perheenjäseniä ja jakaa hoitomatkan yhdessä.'),
('fi', 'team_guard.upgrade_body_default', 'Perhepiiri-suunnitelma antaa sinulle mahdollisuuden rakentaa yhteisen hoitotiimin, kutsua perheenjäseniä ja pitää kaikki ajan tasalla.'),
('fi', 'team_guard.upgrade_cta',          'Päivitä Perhepiiriin'),

-- ─────────────────────────────────────────────
-- team.invite_expires_on
-- ─────────────────────────────────────────────
('en', 'team.invite_expires_on', 'This link expires on {date}. After that, you will need to generate a new invite.'),
('es', 'team.invite_expires_on', 'Este enlace vence el {date}. Después de esa fecha, deberás generar una nueva invitación.'),
('fr', 'team.invite_expires_on', 'Ce lien expire le {date}. Après cette date, vous devrez générer une nouvelle invitation.'),
('de', 'team.invite_expires_on', 'Dieser Link läuft am {date} ab. Danach müssen Sie eine neue Einladung erstellen.'),
('it', 'team.invite_expires_on', 'Questo link scade il {date}. Dopo quella data, dovrai generare un nuovo invito.'),
('sv', 'team.invite_expires_on', 'Den här länken går ut den {date}. Efter det måste du generera en ny inbjudan.'),
('fi', 'team.invite_expires_on', 'Tämä linkki vanhenee {date}. Sen jälkeen sinun on luotava uusi kutsu.'),

-- ─────────────────────────────────────────────
-- accept_invite.error_* keys
-- ─────────────────────────────────────────────
('en', 'accept_invite.error_title',           'Unable to Join'),
('en', 'accept_invite.error_expired_title',   'Invite Link Expired'),
('en', 'accept_invite.error_expired_body',    'This invite link has expired. Please ask the team owner to send you a new one.'),
('en', 'accept_invite.error_consumed_title',  'Invite Already Used'),
('en', 'accept_invite.error_consumed_body',   'This invite link has already been used. If you meant to join a different team, please ask for a new link.'),

('es', 'accept_invite.error_title',           'No se puede unir'),
('es', 'accept_invite.error_expired_title',   'Enlace de invitación caducado'),
('es', 'accept_invite.error_expired_body',    'Este enlace de invitación ha caducado. Pide al propietario del equipo que te envíe uno nuevo.'),
('es', 'accept_invite.error_consumed_title',  'Invitación ya utilizada'),
('es', 'accept_invite.error_consumed_body',   'Este enlace de invitación ya ha sido utilizado. Si deseas unirte a un equipo diferente, solicita un nuevo enlace.'),

('fr', 'accept_invite.error_title',           'Impossible de rejoindre'),
('fr', 'accept_invite.error_expired_title',   'Lien d''invitation expiré'),
('fr', 'accept_invite.error_expired_body',    'Ce lien d''invitation a expiré. Veuillez demander au propriétaire de l''équipe de vous en envoyer un nouveau.'),
('fr', 'accept_invite.error_consumed_title',  'Invitation déjà utilisée'),
('fr', 'accept_invite.error_consumed_body',   'Ce lien d''invitation a déjà été utilisé. Si vous souhaitez rejoindre une autre équipe, demandez un nouveau lien.'),

('de', 'accept_invite.error_title',           'Beitritt nicht möglich'),
('de', 'accept_invite.error_expired_title',   'Einladungslink abgelaufen'),
('de', 'accept_invite.error_expired_body',    'Dieser Einladungslink ist abgelaufen. Bitte bitten Sie den Team-Eigentümer, Ihnen einen neuen zu schicken.'),
('de', 'accept_invite.error_consumed_title',  'Einladung bereits verwendet'),
('de', 'accept_invite.error_consumed_body',   'Dieser Einladungslink wurde bereits verwendet. Wenn Sie einem anderen Team beitreten möchten, bitten Sie um einen neuen Link.'),

('it', 'accept_invite.error_title',           'Impossibile unirsi'),
('it', 'accept_invite.error_expired_title',   'Link di invito scaduto'),
('it', 'accept_invite.error_expired_body',    'Questo link di invito è scaduto. Chiedi al proprietario del team di inviartene uno nuovo.'),
('it', 'accept_invite.error_consumed_title',  'Invito già utilizzato'),
('it', 'accept_invite.error_consumed_body',   'Questo link di invito è già stato utilizzato. Se desideri unirti a un altro team, richiedi un nuovo link.'),

('sv', 'accept_invite.error_title',           'Det gick inte att gå med'),
('sv', 'accept_invite.error_expired_title',   'Inbjudningslänken har upphört'),
('sv', 'accept_invite.error_expired_body',    'Den här inbjudningslänken har upphört att gälla. Be teamägaren skicka dig en ny.'),
('sv', 'accept_invite.error_consumed_title',  'Inbjudan redan använd'),
('sv', 'accept_invite.error_consumed_body',   'Den här inbjudningslänken har redan använts. Om du vill gå med i ett annat team, be om en ny länk.'),

('fi', 'accept_invite.error_title',           'Liittyminen ei onnistu'),
('fi', 'accept_invite.error_expired_title',   'Kutsulinkki on vanhentunut'),
('fi', 'accept_invite.error_expired_body',    'Tämä kutsulinkki on vanhentunut. Pyydä tiimin omistajaa lähettämään sinulle uusi.'),
('fi', 'accept_invite.error_consumed_title',  'Kutsu on jo käytetty'),
('fi', 'accept_invite.error_consumed_body',   'Tätä kutsulinkkiä on jo käytetty. Jos haluat liittyä eri tiimiin, pyydä uusi linkki.'),

-- ─────────────────────────────────────────────
-- community.loading
-- ─────────────────────────────────────────────
('en', 'community.loading', 'Loading community…'),
('es', 'community.loading', 'Cargando comunidad…'),
('fr', 'community.loading', 'Chargement de la communauté…'),
('de', 'community.loading', 'Community wird geladen…'),
('it', 'community.loading', 'Caricamento della community…'),
('sv', 'community.loading', 'Laddar gemenskap…'),
('fi', 'community.loading', 'Ladataan yhteisöä…'),

-- ─────────────────────────────────────────────
-- auth_callback.verifying
-- ─────────────────────────────────────────────
('en', 'auth_callback.verifying', 'Verifying your link…'),
('es', 'auth_callback.verifying', 'Verificando tu enlace…'),
('fr', 'auth_callback.verifying', 'Vérification de votre lien…'),
('de', 'auth_callback.verifying', 'Link wird überprüft…'),
('it', 'auth_callback.verifying', 'Verifica del link…'),
('sv', 'auth_callback.verifying', 'Verifierar din länk…'),
('fi', 'auth_callback.verifying', 'Tarkistetaan linkkiäsi…'),

-- ─────────────────────────────────────────────
-- common.go_home
-- ─────────────────────────────────────────────
('en', 'common.go_home', 'Go to Home'),
('es', 'common.go_home', 'Ir al inicio'),
('fr', 'common.go_home', 'Aller à l''accueil'),
('de', 'common.go_home', 'Zur Startseite'),
('it', 'common.go_home', 'Vai alla home'),
('sv', 'common.go_home', 'Gå till startsidan'),
('fi', 'common.go_home', 'Siirry etusivulle'),

-- ─────────────────────────────────────────────
-- common.sending (used in TeamSettings invite button)
-- ─────────────────────────────────────────────
('en', 'common.sending', 'Sending…'),
('es', 'common.sending', 'Enviando…'),
('fr', 'common.sending', 'Envoi en cours…'),
('de', 'common.sending', 'Wird gesendet…'),
('it', 'common.sending', 'Invio in corso…'),
('sv', 'common.sending', 'Skickar…'),
('fi', 'common.sending', 'Lähetetään…')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
