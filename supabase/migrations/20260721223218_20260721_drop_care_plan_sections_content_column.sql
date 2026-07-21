-- Drop the now-obsolete `content` column from care_plan_sections.
-- The frontend uses `content_json` exclusively; `content` is dead weight.
-- Table is empty, so no data loss.
ALTER TABLE public.care_plan_sections
  DROP COLUMN IF EXISTS content;
