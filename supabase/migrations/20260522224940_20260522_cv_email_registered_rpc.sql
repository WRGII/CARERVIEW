/*
  # Add cv_email_registered public RPC

  ## Purpose
  Allows the unauthenticated invite-setup page to check whether a given email
  address already has a registered CarerView account, so the UI can lock the
  form to either "sign in" or "create account" mode — never showing both tabs.

  ## Details
  - New function: `cv_email_registered(p_email text) → boolean`
  - Security definer so anon role can query auth.users without direct access
  - Returns true if the email exists in auth.users (case-insensitive), false otherwise
  - Grants EXECUTE to anon and authenticated roles
  - Search path is locked to public,auth to prevent search-path injection
*/

CREATE OR REPLACE FUNCTION public.cv_email_registered(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(p_email)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cv_email_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cv_email_registered(text) TO anon, authenticated;
