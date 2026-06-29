/*
  # Observation Form Resident Field i18n Keys

  Adds three new translation keys used by the resident name field
  in the Observation Form when resident data is pre-populated from
  a user's team profile.

  Keys added:
  - obs_form.resident_edit_link — link label to edit resident profile
  - obs_form.resident_no_profile_hint — hint text shown when no profile exists
  - obs_form.resident_no_profile_link — link label to set up resident profile

  English values are complete. All other supported locales receive appropriate translations.
*/

INSERT INTO ui_translations (locale, key, value)
VALUES
  -- English
  ('en', 'obs_form.resident_edit_link', 'Edit'),
  ('en', 'obs_form.resident_no_profile_hint', 'No resident profile set up yet.'),
  ('en', 'obs_form.resident_no_profile_link', 'Set up resident profile'),

  -- Spanish
  ('es', 'obs_form.resident_edit_link', 'Editar'),
  ('es', 'obs_form.resident_no_profile_hint', 'Aún no se ha configurado el perfil del residente.'),
  ('es', 'obs_form.resident_no_profile_link', 'Configurar perfil del residente'),

  -- French
  ('fr', 'obs_form.resident_edit_link', 'Modifier'),
  ('fr', 'obs_form.resident_no_profile_hint', 'Aucun profil de résident configuré pour l''instant.'),
  ('fr', 'obs_form.resident_no_profile_link', 'Configurer le profil du résident'),

  -- German
  ('de', 'obs_form.resident_edit_link', 'Bearbeiten'),
  ('de', 'obs_form.resident_no_profile_hint', 'Noch kein Bewohnerprofil eingerichtet.'),
  ('de', 'obs_form.resident_no_profile_link', 'Bewohnerprofil einrichten'),

  -- Italian
  ('it', 'obs_form.resident_edit_link', 'Modifica'),
  ('it', 'obs_form.resident_no_profile_hint', 'Nessun profilo residente ancora configurato.'),
  ('it', 'obs_form.resident_no_profile_link', 'Configura profilo residente'),

  -- Swedish
  ('sv', 'obs_form.resident_edit_link', 'Redigera'),
  ('sv', 'obs_form.resident_no_profile_hint', 'Inget invånarprofil har konfigurerats ännu.'),
  ('sv', 'obs_form.resident_no_profile_link', 'Konfigurera invånarprofil'),

  -- Finnish
  ('fi', 'obs_form.resident_edit_link', 'Muokkaa'),
  ('fi', 'obs_form.resident_no_profile_hint', 'Asukasprofiilia ei ole vielä määritetty.'),
  ('fi', 'obs_form.resident_no_profile_link', 'Määritä asukasprofiili')

ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
