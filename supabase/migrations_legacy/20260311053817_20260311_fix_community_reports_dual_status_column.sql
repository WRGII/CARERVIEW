/*
  # Fix community_reports dual status columns

  ## Problem
  The community_reports table has two redundant status columns:
  - `status` (text, default 'pending') — used by the existing index community_reports_status_idx
  - `report_status` (text, default 'pending') — used by the application code

  The app queries and updates `report_status`. The index was built on `status`, which is
  never updated by application code, making the index useless and creating inconsistent state.

  ## Changes
  1. Sync existing `status` values from `report_status` for any rows that diverged
  2. Drop the old index on `status`
  3. Drop the `status` column
  4. Create a new index on `report_status` (the column the app actually uses)

  ## Safety
  - Uses IF EXISTS guards throughout
  - No data is deleted — only a redundant column is dropped
  - The `report_status` column and its constraint are preserved unchanged
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_reports'
      AND column_name = 'status'
  ) THEN
    UPDATE public.community_reports
    SET status = report_status
    WHERE status IS DISTINCT FROM report_status;
  END IF;
END $$;

DROP INDEX IF EXISTS public.community_reports_status_idx;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_reports'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.community_reports DROP COLUMN status;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS community_reports_report_status_idx
  ON public.community_reports (report_status, created_at DESC);
