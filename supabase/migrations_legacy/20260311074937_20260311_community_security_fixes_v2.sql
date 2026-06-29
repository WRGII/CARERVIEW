/*
  # Community Security Fixes v2

  ## Summary
  Addresses three security warnings flagged by the Supabase linter.

  ## Changes

  ### 1. Fix SECURITY DEFINER View - community_posts_public
  The view lacked `security_invoker = true`, causing Postgres to run it with
  the view owner's privileges (SECURITY DEFINER semantics). Setting
  security_invoker = true ensures queries against the view run with the
  calling role's permissions, not the owner's.
  Note: security_barrier is retained to prevent predicate push-down leakage.

  ### 2. Fix Mutable search_path - decrement_community_reply_count
  This SECURITY DEFINER trigger function had no locked search_path, leaving it
  vulnerable to schema-shadowing attacks. Pinning to `public, pg_temp` closes
  that vector, consistent with the pattern in community_security_hardening.

  ### 3. Fix Mutable search_path - community_set_updated_at
  Same class of issue: the trigger function had no explicit search_path set.
  Locking it to `public, pg_temp` eliminates the mutable search_path warning.
*/

ALTER VIEW public.community_posts_public SET (security_invoker = true);

ALTER FUNCTION public.decrement_community_reply_count() SET search_path = public, pg_temp;

ALTER FUNCTION public.community_set_updated_at() SET search_path = public, pg_temp;
