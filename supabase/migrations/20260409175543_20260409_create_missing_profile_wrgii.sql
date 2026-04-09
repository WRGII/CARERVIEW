/*
  # Create Missing Profile Row for wrgii@yahoo.com

  ## Background
  User wrgii@yahoo.com (UUID: 97197d82-ebcc-4e64-b9de-cd28ee015886) completed
  email confirmation on 2026-04-09 but their profile row was never created in
  public.profiles. This likely occurred because the trg_create_community_profile
  trigger fired but the INSERT on profiles hit the recursive RLS bug (now fixed),
  preventing the profile from being persisted.

  ## Change
  - Insert a profile row for the user using their confirmed auth.users data
  - display_name sourced from their raw_user_meta_data ("William Griffith")
  - role = 'caregiver' (standard new user default)
  - disabled = false
  - No active_team_id (they have no subscription or team yet — correct)

  ## Note
  This is a one-time data backfill for this specific user. The underlying RLS
  recursion bug has been fixed in the preceding migration, so new signups will
  no longer encounter this issue.
*/

INSERT INTO public.profiles (id, email, display_name, role, disabled, preferred_locale)
VALUES (
  '97197d82-ebcc-4e64-b9de-cd28ee015886',
  'wrgii@yahoo.com',
  'William Griffith',
  'caregiver',
  false,
  'en'
)
ON CONFLICT (id) DO NOTHING;
