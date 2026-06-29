/*
  # Fix Community Rooms Sort Order

  ## Summary
  Several active rooms shared duplicate sort_order values, causing unpredictable
  display ordering on the public Community Hub page. This migration assigns
  unique, sequential sort_order values to all active rooms so they appear in a
  logical, consistent order.

  ## Changes

  ### community_rooms - sort_order updates (active rooms only)
  - General Support       → sort_order 1
  - Tips & Tactics        → sort_order 2
  - Emotional Support     → sort_order 3
  - Dementia Support      → sort_order 4
  - Burnout & Overwhelm   → sort_order 5
  - Family Conflict       → sort_order 6
  - New to Caregiving     → sort_order 7

  Inactive rooms are left at their existing sort_order values as they are not
  displayed publicly and will not cause collisions.

  ## No Data Is Removed
  Only the sort_order column is updated.
*/

UPDATE public.community_rooms SET sort_order = 1 WHERE name = 'General Support';
UPDATE public.community_rooms SET sort_order = 2 WHERE name = 'Tips & Tactics';
UPDATE public.community_rooms SET sort_order = 3 WHERE name = 'Emotional Support';
UPDATE public.community_rooms SET sort_order = 4 WHERE name = 'Dementia Support';
UPDATE public.community_rooms SET sort_order = 5 WHERE name = 'Burnout & Overwhelm';
UPDATE public.community_rooms SET sort_order = 6 WHERE name = 'Family Conflict';
UPDATE public.community_rooms SET sort_order = 7 WHERE name = 'New to Caregiving';
