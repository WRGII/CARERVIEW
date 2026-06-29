/*
  # Tighten cv_team_invites UPDATE RLS policy

  ## Problem
  The existing "invites_update_on_accept" policy uses USING (true), which allows any
  authenticated user to attempt an UPDATE on any invite row via direct SQL.
  Although the cv_accept_invite() SECURITY DEFINER function bypasses RLS entirely,
  the permissive USING clause is still a security risk for direct API access.

  ## Fix
  Replace USING (true) with USING (consumed_at IS NULL AND expires_at > now()).
  This restricts direct UPDATE attempts to only invite rows that:
    1. Have not already been consumed
    2. Have not expired

  The cv_accept_invite() SECURITY DEFINER function is unaffected (it bypasses RLS).
  This change hardens the direct-API path only.

  ## Changes
  - Drop "invites_update_on_accept" policy
  - Re-create with restrictive USING clause
*/

DROP POLICY IF EXISTS "invites_update_on_accept" ON public.cv_team_invites;

CREATE POLICY "invites_update_on_accept"
  ON public.cv_team_invites
  FOR UPDATE
  TO authenticated
  USING (consumed_at IS NULL AND expires_at > now())
  WITH CHECK (consumed_at IS NOT NULL);
