/*
  Consolidated Schema - Part 3a: Fix community + memory book table columns
  Adding missing columns identified from triggers and RLS policies.
*/

-- ===== COMMUNITY TABLE FIXES =====

-- community_rooms: add post_count and is_active
ALTER TABLE public.community_rooms
  ADD COLUMN IF NOT EXISTS post_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- community_posts: rename/add columns for triggers
-- The triggers reference: post_status (not status), author_user_id (not author_id), reply_count, reaction_count
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS reply_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_count integer NOT NULL DEFAULT 0;

-- Rename status->post_status: community_posts uses post_status enum via the 'status' column
-- Actually the column IS named 'status' of type post_status. The triggers reference NEW.post_status
-- which means the column is likely named post_status. Let me check by renaming.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'status') THEN
    ALTER TABLE public.community_posts RENAME COLUMN status TO post_status;
  END IF;
END$$;

-- community_posts: rename author_id to author_user_id for trigger compatibility
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'author_id') THEN
    ALTER TABLE public.community_posts RENAME COLUMN author_id TO author_user_id;
  END IF;
END$$;

-- community_replies: rename status->reply_status, author_id->author_user_id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_replies' AND column_name = 'status') THEN
    ALTER TABLE public.community_replies RENAME COLUMN status TO reply_status;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_replies' AND column_name = 'author_id') THEN
    ALTER TABLE public.community_replies RENAME COLUMN author_id TO author_user_id;
  END IF;
END$$;

-- community_reports: rename reporter_id->reporter_user_id, add report_status
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_reports' AND column_name = 'reporter_id') THEN
    ALTER TABLE public.community_reports RENAME COLUMN reporter_id TO reporter_user_id;
  END IF;
END$$;

ALTER TABLE public.community_reports
  ADD COLUMN IF NOT EXISTS report_status text NOT NULL DEFAULT 'open';

-- community_profiles: add user_id alias approach - the trigger inserts with id column
-- The triggers reference community_profiles.user_id for counter updates
-- So we need a user_id column that equals id. Actually let's just add it as a generated column alias.
-- Simpler approach: the trigger functions reference WHERE user_id = NEW.author_user_id
-- This means community_profiles likely has user_id column, not id PK named 'id'.
-- Let me add a user_id column that mirrors the PK for trigger compatibility.
-- Actually let's just rename the PK to avoid confusion. But we can't easily rename PKs with FKs.
-- Instead let's add a computed column alias or just use the id.
-- Best approach: update the trigger functions to reference 'id' instead.
-- But we already created the trigger functions... 
-- Let me just add a user_id column as a generated stored column:
-- Actually PostgreSQL generated columns can't reference other columns easily for this pattern.
-- Simplest fix: Add a user_id column and keep it in sync, OR create a view.
-- Actually, the cleanest solution is to just add user_id as a nullable column 
-- and use a trigger to keep it = id. BUT that's overly complex.
-- Let me just drop and recreate the community_profiles with user_id as the PK name.

-- First drop dependent objects (constraints from other tables referencing community_profiles(id))
ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_author_id_fkey;
ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_author_user_id_fkey;
ALTER TABLE public.community_replies DROP CONSTRAINT IF EXISTS community_replies_author_id_fkey;
ALTER TABLE public.community_replies DROP CONSTRAINT IF EXISTS community_replies_author_user_id_fkey;
ALTER TABLE public.community_reactions DROP CONSTRAINT IF EXISTS community_reactions_user_id_fkey;

-- Drop the old table and recreate with user_id as PK column name
DROP TABLE IF EXISTS public.community_profiles CASCADE;

CREATE TABLE public.community_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  handle text NOT NULL DEFAULT '',
  avatar_url text,
  avatar_color text DEFAULT '#00BCD4',
  bio text DEFAULT '',
  guidelines_accepted_at timestamptz,
  handle_is_auto_generated boolean DEFAULT true NOT NULL,
  post_count integer NOT NULL DEFAULT 0,
  reply_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add handle constraints
ALTER TABLE public.community_profiles ADD CONSTRAINT community_profiles_handle_length CHECK (char_length(handle) BETWEEN 3 AND 30);
ALTER TABLE public.community_profiles ADD CONSTRAINT community_profiles_handle_format CHECK (handle ~ '^[a-zA-Z0-9_\-]+$');
CREATE UNIQUE INDEX community_profiles_handle_unique ON public.community_profiles(handle);

-- Recreate FK references from other community tables
ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_author_user_id_fkey
  FOREIGN KEY (author_user_id) REFERENCES public.community_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.community_replies
  ADD CONSTRAINT community_replies_author_user_id_fkey
  FOREIGN KEY (author_user_id) REFERENCES public.community_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.community_reactions
  ADD CONSTRAINT community_reactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.community_profiles(user_id) ON DELETE CASCADE;

-- ===== MEMORY BOOK TABLES: Add team_id columns =====
-- The RLS policies reference team_id on memory_book_contacts, medical, preferences
-- These tables don't have team_id in my original definition. Let me check if they join through memory_book_id.
-- Actually, looking at the RLS policies: USING (public.is_team_member(team_id))
-- This means these tables DO have a team_id column.

ALTER TABLE public.memory_book_contacts
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_medical
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_preferences
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

-- Also add to other memory book sub-tables that likely need it for RLS
ALTER TABLE public.memory_book_providers
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_insurance
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_finances
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_subscriptions
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_vehicle
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_insurance_entries
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_finance_entries
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_medical_entries
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_preference_entries
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_daily_living_entries
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_social_accounts
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_household_providers
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_vehicle_care
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;

ALTER TABLE public.memory_book_home_address
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.cv_team(id) ON DELETE CASCADE;
