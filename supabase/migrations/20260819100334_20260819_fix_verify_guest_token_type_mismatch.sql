/*
# Fix type mismatch in cv_verify_guest_token_for_sender

## Problem
The `cv_verify_guest_token_for_sender` function compares `cv_guest_tokens.token_hash` (text column)
with `digest(p_token, 'sha256')` which returns bytea. This causes:
  "operator does not exist: text = bytea"

## Fix
Changed the comparison to use `encode(digest(p_token, 'sha256'), 'hex')` which produces a text value,
matching the column type and the format used by `cv_create_guest_token` when inserting.

## Security
- No RLS or policy changes.
- Function remains SECURITY DEFINER, STABLE, same search_path.
- Logic unchanged apart from the type-correct comparison.
*/

CREATE OR REPLACE FUNCTION public.cv_verify_guest_token_for_sender(p_token text, p_email text, p_sender uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_tok record;
  v_sender_name text;
BEGIN
  IF p_token IS NULL OR length(p_token) = 0 OR p_email IS NULL THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  SELECT g.* INTO v_tok
  FROM public.cv_guest_tokens g
  WHERE g.token_hash = encode(digest(p_token, 'sha256'), 'hex')
  AND g.consumed_at IS NULL
  AND g.expires_at > now()
  AND g.invited_by_user_id = p_sender
  AND (g.guest_email IS NULL OR lower(g.guest_email) = lower(p_email));

  IF v_tok.id IS NULL THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  SELECT COALESCE(NULLIF(TRIM(pr.display_name), ''), 'A CarerView caregiver')
  INTO v_sender_name
  FROM public.profiles pr WHERE pr.id = p_sender;

  RETURN jsonb_build_object(
    'valid', true,
    'resident_name', COALESCE(NULLIF(TRIM(v_tok.resident_name), ''), 'your loved one'),
    'inviter_name', COALESCE(v_sender_name, 'A CarerView caregiver')
  );
END;
$function$;