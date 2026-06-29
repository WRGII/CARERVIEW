/*
  Fix supported_locales table structure - drop NOT NULL on unused columns
*/
ALTER TABLE public.supported_locales ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.supported_locales ALTER COLUMN native_name DROP NOT NULL;
