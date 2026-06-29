/*
  Consolidated Schema - Part 1b: Fix table definitions to match actual schemas
  Corrects cv_guest_tokens, rate_limit_log, webhook_events, community_profiles,
  memory_book_identity, and memory_books schemas.
*/

-- ===== FIX: cv_guest_tokens =====
-- Drop the incorrect table and recreate with proper schema
DROP TABLE IF EXISTS public.cv_guest_tokens;
CREATE TABLE public.cv_guest_tokens (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash           text UNIQUE NOT NULL,
  team_id              uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  resident_name        text NOT NULL,
  form_type            text NOT NULL CHECK (form_type IN ('ADL', 'IADL', 'COMPREHENSIVE')),
  guest_name           text,
  guest_email          text,
  invited_by_user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observation_id       uuid REFERENCES public.observations(id) ON DELETE SET NULL,
  expires_at           timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  consumed_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ===== FIX: rate_limit_log =====
DROP TABLE IF EXISTS public.rate_limit_log;
CREATE TABLE public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== FIX: webhook_events =====
DROP TABLE IF EXISTS public.webhook_events;
CREATE TABLE public.webhook_events (
  event_id     text PRIMARY KEY,
  event_type   text NOT NULL,
  status       text NOT NULL DEFAULT 'completed',
  processed_at timestamptz DEFAULT now()
);

-- ===== FIX: community_profiles =====
-- Add missing columns
ALTER TABLE public.community_profiles
  ADD COLUMN IF NOT EXISTS handle text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#00BCD4',
  ADD COLUMN IF NOT EXISTS post_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reply_count integer NOT NULL DEFAULT 0;

-- Rename id to user_id concept - community_profiles.id already references auth.users via PK
-- Add handle constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'community_profiles_handle_length') THEN
    ALTER TABLE public.community_profiles ADD CONSTRAINT community_profiles_handle_length CHECK (char_length(handle) BETWEEN 3 AND 30);
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'community_profiles_handle_format') THEN
    ALTER TABLE public.community_profiles ADD CONSTRAINT community_profiles_handle_format CHECK (handle ~ '^[a-zA-Z0-9_\-]+$');
  END IF;
END$$;

-- Create unique index on handle
CREATE UNIQUE INDEX IF NOT EXISTS community_profiles_handle_unique ON public.community_profiles(handle);

-- ===== FIX: memory_book_identity =====
-- Drop and recreate with correct schema (team_id, birthplace, etc.)
DROP TABLE IF EXISTS public.memory_book_identity;
CREATE TABLE public.memory_book_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  preferred_name text DEFAULT '' NOT NULL,
  birthplace text DEFAULT '' NOT NULL,
  address_preference text DEFAULT '' NOT NULL,
  relationship_status text DEFAULT '' NOT NULL,
  cultural_preferences text DEFAULT '' NOT NULL,
  language_preferences text DEFAULT '' NOT NULL,
  about_me text DEFAULT '' NOT NULL,
  photo_url text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (memory_book_id)
);

-- ===== FIX: memory_books =====
-- Add missing columns (created_by, updated_by) and fix unique constraint
ALTER TABLE public.memory_books
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Rename resident_id since it was originally patient_id then renamed
-- The column already exists as resident_id from part 1, which is correct

-- Add combined unique constraint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memory_books_team_id_resident_id_key') THEN
    ALTER TABLE public.memory_books ADD CONSTRAINT memory_books_team_id_resident_id_key UNIQUE (team_id, resident_id);
  END IF;
END$$;

-- Drop the simpler team_id unique if it conflicts
-- Actually the single team_id unique is fine since one memory book per team
