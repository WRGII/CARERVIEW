/*
  # Activate Community Rooms With Seeded Content

  ## Summary
  Several community rooms were seeded with discussion posts but left with
  is_active = false, causing the public Community Hub page to show no content
  for those rooms. This migration activates all rooms that have seeded posts
  so they appear on the public-facing /community-hub page.

  ## Changes

  ### community_rooms
  - Set is_active = true for "Emotional Support" (had 3 posts, was inactive)
  - Confirm the 6 already-active rooms remain active
  - Rooms with no seeded content and no intended audience are left inactive

  ## Affected Rooms
  - Emotional Support: false → true (has 3 seeded posts)

  ## No Data Is Removed
  This migration only updates the is_active flag; no posts, replies, or
  profiles are modified.
*/

UPDATE public.community_rooms
SET is_active = true
WHERE name = 'Emotional Support'
  AND is_active = false;
