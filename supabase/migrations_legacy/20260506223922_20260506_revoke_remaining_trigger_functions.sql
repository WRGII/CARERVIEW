/*
  # Revoke anon/authenticated EXECUTE from remaining trigger functions

  These four trigger functions were not in the original audit report but
  share the same issue: they are called only by Postgres trigger events
  and should not be executable via /rest/v1/rpc/ by any client role.

  get_translations_for_locale is intentionally kept as-is — it is a
  legitimate public RPC called by the i18n layer for unauthenticated pages.
*/

REVOKE EXECUTE ON FUNCTION public.community_on_reply_update()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.community_set_updated_at()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.set_care_plan_updated_at()
  FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.set_updated_at()
  FROM anon, authenticated;
