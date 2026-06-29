/*
  # Community Room Updates

  ## Summary
  Updates community discussion rooms per product requirements:

  ## Changes

  ### Deactivated Rooms
  - General Support (slug: general-support) — set is_active = false
  - Daily Care Tips (slug: daily-care-tips) — set is_active = false

  ### Renamed Rooms
  - "Dementia Support" → "Memory & Dementia"
  - "Practical Advice" → "Finances & Practical Advice"
  - "Emotional Support" → "Self-Care & Boundaries"

  ### Re-ordered Active Rooms (sort_order 1–8)
  1. New to Caregiving
  2. Memory & Dementia
  3. Burnout & Overwhelm
  4. Finances & Practical Advice
  5. Self-Care & Boundaries
  6. Family Conflict
  7. Diagnosis & Conditions
  8. Equipment & Aids

  ### Updated Colors
  Each active room receives a unique muted green colour to create visual identity
  across room headers, using harmonious shades that complement the site's teal/cyan palette.
*/

-- Deactivate removed rooms
UPDATE community_rooms SET is_active = false WHERE slug = 'general-support';
UPDATE community_rooms SET is_active = false WHERE slug = 'daily-care-tips';

-- Rename rooms
UPDATE community_rooms SET name = 'Memory & Dementia' WHERE slug = 'dementia-support';
UPDATE community_rooms SET name = 'Finances & Practical Advice' WHERE slug = 'practical-advice';
UPDATE community_rooms SET name = 'Self-Care & Boundaries' WHERE slug = 'emotional-support';

-- Re-order and assign unique muted green colours to all active rooms
-- New to Caregiving: sage green
UPDATE community_rooms
SET sort_order = 1, color = '#5F9EA0'
WHERE slug = 'new-to-caregiving';

-- Memory & Dementia: soft teal-green
UPDATE community_rooms
SET sort_order = 2, color = '#4A9C7E'
WHERE slug = 'dementia-support';

-- Burnout & Overwhelm: muted olive-green
UPDATE community_rooms
SET sort_order = 3, color = '#6B8F71'
WHERE slug = 'burnout-and-overwhelm';

-- Finances & Practical Advice: fern green
UPDATE community_rooms
SET sort_order = 4, color = '#5A8A5A'
WHERE slug = 'practical-advice';

-- Self-Care & Boundaries: celadon green
UPDATE community_rooms
SET sort_order = 5, color = '#7BAE8A'
WHERE slug = 'emotional-support';

-- Family Conflict: moss green
UPDATE community_rooms
SET sort_order = 6, color = '#6B8C6B'
WHERE slug = 'family-conflict';

-- Diagnosis & Conditions: sea green
UPDATE community_rooms
SET sort_order = 7, color = '#4E8A74'
WHERE slug = 'diagnosis-questions';

-- Equipment & Aids: hunter green (lighter shade)
UPDATE community_rooms
SET sort_order = 8, color = '#6B9966'
WHERE slug = 'equipment-and-aids';
