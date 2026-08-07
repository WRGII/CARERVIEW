-- F28: these functions all assume a signed-in caller (auth.uid()). Leaving EXECUTE
-- granted to the anonymous API role means an unauthenticated request can invoke them
-- directly. The genuinely public entry points (invite peek, guest token peek, guest
-- observation submit, public community stats, translations) keep their anon grant.

DO $$
DECLARE
  fn text;
  names text[] := ARRAY[
    'cv_accept_invite(text)',
    'cv_check_team_seats(uuid)',
    'cv_create_guest_token(uuid,text,text,text,text)',
    'cv_create_invite(uuid,text)',
    'cv_create_team_with_patient(text,text,text,date,cv_gender,text)',
    'cv_get_active_team()',
    'cv_get_remaining(uuid)',
    'cv_get_solo_remaining()',
    'cv_get_team_patient(uuid)',
    'cv_list_invites(uuid)',
    'cv_list_members(uuid)',
    'cv_remove_member(uuid,uuid)',
    'cv_revoke_invite(uuid)',
    'cv_set_active_team(uuid)',
    'cv_sync_resident_to_memory_book_identity(uuid)',
    'get_active_team_ids()',
    'get_user_team_ids()',
    'is_admin()',
    'is_team_member(uuid)',
    'is_team_owner(uuid)',
    'mb_get_or_create(uuid)'
  ];
BEGIN
  FOREACH fn IN ARRAY names LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skipping missing function %', fn;
    END;
  END LOOP;
END $$;
