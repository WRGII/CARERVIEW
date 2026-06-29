/*
  # Create Missing Profile Row for william.griffith@grifii.com

  ## Problem
  The user william.griffith@grifii.com (UUID: 93b616e0-057c-4d97-88e6-44adc167a7ed)
  was created in auth.users but has no corresponding row in public.profiles.

  On first login, useAuth calls upsertProfile() which attempts an INSERT via the
  profiles_insert_own RLS policy. This INSERT was likely blocked by the now-fixed
  infinite-recursion bug in profiles_update_own, or occurred before the insert
  policy existed.

  Without a profile row:
  - profile is null in useAuth
  - useObservations has enabled: !!user?.id && !!profile — never fires
  - Dashboard shows "Failed to load observations"

  ## Fix
  Insert the missing profile row directly. Uses ON CONFLICT DO NOTHING as a safety net.

  ## Tables Modified
  - profiles — one row inserted
*/

INSERT INTO public.profiles (id, email, display_name, role, disabled)
VALUES (
  '93b616e0-057c-4d97-88e6-44adc167a7ed',
  'william.griffith@grifii.com',
  'William Griffith',
  'caregiver',
  false
)
ON CONFLICT (id) DO NOTHING;
