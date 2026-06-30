-- Drop and recreate cv_list_members_with_profile to add name column and fix empty-string display
DROP FUNCTION IF EXISTS public.cv_list_members_with_profile(uuid);

CREATE FUNCTION public.cv_list_members_with_profile(p_team uuid)
RETURNS TABLE(
  user_id      uuid,
  role         cv_member_role,
  state        cv_member_state,
  joined_at    timestamptz,
  display_name text,
  name         text,
  email        text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.user_id,
    m.role,
    m.state,
    m.joined_at,
    COALESCE(NULLIF(TRIM(p.display_name), ''), p.email, 'Unknown') AS display_name,
    NULLIF(TRIM(p.display_name), '')                               AS name,
    COALESCE(p.email, '')                                          AS email
  FROM cv_team_members m
  JOIN profiles p ON p.id = m.user_id
  WHERE m.team_id = p_team
  ORDER BY m.joined_at;
$$;

-- Seed missing team.* translations (all 8 locales, 7 keys)
INSERT INTO public.ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'team.how_it_works_body',   'Each caregiver you add can log observations, complete tasks, and stay in sync with the rest of the team. Everyone sees the same care record in real time.'),
  ('en', 'common', 'team.invite_description',  'Enter an email address to send a secure invitation link. The recipient will be able to join this care team after creating or signing in to their account.'),
  ('en', 'common', 'team.invite_failed',        'Failed to send the invitation. Please try again.'),
  ('en', 'common', 'team.load_failed',          'Failed to load team members. Please refresh the page.'),
  ('en', 'common', 'team.remove_failed',        'Failed to remove the member. Please try again.'),
  ('en', 'common', 'team.revoke_failed',        'Failed to revoke the invitation. Please try again.'),
  ('en', 'common', 'team.revoke_invite',        'Revoke Invitation'),
  ('es', 'common', 'team.how_it_works_body',   'Cada cuidador que agregues puede registrar observaciones, completar tareas y mantenerse sincronizado con el resto del equipo. Todos ven el mismo historial de cuidados en tiempo real.'),
  ('es', 'common', 'team.invite_description',  'Ingresa una dirección de correo para enviar un enlace de invitación seguro. El destinatario podrá unirse a este equipo de cuidado después de crear o iniciar sesión en su cuenta.'),
  ('es', 'common', 'team.invite_failed',        'No se pudo enviar la invitación. Por favor, inténtalo de nuevo.'),
  ('es', 'common', 'team.load_failed',          'No se pudieron cargar los miembros del equipo. Por favor, actualiza la página.'),
  ('es', 'common', 'team.remove_failed',        'No se pudo eliminar al miembro. Por favor, inténtalo de nuevo.'),
  ('es', 'common', 'team.revoke_failed',        'No se pudo revocar la invitación. Por favor, inténtalo de nuevo.'),
  ('es', 'common', 'team.revoke_invite',        'Revocar invitación'),
  ('fr', 'common', 'team.how_it_works_body',   'Chaque soignant que vous ajoutez peut enregistrer des observations, effectuer des tâches et rester synchronisé avec le reste de l''équipe. Tout le monde voit le même dossier de soins en temps réel.'),
  ('fr', 'common', 'team.invite_description',  'Saisissez une adresse e-mail pour envoyer un lien d''invitation sécurisé. Le destinataire pourra rejoindre cette équipe de soins après avoir créé ou s''être connecté à son compte.'),
  ('fr', 'common', 'team.invite_failed',        'L''envoi de l''invitation a échoué. Veuillez réessayer.'),
  ('fr', 'common', 'team.load_failed',          'Impossible de charger les membres de l''équipe. Veuillez actualiser la page.'),
  ('fr', 'common', 'team.remove_failed',        'Impossible de supprimer le membre. Veuillez réessayer.'),
  ('fr', 'common', 'team.revoke_failed',        'Impossible de révoquer l''invitation. Veuillez réessayer.'),
  ('fr', 'common', 'team.revoke_invite',        'Révoquer l''invitation'),
  ('de', 'common', 'team.how_it_works_body',   'Jede Pflegeperson, die Sie hinzufügen, kann Beobachtungen protokollieren, Aufgaben erledigen und sich mit dem Rest des Teams synchronisieren. Alle sehen denselben Pflegeplan in Echtzeit.'),
  ('de', 'common', 'team.invite_description',  'Geben Sie eine E-Mail-Adresse ein, um einen sicheren Einladungslink zu senden. Der Empfänger kann dem Pflegeteam beitreten, nachdem er ein Konto erstellt oder sich angemeldet hat.'),
  ('de', 'common', 'team.invite_failed',        'Die Einladung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'),
  ('de', 'common', 'team.load_failed',          'Die Teammitglieder konnten nicht geladen werden. Bitte aktualisieren Sie die Seite.'),
  ('de', 'common', 'team.remove_failed',        'Das Mitglied konnte nicht entfernt werden. Bitte versuchen Sie es erneut.'),
  ('de', 'common', 'team.revoke_failed',        'Die Einladung konnte nicht widerrufen werden. Bitte versuchen Sie es erneut.'),
  ('de', 'common', 'team.revoke_invite',        'Einladung widerrufen'),
  ('it', 'common', 'team.how_it_works_body',   'Ogni caregiver che aggiungi può registrare osservazioni, completare attività e rimanere sincronizzato con il resto del team. Tutti vedono lo stesso piano di cura in tempo reale.'),
  ('it', 'common', 'team.invite_description',  'Inserisci un indirizzo email per inviare un link di invito sicuro. Il destinatario potrà unirsi a questo team di cura dopo aver creato o effettuato l''accesso al proprio account.'),
  ('it', 'common', 'team.invite_failed',        'Impossibile inviare l''invito. Per favore riprova.'),
  ('it', 'common', 'team.load_failed',          'Impossibile caricare i membri del team. Per favore aggiorna la pagina.'),
  ('it', 'common', 'team.remove_failed',        'Impossibile rimuovere il membro. Per favore riprova.'),
  ('it', 'common', 'team.revoke_failed',        'Impossibile revocare l''invito. Per favore riprova.'),
  ('it', 'common', 'team.revoke_invite',        'Revoca invito'),
  ('sv', 'common', 'team.how_it_works_body',   'Varje vårdgivare du lägger till kan logga observationer, slutföra uppgifter och hålla sig synkroniserade med resten av teamet. Alla ser samma vårdjournal i realtid.'),
  ('sv', 'common', 'team.invite_description',  'Ange en e-postadress för att skicka en säker inbjudningslänk. Mottagaren kan gå med i detta vårdteam efter att ha skapat eller loggat in på sitt konto.'),
  ('sv', 'common', 'team.invite_failed',        'Det gick inte att skicka inbjudan. Försök igen.'),
  ('sv', 'common', 'team.load_failed',          'Det gick inte att ladda teammedlemmar. Uppdatera sidan.'),
  ('sv', 'common', 'team.remove_failed',        'Det gick inte att ta bort medlemmen. Försök igen.'),
  ('sv', 'common', 'team.revoke_failed',        'Det gick inte att återkalla inbjudan. Försök igen.'),
  ('sv', 'common', 'team.revoke_invite',        'Återkalla inbjudan'),
  ('fi', 'common', 'team.how_it_works_body',   'Jokainen lisäämäsi hoitaja voi kirjata havaintoja, suorittaa tehtäviä ja pysyä synkronoituna muun tiimin kanssa. Kaikki näkevät saman hoitokirjanpidon reaaliajassa.'),
  ('fi', 'common', 'team.invite_description',  'Syötä sähköpostiosoite lähettääksesi turvallisen kutsulinkin. Vastaanottaja voi liittyä tähän hoitotiimiin luotuaan tilin tai kirjauduttuaan sisään.'),
  ('fi', 'common', 'team.invite_failed',        'Kutsun lähettäminen epäonnistui. Yritä uudelleen.'),
  ('fi', 'common', 'team.load_failed',          'Tiimin jäsenten lataaminen epäonnistui. Päivitä sivu.'),
  ('fi', 'common', 'team.remove_failed',        'Jäsenen poistaminen epäonnistui. Yritä uudelleen.'),
  ('fi', 'common', 'team.revoke_failed',        'Kutsun peruuttaminen epäonnistui. Yritä uudelleen.'),
  ('fi', 'common', 'team.revoke_invite',        'Peruuta kutsu'),
  ('ja', 'common', 'team.how_it_works_body',   '追加した各介護者は、観察を記録し、タスクを完了し、チームの他のメンバーと同期を保つことができます。全員がリアルタイムで同じケア記録を確認できます。'),
  ('ja', 'common', 'team.invite_description',  'メールアドレスを入力して安全な招待リンクを送信してください。受信者はアカウントを作成またはサインインした後、このケアチームに参加できます。'),
  ('ja', 'common', 'team.invite_failed',        '招待状の送信に失敗しました。もう一度お試しください。'),
  ('ja', 'common', 'team.load_failed',          'チームメンバーの読み込みに失敗しました。ページを更新してください。'),
  ('ja', 'common', 'team.remove_failed',        'メンバーの削除に失敗しました。もう一度お試しください。'),
  ('ja', 'common', 'team.revoke_failed',        '招待の取り消しに失敗しました。もう一度お試しください。'),
  ('ja', 'common', 'team.revoke_invite',        '招待を取り消す')
ON CONFLICT ON CONSTRAINT ui_translations_locale_namespace_key_key DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();
