-- Add missing updated_at column to cv_team_patient
ALTER TABLE public.cv_team_patient
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill existing rows
UPDATE public.cv_team_patient
  SET updated_at = created_at
  WHERE updated_at = now() AND created_at < now();

-- Attach the existing set_updated_at trigger
CREATE TRIGGER set_cv_team_patient_updated_at
  BEFORE UPDATE ON public.cv_team_patient
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
