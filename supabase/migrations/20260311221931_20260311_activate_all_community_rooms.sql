/*
  # Activate All 11 Community Rooms

  ## Summary
  Activates the 4 previously inactive community rooms and reassigns clean,
  non-colliding sort_order values (1–11) across all rooms.

  ## Changes
  - Sets is_active = true for: Daily Care Tips, Practical Advice,
    Diagnosis & Conditions, Equipment & Aids
  - Reassigns sort_order for all 11 rooms to a clean 1–11 sequence

  ## Rooms After Migration
  1. General Support
  2. Tips & Tactics
  3. Emotional Support
  4. Dementia Support
  5. Burnout & Overwhelm
  6. Family Conflict
  7. New to Caregiving
  8. Daily Care Tips
  9. Practical Advice
  10. Diagnosis & Conditions
  11. Equipment & Aids
*/

UPDATE public.community_rooms SET sort_order = 1  WHERE slug = 'general-support';
UPDATE public.community_rooms SET sort_order = 2  WHERE slug = 'tips-and-tactics';
UPDATE public.community_rooms SET sort_order = 3  WHERE slug = 'emotional-support';
UPDATE public.community_rooms SET sort_order = 4  WHERE slug = 'dementia-support';
UPDATE public.community_rooms SET sort_order = 5  WHERE slug = 'burnout-and-overwhelm';
UPDATE public.community_rooms SET sort_order = 6  WHERE slug = 'family-conflict';
UPDATE public.community_rooms SET sort_order = 7  WHERE slug = 'new-to-caregiving';
UPDATE public.community_rooms SET sort_order = 8  WHERE slug = 'daily-care-tips';
UPDATE public.community_rooms SET sort_order = 9  WHERE slug = 'practical-advice';
UPDATE public.community_rooms SET sort_order = 10 WHERE slug = 'diagnosis-questions';
UPDATE public.community_rooms SET sort_order = 11 WHERE slug = 'equipment-and-aids';

UPDATE public.community_rooms
SET is_active = true
WHERE slug IN (
  'daily-care-tips',
  'practical-advice',
  'diagnosis-questions',
  'equipment-and-aids'
);
