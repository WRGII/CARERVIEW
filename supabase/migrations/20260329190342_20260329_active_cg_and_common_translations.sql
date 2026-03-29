/*
  # Seed missing active_cg.* and common.* translation keys

  ## Summary
  The ActiveCaregiversPage admin component references 13 active_cg.* translation keys
  and 5 common.* keys (no_email, disabled, active, enable, disable) that were never
  seeded to the ui_translations table. This migration adds all missing keys for every
  active locale: en, de, es, fi, fr, it, sv.

  Note: common.refresh already exists for en only; this migration adds it for the
  remaining locales as well (using INSERT ... ON CONFLICT DO NOTHING to be safe).

  ## New Keys
  - active_cg.title
  - active_cg.subtitle
  - active_cg.add_title
  - active_cg.display_name_label
  - active_cg.display_name_placeholder
  - active_cg.email_placeholder
  - active_cg.add_btn
  - active_cg.accounts_count
  - active_cg.loading_list
  - active_cg.empty
  - active_cg.invite_success
  - active_cg.delete_note
  - active_cg.signup_email_sent
  - common.no_email
  - common.disabled
  - common.active
  - common.enable
  - common.disable
  - common.refresh (all non-en locales)
*/

INSERT INTO ui_translations (locale, key, value) VALUES
  -- English
  ('en', 'active_cg.title',                   'Active Caregivers'),
  ('en', 'active_cg.subtitle',                'Manage caregiver accounts and access'),
  ('en', 'active_cg.add_title',               'Add Caregiver'),
  ('en', 'active_cg.display_name_label',      'Display name'),
  ('en', 'active_cg.display_name_placeholder','Caregiver''s name'),
  ('en', 'active_cg.email_placeholder',       'caregiver@example.com'),
  ('en', 'active_cg.add_btn',                 'Add Caregiver'),
  ('en', 'active_cg.accounts_count',          'Caregiver Accounts'),
  ('en', 'active_cg.loading_list',            'Loading caregivers…'),
  ('en', 'active_cg.empty',                   'No caregiver accounts yet.'),
  ('en', 'active_cg.invite_success',          'Invitation sent successfully.'),
  ('en', 'active_cg.delete_note',             'To permanently delete a caregiver account, use the Delete User tool on the Admin Dashboard.'),
  ('en', 'active_cg.signup_email_sent',       'Sign-up email sent. The caregiver will appear after they confirm.'),
  ('en', 'common.no_email',                   'No email'),
  ('en', 'common.disabled',                   'Disabled'),
  ('en', 'common.active',                     'Active'),
  ('en', 'common.enable',                     'Enable'),
  ('en', 'common.disable',                    'Disable'),

  -- Spanish (es)
  ('es', 'active_cg.title',                   'Cuidadores activos'),
  ('es', 'active_cg.subtitle',                'Gestionar cuentas y acceso de cuidadores'),
  ('es', 'active_cg.add_title',               'Agregar cuidador'),
  ('es', 'active_cg.display_name_label',      'Nombre visible'),
  ('es', 'active_cg.display_name_placeholder','Nombre del cuidador'),
  ('es', 'active_cg.email_placeholder',       'cuidador@ejemplo.com'),
  ('es', 'active_cg.add_btn',                 'Agregar cuidador'),
  ('es', 'active_cg.accounts_count',          'Cuentas de cuidadores'),
  ('es', 'active_cg.loading_list',            'Cargando cuidadores…'),
  ('es', 'active_cg.empty',                   'Aún no hay cuentas de cuidadores.'),
  ('es', 'active_cg.invite_success',          'Invitación enviada correctamente.'),
  ('es', 'active_cg.delete_note',             'Para eliminar permanentemente una cuenta de cuidador, use la herramienta Eliminar usuario en el Panel de administración.'),
  ('es', 'active_cg.signup_email_sent',       'Correo de registro enviado. El cuidador aparecerá después de confirmar.'),
  ('es', 'common.refresh',                    'Actualizar'),
  ('es', 'common.no_email',                   'Sin correo'),
  ('es', 'common.disabled',                   'Desactivado'),
  ('es', 'common.active',                     'Activo'),
  ('es', 'common.enable',                     'Activar'),
  ('es', 'common.disable',                    'Desactivar'),

  -- Swedish (sv)
  ('sv', 'active_cg.title',                   'Aktiva vårdgivare'),
  ('sv', 'active_cg.subtitle',                'Hantera vårdgivarkonton och åtkomst'),
  ('sv', 'active_cg.add_title',               'Lägg till vårdgivare'),
  ('sv', 'active_cg.display_name_label',      'Visningsnamn'),
  ('sv', 'active_cg.display_name_placeholder','Vårdgivarens namn'),
  ('sv', 'active_cg.email_placeholder',       'vardgivare@exempel.se'),
  ('sv', 'active_cg.add_btn',                 'Lägg till vårdgivare'),
  ('sv', 'active_cg.accounts_count',          'Vårdgivarkonton'),
  ('sv', 'active_cg.loading_list',            'Laddar vårdgivare…'),
  ('sv', 'active_cg.empty',                   'Inga vårdgivarkonton ännu.'),
  ('sv', 'active_cg.invite_success',          'Inbjudan skickad.'),
  ('sv', 'active_cg.delete_note',             'För att permanent ta bort ett vårdgivarkonto, använd verktyget Ta bort användare på Admin-panelen.'),
  ('sv', 'active_cg.signup_email_sent',       'Registreringsmail skickat. Vårdgivaren visas efter bekräftelse.'),
  ('sv', 'common.refresh',                    'Uppdatera'),
  ('sv', 'common.no_email',                   'Ingen e-post'),
  ('sv', 'common.disabled',                   'Inaktiverad'),
  ('sv', 'common.active',                     'Aktiv'),
  ('sv', 'common.enable',                     'Aktivera'),
  ('sv', 'common.disable',                    'Inaktivera'),

  -- Finnish (fi)
  ('fi', 'active_cg.title',                   'Aktiiviset hoitajat'),
  ('fi', 'active_cg.subtitle',                'Hallitse hoitajatilejä ja käyttöoikeuksia'),
  ('fi', 'active_cg.add_title',               'Lisää hoitaja'),
  ('fi', 'active_cg.display_name_label',      'Näyttönimi'),
  ('fi', 'active_cg.display_name_placeholder','Hoitajan nimi'),
  ('fi', 'active_cg.email_placeholder',       'hoitaja@esimerkki.fi'),
  ('fi', 'active_cg.add_btn',                 'Lisää hoitaja'),
  ('fi', 'active_cg.accounts_count',          'Hoitajatilit'),
  ('fi', 'active_cg.loading_list',            'Ladataan hoitajia…'),
  ('fi', 'active_cg.empty',                   'Ei hoitajatilejä vielä.'),
  ('fi', 'active_cg.invite_success',          'Kutsu lähetetty onnistuneesti.'),
  ('fi', 'active_cg.delete_note',             'Poistaaksesi hoitajatilin pysyvästi, käytä Poista käyttäjä -työkalua hallintapaneelissa.'),
  ('fi', 'active_cg.signup_email_sent',       'Rekisteröintisähköposti lähetetty. Hoitaja näkyy vahvistuksen jälkeen.'),
  ('fi', 'common.refresh',                    'Päivitä'),
  ('fi', 'common.no_email',                   'Ei sähköpostia'),
  ('fi', 'common.disabled',                   'Poistettu käytöstä'),
  ('fi', 'common.active',                     'Aktiivinen'),
  ('fi', 'common.enable',                     'Ota käyttöön'),
  ('fi', 'common.disable',                    'Poista käytöstä'),

  -- German (de)
  ('de', 'active_cg.title',                   'Aktive Pflegepersonen'),
  ('de', 'active_cg.subtitle',                'Pflegepersonenkonten und Zugriff verwalten'),
  ('de', 'active_cg.add_title',               'Pflegeperson hinzufügen'),
  ('de', 'active_cg.display_name_label',      'Anzeigename'),
  ('de', 'active_cg.display_name_placeholder','Name der Pflegeperson'),
  ('de', 'active_cg.email_placeholder',       'pflegeperson@beispiel.de'),
  ('de', 'active_cg.add_btn',                 'Pflegeperson hinzufügen'),
  ('de', 'active_cg.accounts_count',          'Pflegepersonenkonten'),
  ('de', 'active_cg.loading_list',            'Pflegepersonen werden geladen…'),
  ('de', 'active_cg.empty',                   'Noch keine Pflegepersonenkonten.'),
  ('de', 'active_cg.invite_success',          'Einladung erfolgreich gesendet.'),
  ('de', 'active_cg.delete_note',             'Um ein Pflegepersonenkonto dauerhaft zu löschen, verwenden Sie das Tool „Benutzer löschen" im Admin-Dashboard.'),
  ('de', 'active_cg.signup_email_sent',       'Registrierungs-E-Mail gesendet. Die Pflegeperson erscheint nach der Bestätigung.'),
  ('de', 'common.refresh',                    'Aktualisieren'),
  ('de', 'common.no_email',                   'Keine E-Mail'),
  ('de', 'common.disabled',                   'Deaktiviert'),
  ('de', 'common.active',                     'Aktiv'),
  ('de', 'common.enable',                     'Aktivieren'),
  ('de', 'common.disable',                    'Deaktivieren'),

  -- French (fr)
  ('fr', 'active_cg.title',                   'Aidants actifs'),
  ('fr', 'active_cg.subtitle',                'Gérer les comptes et accès des aidants'),
  ('fr', 'active_cg.add_title',               'Ajouter un aidant'),
  ('fr', 'active_cg.display_name_label',      'Nom affiché'),
  ('fr', 'active_cg.display_name_placeholder','Nom de l''aidant'),
  ('fr', 'active_cg.email_placeholder',       'aidant@exemple.fr'),
  ('fr', 'active_cg.add_btn',                 'Ajouter un aidant'),
  ('fr', 'active_cg.accounts_count',          'Comptes aidants'),
  ('fr', 'active_cg.loading_list',            'Chargement des aidants…'),
  ('fr', 'active_cg.empty',                   'Aucun compte aidant pour l''instant.'),
  ('fr', 'active_cg.invite_success',          'Invitation envoyée avec succès.'),
  ('fr', 'active_cg.delete_note',             'Pour supprimer définitivement un compte aidant, utilisez l''outil Supprimer l''utilisateur dans le tableau de bord Admin.'),
  ('fr', 'active_cg.signup_email_sent',       'E-mail d''inscription envoyé. L''aidant apparaîtra après confirmation.'),
  ('fr', 'common.refresh',                    'Actualiser'),
  ('fr', 'common.no_email',                   'Sans e-mail'),
  ('fr', 'common.disabled',                   'Désactivé'),
  ('fr', 'common.active',                     'Actif'),
  ('fr', 'common.enable',                     'Activer'),
  ('fr', 'common.disable',                    'Désactiver'),

  -- Italian (it)
  ('it', 'active_cg.title',                   'Caregiver attivi'),
  ('it', 'active_cg.subtitle',                'Gestisci account e accesso dei caregiver'),
  ('it', 'active_cg.add_title',               'Aggiungi caregiver'),
  ('it', 'active_cg.display_name_label',      'Nome visualizzato'),
  ('it', 'active_cg.display_name_placeholder','Nome del caregiver'),
  ('it', 'active_cg.email_placeholder',       'caregiver@esempio.it'),
  ('it', 'active_cg.add_btn',                 'Aggiungi caregiver'),
  ('it', 'active_cg.accounts_count',          'Account caregiver'),
  ('it', 'active_cg.loading_list',            'Caricamento caregiver…'),
  ('it', 'active_cg.empty',                   'Nessun account caregiver ancora.'),
  ('it', 'active_cg.invite_success',          'Invito inviato con successo.'),
  ('it', 'active_cg.delete_note',             'Per eliminare definitivamente un account caregiver, utilizza lo strumento Elimina utente nel pannello Admin.'),
  ('it', 'active_cg.signup_email_sent',       'Email di registrazione inviata. Il caregiver apparirà dopo la conferma.'),
  ('it', 'common.refresh',                    'Aggiorna'),
  ('it', 'common.no_email',                   'Nessuna email'),
  ('it', 'common.disabled',                   'Disabilitato'),
  ('it', 'common.active',                     'Attivo'),
  ('it', 'common.enable',                     'Abilita'),
  ('it', 'common.disable',                    'Disabilita')

ON CONFLICT (locale, key) DO NOTHING;
