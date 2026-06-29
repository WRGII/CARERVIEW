/*
  Fix cv_team_patient: add resident profile extension columns
*/
ALTER TABLE public.cv_team_patient
  ADD COLUMN IF NOT EXISTS birthplace text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_preference text DEFAULT '',
  ADD COLUMN IF NOT EXISTS relationship_status text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cultural_preferences text DEFAULT '',
  ADD COLUMN IF NOT EXISTS language_preferences text DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_me text DEFAULT '';
