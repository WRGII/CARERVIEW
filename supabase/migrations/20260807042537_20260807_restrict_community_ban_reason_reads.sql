-- F14: ban_reason is moderator-only context about another member. Table-level SELECT
-- published it to every signed-in member (and to anon on the public hub).
-- Keep every other column readable exactly as before; expose ban_reason only through
-- an admin-gated function.

REVOKE SELECT ON TABLE public.community_profiles FROM anon, authenticated;

GRANT SELECT (
  user_id, display_name, handle, avatar_url, avatar_color, bio,
  guidelines_accepted_at, handle_is_auto_generated, post_count, reply_count,
  created_at, updated_at, is_banned
) ON TABLE public.community_profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.community_get_ban_reasons(p_user_ids uuid[])
RETURNS TABLE (user_id uuid, ban_reason text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT cp.user_id, cp.ban_reason
  FROM public.community_profiles cp
  WHERE cp.user_id = ANY (COALESCE(p_user_ids, ARRAY[]::uuid[]));
END;
$function$;

REVOKE ALL ON FUNCTION public.community_get_ban_reasons(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.community_get_ban_reasons(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.community_get_ban_reasons(uuid[]) TO authenticated, service_role;
