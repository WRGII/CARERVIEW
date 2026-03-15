/*
  # Fix Team Invites UPDATE RLS Policy - Remove USING(true)

  ## Problem
  The "invites_update_on_accept" policy used USING(true) which allowed ANY
  authenticated user to update ANY invite row (e.g., mark someone else's invite
  as consumed, or consume invites they were never sent). This is a critical
  security vulnerability.

  ## Fix
  Replace USING(true) with a proper check: the user may only update an invite
  that was sent to their own email address, and only to mark it consumed.

  ## Security Impact
  - Before: Any authenticated user could update any invite row
  - After: Users can only consume invites addressed to their own email
*/

DROP POLICY IF EXISTS "invites_update_on_accept" ON public.cv_team_invites;

CREATE POLICY "invites_update_on_accept"
  ON public.cv_team_invites
  FOR UPDATE
  TO authenticated
  USING (
    email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    AND consumed_at IS NULL
    AND expires_at > now()
  )
  WITH CHECK (consumed_at IS NOT NULL);
