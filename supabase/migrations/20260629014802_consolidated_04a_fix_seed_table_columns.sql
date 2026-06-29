/*
  Consolidated Schema - Part 4a: Fix seed-related table columns
*/

-- ===== FIX: supported_locales =====
-- Needs: label, is_active, is_default, sort_order (instead of name, native_name, enabled)
ALTER TABLE public.supported_locales
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0 NOT NULL;

-- Migrate existing columns if needed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supported_locales' AND column_name='name') THEN
    UPDATE public.supported_locales SET label = name WHERE label IS NULL;
  END IF;
END$$;

-- ===== FIX: legend - add translations jsonb column =====
ALTER TABLE public.legend
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';

-- ===== FIX: categories - add translations jsonb column =====
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';

-- ===== FIX: questions - add translations jsonb column =====
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';

-- ===== FIX: community_rooms - add icon_name, color columns =====
ALTER TABLE public.community_rooms
  ADD COLUMN IF NOT EXISTS icon_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#00BCD4',
  ADD COLUMN IF NOT EXISTS name text;

-- Rename title to name if title exists and name doesn't have data
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_rooms' AND column_name='title') THEN
    UPDATE public.community_rooms SET name = title WHERE name IS NULL;
    ALTER TABLE public.community_rooms DROP COLUMN IF EXISTS title;
  END IF;
END$$;

-- If name column doesn't exist but was supposed to replace title, handle gracefully
-- Actually the table was created with 'title' - let me just add name and keep both for now
-- The seed uses 'name' column
