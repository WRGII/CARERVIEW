/*
  # Create Admin Auth User: william.griffith@grifii.com

  ## Summary
  The admin login was failing because the ADMIN_EMAIL secret was set to a different
  email address. This migration directly creates the correct admin auth user and
  profile row so that login works immediately.

  ## Changes
  1. Creates auth.users entry for william.griffith@grifii.com with email confirmed
  2. Creates public.profiles entry with role = 'admin' and disabled = false

  ## Notes
  - Password is intentionally NOT set here (kept as empty/null); the admin-bootstrap
    edge function will set/sync the password on first successful login attempt once
    the ADMIN_EMAIL secret is updated to match this email.
  - The ADMIN_EMAIL secret in Supabase Edge Function settings must be updated to
    'william.griffith@grifii.com' for the bootstrap flow to work end-to-end.
*/

DO $$
DECLARE
  v_uid uuid := gen_random_uuid();
  v_existing_uid uuid;
BEGIN
  SELECT id INTO v_existing_uid
  FROM auth.users
  WHERE email = 'william.griffith@grifii.com';

  IF v_existing_uid IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_uid,
      '00000000-0000-0000-0000-000000000000',
      'william.griffith@grifii.com',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role,
      disabled
    ) VALUES (
      v_uid,
      'william.griffith@grifii.com',
      'Admin',
      'admin',
      false
    )
    ON CONFLICT (id) DO UPDATE
      SET role = 'admin',
          disabled = false,
          email = 'william.griffith@grifii.com';
  ELSE
    UPDATE public.profiles
    SET role = 'admin',
        disabled = false
    WHERE id = v_existing_uid;

    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role,
      disabled
    )
    SELECT v_existing_uid, 'william.griffith@grifii.com', 'Admin', 'admin', false
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_existing_uid);
  END IF;
END $$;
