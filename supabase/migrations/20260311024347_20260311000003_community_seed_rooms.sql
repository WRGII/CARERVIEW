/*
  # Caregiver Community - Seed Rooms

  ## Overview
  Seeds the 6 required community discussion rooms for CarerView's Caregiver Community feature.
  Replaces the prior 5-room seed with the product-approved set.

  ## Rooms Created
  1. General Support       - Broad support discussions
  2. Tips & Tactics        - Practical caregiving techniques
  3. Dementia Support      - Dementia-specific discussions
  4. Burnout & Overwhelm   - Emotional health and self-care
  5. Family Conflict       - Navigating family dynamics
  6. New to Caregiving     - Newcomer support and orientation

  ## Notes
  - Uses INSERT ... ON CONFLICT DO UPDATE to safely re-run
  - Preserves post_count if rooms already exist
  - Slugs are URL-safe and permanent (do not change slugs after frontend routes them)
*/

INSERT INTO public.community_rooms (slug, name, description, icon_name, color, sort_order, is_active)
VALUES
  (
    'general-support',
    'General Support',
    'A welcoming space for all caregivers. Share your story, ask anything, and find others who understand what you''re going through.',
    'MessageCircle',
    '#00BCD4',
    1,
    true
  ),
  (
    'tips-and-tactics',
    'Tips & Tactics',
    'Share practical techniques, routines, and day-to-day strategies that make caregiving easier for everyone.',
    'Lightbulb',
    '#FFB74D',
    2,
    true
  ),
  (
    'dementia-support',
    'Dementia Support',
    'A dedicated space for caregivers supporting someone with dementia or cognitive decline. Share experiences and find guidance.',
    'Brain',
    '#81C784',
    3,
    true
  ),
  (
    'burnout-and-overwhelm',
    'Burnout & Overwhelm',
    'Honest conversations about caregiver fatigue, stress, and self-care. You are not alone — this is a safe space to be real.',
    'Heart',
    '#E57373',
    4,
    true
  ),
  (
    'family-conflict',
    'Family Conflict',
    'Navigating disagreements, unequal sharing of care responsibilities, and difficult family dynamics. Get support from those who understand.',
    'Users',
    '#7986CB',
    5,
    true
  ),
  (
    'new-to-caregiving',
    'New to Caregiving',
    'Just starting out? This room is for questions, orientation, and connecting with experienced caregivers who can help you find your footing.',
    'Compass',
    '#4DB6AC',
    6,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name   = EXCLUDED.icon_name,
  color       = EXCLUDED.color,
  sort_order  = EXCLUDED.sort_order,
  is_active   = EXCLUDED.is_active;

-- Deactivate old rooms that are no longer in the required set
UPDATE public.community_rooms
SET is_active = false
WHERE slug IN ('daily-care-tips', 'emotional-support', 'practical-advice', 'diagnosis-questions', 'equipment-and-aids');
