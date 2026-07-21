/*
# Fix care_plan_sections schema to match frontend contract

## Problem
The frontend (useCarePlan.ts / SectionFormModal.tsx) upserts and reads:
  - section_key        (text)
  - content_json       (jsonb)
  - completion_status   (text: 'not_started' | 'in_progress' | 'complete')
and relies on a unique constraint on (care_plan_id, section_key) for
onConflict upserts.

But the table was created with:
  - section_type   (text)   -- NOT section_key
  - title          (text)   -- unused by frontend
  - content        (jsonb)  -- NOT content_json
  - sort_order     (integer)-- unused by frontend
  -- no completion_status column

Every save therefore fails with a Postgres column-does-not-exist error,
surfaced to the user as "Save failed. Please check your connection..."

The table currently has 0 rows (verified), so this is a pure schema
alignment with no data migration.

## Approach
- Add the frontend-expected columns: section_key, content_json,
  completion_status (with CHECK constraint).
- Add UNIQUE(care_plan_id, section_key) so the upsert onConflict works.
- Drop the obsolete columns: section_type, title, sort_order.
- Add an index on care_plan_id for the list query.

## Security
- RLS policies reference care_plan_id only, which is unchanged; they
  remain valid. No policy changes needed.
*/

-- 1. Add the columns the frontend uses
ALTER TABLE public.care_plan_sections
  ADD COLUMN IF NOT EXISTS section_key text NOT NULL DEFAULT '';
ALTER TABLE public.care_plan_sections
  ADD COLUMN IF NOT EXISTS content_json jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.care_plan_sections
  ADD COLUMN IF NOT EXISTS completion_status text NOT NULL DEFAULT 'not_started'
    CHECK (completion_status IN ('not_started', 'in_progress', 'complete'));

-- 2. Unique constraint for upsert onConflict
ALTER TABLE public.care_plan_sections
  DROP CONSTRAINT IF EXISTS care_plan_sections_care_plan_id_section_key_key;
ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_care_plan_id_section_key_key
    UNIQUE (care_plan_id, section_key);

-- 3. Drop obsolete columns (table is empty; no data loss)
ALTER TABLE public.care_plan_sections
  DROP COLUMN IF EXISTS section_type;
ALTER TABLE public.care_plan_sections
  DROP COLUMN IF EXISTS title;
ALTER TABLE public.care_plan_sections
  DROP COLUMN IF EXISTS sort_order;

-- 4. Index for the list-by-care-plan query
CREATE INDEX IF NOT EXISTS care_plan_sections_care_plan_id_idx
  ON public.care_plan_sections (care_plan_id);
