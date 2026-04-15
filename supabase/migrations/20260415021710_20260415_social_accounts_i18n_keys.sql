/*
  # Seed Social Media / Online Accounts i18n keys

  ## Summary
  Adds all translation keys for the new Memory Book "Online Accounts" section
  (memory_book_social_accounts table) across all 7 supported locales:
  English, Spanish, Italian, French, German, Swedish, Finnish.

  ## Keys Added
  - memory_book.social_title — section heading
  - memory_book.social_count_one / social_count_many — item count labels
  - memory_book.social_add_btn / social_add_first_btn — add buttons
  - memory_book.social_empty_title / social_empty_desc — empty state
  - memory_book.social_edit_heading / social_new_heading — form headings
  - memory_book.field_social_platform / field_social_platform_select — platform dropdown
  - memory_book.field_social_custom_platform / field_social_custom_platform_placeholder
  - memory_book.field_social_username / field_social_username_placeholder
  - memory_book.field_social_url / field_social_url_placeholder
  - memory_book.field_social_notes_placeholder
  - memory_book.toast_social_added / toast_social_updated / toast_social_removed
  - memory_book.toast_social_platform_required
  - memory_book.confirm_remove_social
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ============================================================
-- English
-- ============================================================
('en','memory_book.social_title','Social Media & Online Accounts'),
('en','memory_book.social_count_one','1 account on file'),
('en','memory_book.social_count_many','{count} accounts on file'),
('en','memory_book.social_add_btn','Add Account'),
('en','memory_book.social_add_first_btn','Add First Account'),
('en','memory_book.social_empty_title','No online accounts added yet'),
('en','memory_book.social_empty_desc','Record social media profiles, email accounts, and other online services so family members can manage them when needed.'),
('en','memory_book.social_edit_heading','Edit Account'),
('en','memory_book.social_new_heading','New Account'),
('en','memory_book.field_social_platform','Platform *'),
('en','memory_book.field_social_platform_select','Select a platform'),
('en','memory_book.field_social_custom_platform','Platform Name *'),
('en','memory_book.field_social_custom_platform_placeholder','e.g. MySpace, Clubhouse, Flickr'),
('en','memory_book.field_social_username','Username / Handle / Email'),
('en','memory_book.field_social_username_placeholder','e.g. @johndoe or john@example.com'),
('en','memory_book.field_social_url','Profile URL'),
('en','memory_book.field_social_url_placeholder','e.g. https://facebook.com/johndoe'),
('en','memory_book.field_social_notes_placeholder','e.g. Managed by daughter Jane, password hint in safe'),
('en','memory_book.toast_social_added','Account added'),
('en','memory_book.toast_social_updated','Account updated'),
('en','memory_book.toast_social_removed','Account removed'),
('en','memory_book.toast_social_platform_required','Platform is required'),
('en','memory_book.confirm_remove_social','Remove {platform} account?'),

-- ============================================================
-- Spanish
-- ============================================================
('es','memory_book.social_title','Redes Sociales y Cuentas en Línea'),
('es','memory_book.social_count_one','1 cuenta registrada'),
('es','memory_book.social_count_many','{count} cuentas registradas'),
('es','memory_book.social_add_btn','Añadir Cuenta'),
('es','memory_book.social_add_first_btn','Añadir Primera Cuenta'),
('es','memory_book.social_empty_title','Sin cuentas en línea registradas'),
('es','memory_book.social_empty_desc','Registre perfiles de redes sociales, cuentas de correo y otros servicios en línea para que los familiares puedan gestionarlos cuando sea necesario.'),
('es','memory_book.social_edit_heading','Editar Cuenta'),
('es','memory_book.social_new_heading','Nueva Cuenta'),
('es','memory_book.field_social_platform','Plataforma *'),
('es','memory_book.field_social_platform_select','Seleccionar plataforma'),
('es','memory_book.field_social_custom_platform','Nombre de la Plataforma *'),
('es','memory_book.field_social_custom_platform_placeholder','p.ej. MySpace, Clubhouse, Flickr'),
('es','memory_book.field_social_username','Usuario / Alias / Correo'),
('es','memory_book.field_social_username_placeholder','p.ej. @juanperez o juan@ejemplo.com'),
('es','memory_book.field_social_url','URL del Perfil'),
('es','memory_book.field_social_url_placeholder','p.ej. https://facebook.com/juanperez'),
('es','memory_book.field_social_notes_placeholder','p.ej. Gestionado por la hija Ana, pista de contraseña en la caja fuerte'),
('es','memory_book.toast_social_added','Cuenta añadida'),
('es','memory_book.toast_social_updated','Cuenta actualizada'),
('es','memory_book.toast_social_removed','Cuenta eliminada'),
('es','memory_book.toast_social_platform_required','La plataforma es obligatoria'),
('es','memory_book.confirm_remove_social','¿Eliminar cuenta de {platform}?'),

-- ============================================================
-- Italian
-- ============================================================
('it','memory_book.social_title','Social Media e Account Online'),
('it','memory_book.social_count_one','1 account registrato'),
('it','memory_book.social_count_many','{count} account registrati'),
('it','memory_book.social_add_btn','Aggiungi Account'),
('it','memory_book.social_add_first_btn','Aggiungi Primo Account'),
('it','memory_book.social_empty_title','Nessun account online aggiunto'),
('it','memory_book.social_empty_desc','Registra profili social, account email e altri servizi online in modo che i familiari possano gestirli quando necessario.'),
('it','memory_book.social_edit_heading','Modifica Account'),
('it','memory_book.social_new_heading','Nuovo Account'),
('it','memory_book.field_social_platform','Piattaforma *'),
('it','memory_book.field_social_platform_select','Seleziona una piattaforma'),
('it','memory_book.field_social_custom_platform','Nome della Piattaforma *'),
('it','memory_book.field_social_custom_platform_placeholder','es. MySpace, Clubhouse, Flickr'),
('it','memory_book.field_social_username','Nome utente / Handle / Email'),
('it','memory_book.field_social_username_placeholder','es. @mariorossi o mario@esempio.com'),
('it','memory_book.field_social_url','URL del Profilo'),
('it','memory_book.field_social_url_placeholder','es. https://facebook.com/mariorossi'),
('it','memory_book.field_social_notes_placeholder','es. Gestito dalla figlia Maria, suggerimento password nella cassaforte'),
('it','memory_book.toast_social_added','Account aggiunto'),
('it','memory_book.toast_social_updated','Account aggiornato'),
('it','memory_book.toast_social_removed','Account rimosso'),
('it','memory_book.toast_social_platform_required','La piattaforma è obbligatoria'),
('it','memory_book.confirm_remove_social','Rimuovere account {platform}?'),

-- ============================================================
-- French
-- ============================================================
('fr','memory_book.social_title','Réseaux Sociaux et Comptes en Ligne'),
('fr','memory_book.social_count_one','1 compte enregistré'),
('fr','memory_book.social_count_many','{count} comptes enregistrés'),
('fr','memory_book.social_add_btn','Ajouter un Compte'),
('fr','memory_book.social_add_first_btn','Ajouter le Premier Compte'),
('fr','memory_book.social_empty_title','Aucun compte en ligne enregistré'),
('fr','memory_book.social_empty_desc','Enregistrez les profils de réseaux sociaux, comptes e-mail et autres services en ligne afin que les proches puissent les gérer si nécessaire.'),
('fr','memory_book.social_edit_heading','Modifier le Compte'),
('fr','memory_book.social_new_heading','Nouveau Compte'),
('fr','memory_book.field_social_platform','Plateforme *'),
('fr','memory_book.field_social_platform_select','Sélectionner une plateforme'),
('fr','memory_book.field_social_custom_platform','Nom de la Plateforme *'),
('fr','memory_book.field_social_custom_platform_placeholder','ex. MySpace, Clubhouse, Flickr'),
('fr','memory_book.field_social_username','Nom d''utilisateur / Pseudo / E-mail'),
('fr','memory_book.field_social_username_placeholder','ex. @jeandupon ou jean@exemple.com'),
('fr','memory_book.field_social_url','URL du Profil'),
('fr','memory_book.field_social_url_placeholder','ex. https://facebook.com/jeandupon'),
('fr','memory_book.field_social_notes_placeholder','ex. Géré par la fille Marie, indice de mot de passe dans le coffre'),
('fr','memory_book.toast_social_added','Compte ajouté'),
('fr','memory_book.toast_social_updated','Compte mis à jour'),
('fr','memory_book.toast_social_removed','Compte supprimé'),
('fr','memory_book.toast_social_platform_required','La plateforme est obligatoire'),
('fr','memory_book.confirm_remove_social','Supprimer le compte {platform} ?'),

-- ============================================================
-- German
-- ============================================================
('de','memory_book.social_title','Soziale Medien & Online-Konten'),
('de','memory_book.social_count_one','1 Konto eingetragen'),
('de','memory_book.social_count_many','{count} Konten eingetragen'),
('de','memory_book.social_add_btn','Konto hinzufügen'),
('de','memory_book.social_add_first_btn','Erstes Konto hinzufügen'),
('de','memory_book.social_empty_title','Noch keine Online-Konten eingetragen'),
('de','memory_book.social_empty_desc','Erfassen Sie Social-Media-Profile, E-Mail-Konten und andere Online-Dienste, damit Familienmitglieder diese bei Bedarf verwalten können.'),
('de','memory_book.social_edit_heading','Konto bearbeiten'),
('de','memory_book.social_new_heading','Neues Konto'),
('de','memory_book.field_social_platform','Plattform *'),
('de','memory_book.field_social_platform_select','Plattform auswählen'),
('de','memory_book.field_social_custom_platform','Plattformname *'),
('de','memory_book.field_social_custom_platform_placeholder','z.B. MySpace, Clubhouse, Flickr'),
('de','memory_book.field_social_username','Benutzername / Handle / E-Mail'),
('de','memory_book.field_social_username_placeholder','z.B. @hansmüller oder hans@beispiel.de'),
('de','memory_book.field_social_url','Profil-URL'),
('de','memory_book.field_social_url_placeholder','z.B. https://facebook.com/hansmueller'),
('de','memory_book.field_social_notes_placeholder','z.B. Verwaltet von Tochter Maria, Passworthinweis im Safe'),
('de','memory_book.toast_social_added','Konto hinzugefügt'),
('de','memory_book.toast_social_updated','Konto aktualisiert'),
('de','memory_book.toast_social_removed','Konto entfernt'),
('de','memory_book.toast_social_platform_required','Plattform ist erforderlich'),
('de','memory_book.confirm_remove_social','{platform}-Konto entfernen?'),

-- ============================================================
-- Swedish
-- ============================================================
('sv','memory_book.social_title','Sociala Medier & Onlinekonton'),
('sv','memory_book.social_count_one','1 konto registrerat'),
('sv','memory_book.social_count_many','{count} konton registrerade'),
('sv','memory_book.social_add_btn','Lägg till Konto'),
('sv','memory_book.social_add_first_btn','Lägg till Första Konto'),
('sv','memory_book.social_empty_title','Inga onlinekonton tillagda ännu'),
('sv','memory_book.social_empty_desc','Registrera profiler på sociala medier, e-postkonton och andra onlinetjänster så att familjemedlemmar kan hantera dem vid behov.'),
('sv','memory_book.social_edit_heading','Redigera Konto'),
('sv','memory_book.social_new_heading','Nytt Konto'),
('sv','memory_book.field_social_platform','Plattform *'),
('sv','memory_book.field_social_platform_select','Välj en plattform'),
('sv','memory_book.field_social_custom_platform','Plattformnamn *'),
('sv','memory_book.field_social_custom_platform_placeholder','t.ex. MySpace, Clubhouse, Flickr'),
('sv','memory_book.field_social_username','Användarnamn / Handle / E-post'),
('sv','memory_book.field_social_username_placeholder','t.ex. @eriksson eller erik@exempel.se'),
('sv','memory_book.field_social_url','Profil-URL'),
('sv','memory_book.field_social_url_placeholder','t.ex. https://facebook.com/eriksson'),
('sv','memory_book.field_social_notes_placeholder','t.ex. Hanteras av dotter Anna, lösenordstips i kassaskåpet'),
('sv','memory_book.toast_social_added','Konto tillagt'),
('sv','memory_book.toast_social_updated','Konto uppdaterat'),
('sv','memory_book.toast_social_removed','Konto borttaget'),
('sv','memory_book.toast_social_platform_required','Plattform krävs'),
('sv','memory_book.confirm_remove_social','Ta bort {platform}-konto?'),

-- ============================================================
-- Finnish
-- ============================================================
('fi','memory_book.social_title','Sosiaalinen Media & Verkkotilit'),
('fi','memory_book.social_count_one','1 tili rekisteröity'),
('fi','memory_book.social_count_many','{count} tiliä rekisteröity'),
('fi','memory_book.social_add_btn','Lisää Tili'),
('fi','memory_book.social_add_first_btn','Lisää Ensimmäinen Tili'),
('fi','memory_book.social_empty_title','Ei verkkotilejä vielä'),
('fi','memory_book.social_empty_desc','Kirjaa sosiaalisen median profiilit, sähköpostitilit ja muut verkkopalvelut, jotta perheenjäsenet voivat hallita niitä tarvittaessa.'),
('fi','memory_book.social_edit_heading','Muokkaa Tiliä'),
('fi','memory_book.social_new_heading','Uusi Tili'),
('fi','memory_book.field_social_platform','Alusta *'),
('fi','memory_book.field_social_platform_select','Valitse alusta'),
('fi','memory_book.field_social_custom_platform','Alustan nimi *'),
('fi','memory_book.field_social_custom_platform_placeholder','esim. MySpace, Clubhouse, Flickr'),
('fi','memory_book.field_social_username','Käyttäjänimi / Handle / Sähköposti'),
('fi','memory_book.field_social_username_placeholder','esim. @makkonen tai matti@esimerkki.fi'),
('fi','memory_book.field_social_url','Profiilin URL'),
('fi','memory_book.field_social_url_placeholder','esim. https://facebook.com/makkonen'),
('fi','memory_book.field_social_notes_placeholder','esim. Tytär Anna hoitaa, salasanavinkki kassakaapissa'),
('fi','memory_book.toast_social_added','Tili lisätty'),
('fi','memory_book.toast_social_updated','Tili päivitetty'),
('fi','memory_book.toast_social_removed','Tili poistettu'),
('fi','memory_book.toast_social_platform_required','Alusta vaaditaan'),
('fi','memory_book.confirm_remove_social','Poista {platform}-tili?')

ON CONFLICT (locale, key) DO NOTHING;
