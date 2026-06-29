/*
  Consolidated Schema - Part 1: Extensions, Enums, and Tables
  CarerView Database Reconstruction
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Create app schema
CREATE SCHEMA IF NOT EXISTS app;

-- Enum types
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cv_gender') THEN CREATE TYPE public.cv_gender AS ENUM ('female', 'male', 'nonbinary', 'unknown'); END IF; END$$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cv_member_role') THEN CREATE TYPE public.cv_member_role AS ENUM ('owner', 'member'); END IF; END$$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cv_member_state') THEN CREATE TYPE public.cv_member_state AS ENUM ('active', 'frozen'); END IF; END$$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN CREATE TYPE public.stripe_order_status AS ENUM ('pending', 'completed', 'canceled'); END IF; END$$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN CREATE TYPE public.stripe_subscription_status AS ENUM ('not_started', 'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'); END IF; END$$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN CREATE TYPE public.post_status AS ENUM ('active', 'hidden', 'removed'); END IF; END$$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reply_status') THEN CREATE TYPE public.reply_status AS ENUM ('active', 'hidden', 'removed'); END IF; END$$;

-- ===== CORE TABLES =====

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text DEFAULT '' NOT NULL,
  role text DEFAULT 'caregiver' NOT NULL,
  disabled boolean DEFAULT false NOT NULL,
  preferred_locale text DEFAULT 'en' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  active_team_id uuid
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  interval text NOT NULL CHECK (interval IN ('week', 'month', 'quarter', 'none')),
  price_cents integer DEFAULT 0 NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  obs_limit integer,
  usage_window text DEFAULT 'year' NOT NULL CHECK (usage_window IN ('week', 'month', 'year')),
  stripe_price_id text,
  observations_quota_year integer DEFAULT 0 NOT NULL,
  seats_limit integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id text NOT NULL,
  plan_id text REFERENCES public.subscription_plans(id),
  status text,
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, subscription_id)
);

CREATE TABLE IF NOT EXISTS public.cv_plan_limits (
  plan_id text PRIMARY KEY,
  seats integer NOT NULL,
  team_quota_year integer
);

CREATE TABLE IF NOT EXISTS public.cv_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cv_team_members (
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.cv_member_role NOT NULL,
  state public.cv_member_state DEFAULT 'active' NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  revoked_at timestamptz,
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.cv_team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash bytea NOT NULL,
  expires_at timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  consumed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.cv_team_patient (
  team_id uuid PRIMARY KEY REFERENCES public.cv_team(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  gender public.cv_gender DEFAULT 'unknown',
  notes text,
  photo_url text,
  preferred_name text,
  relationship text,
  primary_language text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add FK for profiles.active_team_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_active_team_fk') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_active_team_fk FOREIGN KEY (active_team_id) REFERENCES public.cv_team(id) ON DELETE SET NULL;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_i18n jsonb DEFAULT '{}' NOT NULL,
  description text DEFAULT '',
  description_i18n jsonb DEFAULT '{}' NOT NULL,
  type text DEFAULT 'ADL' CHECK (type IN ('ADL', 'IADL')),
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_text_i18n jsonb DEFAULT '{}' NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  resident_name text DEFAULT '' NOT NULL,
  observation_date date DEFAULT CURRENT_DATE NOT NULL,
  date_of_observation date DEFAULT CURRENT_DATE,
  mode_of_observation text DEFAULT 'In Person' CHECK (mode_of_observation IN ('In Person', 'Voice Call', 'Video Call')),
  notes text DEFAULT '',
  caregiver_name varchar(255) NOT NULL,
  caregiver_email varchar(320) NOT NULL CHECK (caregiver_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  form_type text CHECK (form_type IN ('ADL', 'IADL', 'COMPREHENSIVE')),
  team_id uuid REFERENCES public.cv_team(id) ON DELETE SET NULL,
  author_user_id uuid,
  is_guest_submission boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  notes text DEFAULT '',
  category_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(observation_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.legend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  description text NOT NULL,
  description_i18n jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===== STRIPE TABLES =====

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL,
  CONSTRAINT stripe_customers_customer_id_format CHECK (customer_id ~ '^cus_')
);

-- ===== ADMIN / INFRASTRUCTURE TABLES =====

CREATE TABLE IF NOT EXISTS public.admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text NOT NULL DEFAULT '',
  landing_image_1_url text,
  landing_image_2_url text,
  why_image_1_url text,
  why_image_2_url text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  stripe_event_id text UNIQUE,
  payload jsonb,
  processed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  template_name text NOT NULL,
  subject text,
  status text DEFAULT 'sent' NOT NULL,
  error_message text,
  metadata jsonb DEFAULT '{}',
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ===== I18N TABLES =====

CREATE TABLE IF NOT EXISTS public.supported_locales (
  code text PRIMARY KEY,
  name text NOT NULL,
  native_name text NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ui_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL REFERENCES public.supported_locales(code) ON DELETE CASCADE,
  namespace text NOT NULL DEFAULT 'common',
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(locale, namespace, key)
);

-- ===== COMMUNITY TABLES =====

CREATE TABLE IF NOT EXISTS public.community_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  slug text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  guidelines_accepted_at timestamptz,
  handle_is_auto_generated boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.community_rooms(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  pinned boolean DEFAULT false NOT NULL,
  status public.post_status DEFAULT 'active' NOT NULL,
  last_activity_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  status public.reply_status DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id, reply_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE SET NULL,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE SET NULL,
  reason text NOT NULL,
  resolved boolean DEFAULT false NOT NULL,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  banned_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===== MEMORY BOOK TABLES =====

CREATE TABLE IF NOT EXISTS public.memory_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES public.cv_team_patient(team_id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Memory Book',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id)
);

CREATE TABLE IF NOT EXISTS public.memory_book_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  full_name text,
  preferred_name text,
  date_of_birth date,
  place_of_birth text,
  gender public.cv_gender DEFAULT 'unknown',
  primary_language text,
  other_languages text[],
  cultural_background text,
  religious_affiliation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(memory_book_id)
);

CREATE TABLE IF NOT EXISTS public.memory_book_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  relationship text,
  phone text,
  email text,
  is_emergency boolean DEFAULT false,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  blood_type text,
  allergies text[],
  conditions text[],
  medications jsonb DEFAULT '[]',
  primary_physician text,
  physician_phone text,
  insurance_info text,
  medical_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(memory_book_id)
);

CREATE TABLE IF NOT EXISTS public.memory_book_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  category text NOT NULL,
  preference_key text NOT NULL,
  preference_value text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  provider_type text NOT NULL,
  phone text,
  address text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  policy_number text,
  group_number text,
  coverage_type text,
  phone text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_finances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  account_type text NOT NULL,
  institution text,
  account_name text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  billing_cycle text,
  amount_cents integer,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_vehicle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  make text,
  model text,
  year integer,
  color text,
  license_plate text,
  vin text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_insurance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  policy_number text,
  group_number text,
  coverage_type text,
  phone text,
  start_date date,
  end_date date,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  institution text NOT NULL,
  account_type text NOT NULL,
  account_name text,
  account_last4 text,
  routing_number_last4 text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_medical_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  entry_type text NOT NULL,
  name text NOT NULL,
  dosage text,
  frequency text,
  prescribing_doctor text,
  pharmacy text,
  start_date date,
  end_date date,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_preference_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  category text NOT NULL,
  label text NOT NULL,
  value text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_daily_living_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  category text NOT NULL,
  routine_name text NOT NULL,
  time_of_day text,
  description text,
  assistance_level text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  platform text NOT NULL,
  username text,
  url text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_household_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  provider_type text NOT NULL,
  company_name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  address text,
  account_number text,
  service_day text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_vehicle_care (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.memory_book_vehicle(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  provider_name text,
  phone text,
  last_service_date date,
  next_service_date date,
  mileage integer,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memory_book_home_address (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  address_type text DEFAULT 'primary' NOT NULL,
  street_address text,
  unit_number text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'US',
  move_in_date date,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== CARE PLAN TABLES =====

CREATE TABLE IF NOT EXISTS public.care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Care Plan',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id)
);

CREATE TABLE IF NOT EXISTS public.care_plan_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES public.care_plans(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  title text NOT NULL,
  content jsonb DEFAULT '{}' NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== ONBOARDING =====

CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_steps jsonb DEFAULT '[]' NOT NULL,
  current_step text DEFAULT 'welcome' NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== GUEST TOKENS =====

CREATE TABLE IF NOT EXISTS public.cv_guest_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  token_hash bytea NOT NULL,
  label text DEFAULT '' NOT NULL,
  expires_at timestamptz NOT NULL,
  max_uses integer DEFAULT 1 NOT NULL,
  use_count integer DEFAULT 0 NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now()
);
