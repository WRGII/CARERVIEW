-- Seed missing new_obs.*, obs_list.*, view_obs.*, export.* keys across all 8 locales

INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  -- new_obs.email_missing
  ('en', 'new_obs', 'email_missing', 'Your account email is missing. Please sign out and sign in again.'),
  ('es', 'new_obs', 'email_missing', 'Falta el correo electrónico de tu cuenta. Cierra sesión e inicia de nuevo.'),
  ('fr', 'new_obs', 'email_missing', 'L''email de votre compte est manquant. Veuillez vous déconnecter et reconnecter.'),
  ('de', 'new_obs', 'email_missing', 'Ihre E-Mail-Adresse fehlt. Bitte abmelden und wieder anmelden.'),
  ('it', 'new_obs', 'email_missing', 'Manca l''email del tuo account. Esci e accedi di nuovo.'),
  ('sv', 'new_obs', 'email_missing', 'Din kontomejl saknas. Logga ut och in igen.'),
  ('fi', 'new_obs', 'email_missing', 'Tilin sähköpostiosoite puuttuu. Kirjaudu ulos ja takaisin sisään.'),
  ('ja', 'new_obs', 'email_missing', 'アカウントのメールアドレスが見つかりません。サインアウトして再度サインインしてください。'),

  -- obs_list.unnamed_resident
  ('en', 'obs_list', 'unnamed_resident', 'Unnamed resident'),
  ('es', 'obs_list', 'unnamed_resident', 'Residente sin nombre'),
  ('fr', 'obs_list', 'unnamed_resident', 'Résident sans nom'),
  ('de', 'obs_list', 'unnamed_resident', 'Unbenannter Bewohner'),
  ('it', 'obs_list', 'unnamed_resident', 'Residente senza nome'),
  ('sv', 'obs_list', 'unnamed_resident', 'Namnlös boende'),
  ('fi', 'obs_list', 'unnamed_resident', 'Nimetön asukas'),
  ('ja', 'obs_list', 'unnamed_resident', '名前のない入居者'),

  -- obs_list.delete_confirm_generic
  ('en', 'obs_list', 'delete_confirm_generic', 'Are you sure you want to delete this observation?'),
  ('es', 'obs_list', 'delete_confirm_generic', '¿Seguro que quieres eliminar esta observación?'),
  ('fr', 'obs_list', 'delete_confirm_generic', 'Êtes-vous sûr de vouloir supprimer cette observation ?'),
  ('de', 'obs_list', 'delete_confirm_generic', 'Möchten Sie diese Beobachtung wirklich löschen?'),
  ('it', 'obs_list', 'delete_confirm_generic', 'Sei sicuro di voler eliminare questa osservazione?'),
  ('sv', 'obs_list', 'delete_confirm_generic', 'Är du säker på att du vill radera denna observation?'),
  ('fi', 'obs_list', 'delete_confirm_generic', 'Haluatko varmasti poistaa tämän havainnon?'),
  ('ja', 'obs_list', 'delete_confirm_generic', 'この観察記録を削除してもよろしいですか？'),

  -- obs_list.delete_success
  ('en', 'obs_list', 'delete_success', 'Observation deleted.'),
  ('es', 'obs_list', 'delete_success', 'Observación eliminada.'),
  ('fr', 'obs_list', 'delete_success', 'Observation supprimée.'),
  ('de', 'obs_list', 'delete_success', 'Beobachtung gelöscht.'),
  ('it', 'obs_list', 'delete_success', 'Osservazione eliminata.'),
  ('sv', 'obs_list', 'delete_success', 'Observation raderad.'),
  ('fi', 'obs_list', 'delete_success', 'Havainto poistettu.'),
  ('ja', 'obs_list', 'delete_success', '観察記録が削除されました。'),

  -- obs_list.delete_error
  ('en', 'obs_list', 'delete_error', 'Failed to delete observation.'),
  ('es', 'obs_list', 'delete_error', 'Error al eliminar la observación.'),
  ('fr', 'obs_list', 'delete_error', 'Échec de la suppression de l''observation.'),
  ('de', 'obs_list', 'delete_error', 'Löschen der Beobachtung fehlgeschlagen.'),
  ('it', 'obs_list', 'delete_error', 'Eliminazione dell''osservazione non riuscita.'),
  ('sv', 'obs_list', 'delete_error', 'Kunde inte radera observation.'),
  ('fi', 'obs_list', 'delete_error', 'Havainnon poistaminen epäonnistui.'),
  ('ja', 'obs_list', 'delete_error', '観察記録の削除に失敗しました。'),

  -- view_obs.load_error
  ('en', 'view_obs', 'load_error', 'Failed to load observation.'),
  ('es', 'view_obs', 'load_error', 'Error al cargar la observación.'),
  ('fr', 'view_obs', 'load_error', 'Échec du chargement de l''observation.'),
  ('de', 'view_obs', 'load_error', 'Beobachtung konnte nicht geladen werden.'),
  ('it', 'view_obs', 'load_error', 'Caricamento dell''osservazione non riuscito.'),
  ('sv', 'view_obs', 'load_error', 'Kunde inte läsa in observation.'),
  ('fi', 'view_obs', 'load_error', 'Havainnon lataaminen epäonnistui.'),
  ('ja', 'view_obs', 'load_error', '観察記録の読み込みに失敗しました。'),

  -- view_obs.no_responses_body
  ('en', 'view_obs', 'no_responses_body', 'No scores were recorded for this observation.'),
  ('es', 'view_obs', 'no_responses_body', 'No se registraron puntuaciones para esta observación.'),
  ('fr', 'view_obs', 'no_responses_body', 'Aucune évaluation n''a été enregistrée pour cette observation.'),
  ('de', 'view_obs', 'no_responses_body', 'Für diese Beobachtung wurden keine Bewertungen erfasst.'),
  ('it', 'view_obs', 'no_responses_body', 'Nessuna valutazione registrata per questa osservazione.'),
  ('sv', 'view_obs', 'no_responses_body', 'Inga poäng registrerades för denna observation.'),
  ('fi', 'view_obs', 'no_responses_body', 'Tälle havainnolle ei tallennettu pisteytyksiä.'),
  ('ja', 'view_obs', 'no_responses_body', 'この観察記録にはスコアが記録されていません。'),

  -- view_obs.print
  ('en', 'view_obs', 'print', 'Print'),
  ('es', 'view_obs', 'print', 'Imprimir'),
  ('fr', 'view_obs', 'print', 'Imprimer'),
  ('de', 'view_obs', 'print', 'Drucken'),
  ('it', 'view_obs', 'print', 'Stampa'),
  ('sv', 'view_obs', 'print', 'Skriv ut'),
  ('fi', 'view_obs', 'print', 'Tulosta'),
  ('ja', 'view_obs', 'print', '印刷'),

  -- view_obs.resident_name
  ('en', 'view_obs', 'resident_name', 'Resident'),
  ('es', 'view_obs', 'resident_name', 'Residente'),
  ('fr', 'view_obs', 'resident_name', 'Résident'),
  ('de', 'view_obs', 'resident_name', 'Bewohner'),
  ('it', 'view_obs', 'resident_name', 'Residente'),
  ('sv', 'view_obs', 'resident_name', 'Boende'),
  ('fi', 'view_obs', 'resident_name', 'Asukas'),
  ('ja', 'view_obs', 'resident_name', '入居者'),

  -- export.error
  ('en', 'export', 'error', 'Export failed. Please try again.'),
  ('es', 'export', 'error', 'Error en la exportación. Inténtalo de nuevo.'),
  ('fr', 'export', 'error', 'Échec de l''export. Veuillez réessayer.'),
  ('de', 'export', 'error', 'Export fehlgeschlagen. Bitte erneut versuchen.'),
  ('it', 'export', 'error', 'Esportazione non riuscita. Riprova.'),
  ('sv', 'export', 'error', 'Export misslyckades. Försök igen.'),
  ('fi', 'export', 'error', 'Vienti epäonnistui. Yritä uudelleen.'),
  ('ja', 'export', 'error', 'エクスポートに失敗しました。もう一度お試しください。')
ON CONFLICT (locale, namespace, key) DO UPDATE
SET value = EXCLUDED.value;
