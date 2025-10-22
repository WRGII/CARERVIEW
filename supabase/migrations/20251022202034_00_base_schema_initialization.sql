/*
  # Base Schema Initialization
  
  ## Overview
  Creates the complete base schema for CarerView application including:
  - Custom types and enums for gender, roles, and subscription status
  - Core tables: profiles, observations, responses, categories, questions, legend
  - Team management tables: cv_team, cv_team_members, cv_team_invites, cv_team_patient
  - Subscription tables: subscription_plans, user_subscriptions, cv_plan_limits
  - Stripe integration tables: stripe_customers, stripe_orders, stripe_subscriptions
  - Administrative tables: app_secrets, admin_events
  - App schema for views and functions
  
  ## Security
  - Row Level Security (RLS) enabled on all user-facing tables
  - Basic policies added, will be refined in subsequent migrations
  - Uses auth.uid() for user identification
*/

-- Create app schema for views and admin functions
CREATE SCHEMA IF NOT EXISTS app;

-- Create custom enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cv_gender') THEN
    CREATE TYPE public.cv_gender AS ENUM ('female', 'male', 'nonbinary', 'unknown');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cv_member_role') THEN
    CREATE TYPE public.cv_member_role AS ENUM ('owner', 'member');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cv_member_state') THEN
    CREATE TYPE public.cv_member_state AS ENUM ('active', 'frozen');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
    CREATE TYPE public.stripe_order_status AS ENUM ('pending', 'completed', 'canceled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
    CREATE TYPE public.stripe_subscription_status AS ENUM (
      'not_started', 'incomplete', 'incomplete_expired', 'trialing',
      'active', 'past_due', 'canceled', 'unpaid', 'paused'
    );
  END IF;
END$$;

-- Core user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text DEFAULT ''::text NOT NULL,
  role text DEFAULT 'caregiver'::text NOT NULL,
  disabled boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  active_team_id uuid
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  interval text NOT NULL CHECK (interval IN ('week', 'month', 'quarter', 'none')),
  price_cents integer DEFAULT 0 NOT NULL,
  currency text DEFAULT 'USD'::text NOT NULL,
  obs_limit integer,
  usage_window text DEFAULT 'year'::text NOT NULL CHECK (usage_window IN ('week', 'month', 'year')),
  stripe_price_id text,
  observations_quota_year integer DEFAULT 0 NOT NULL,
  seats_limit integer,
  created_at timestamp with time zone DEFAULT now()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id text NOT NULL,
  plan_id text REFERENCES public.subscription_plans(id),
  status text,
  price_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, subscription_id)
);

-- Team plan limits
CREATE TABLE IF NOT EXISTS public.cv_plan_limits (
  plan_id text PRIMARY KEY,
  seats integer NOT NULL,
  team_quota_year integer
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.cv_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.cv_team_members (
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.cv_member_role NOT NULL,
  state public.cv_member_state DEFAULT 'active'::public.cv_member_state NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  revoked_at timestamp with time zone,
  PRIMARY KEY (team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS public.cv_team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.cv_team(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash bytea NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  consumed_at timestamp with time zone
);

-- Team patient information
CREATE TABLE IF NOT EXISTS public.cv_team_patient (
  team_id uuid PRIMARY KEY REFERENCES public.cv_team(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  gender public.cv_gender DEFAULT 'unknown'::public.cv_gender,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Categories table (ADL/IADL)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT ''::text,
  type text DEFAULT 'ADL'::text CHECK (type IN ('ADL', 'IADL')),
  created_at timestamp with time zone DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Observations table
CREATE TABLE IF NOT EXISTS public.observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  patient_name text DEFAULT ''::text NOT NULL,
  observation_date date DEFAULT CURRENT_DATE NOT NULL,
  date_of_observation date DEFAULT CURRENT_DATE,
  mode_of_observation text DEFAULT 'In Person'::text CHECK (
    mode_of_observation IN ('In Person', 'Voice Call', 'Video Call')
  ),
  notes text DEFAULT ''::text,
  caregiver_name varchar(255) NOT NULL,
  caregiver_email varchar(320) NOT NULL CHECK (
    caregiver_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  form_type text CHECK (form_type IN ('ADL', 'IADL', 'COMPREHENSIVE')),
  team_id uuid REFERENCES public.cv_team(id) ON DELETE SET NULL,
  author_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON COLUMN public.observations.author_user_id IS 'creator; only this user may edit/delete';

-- Responses table
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  notes text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(observation_id, question_id)
);

-- Legend table (score descriptions)
CREATE TABLE IF NOT EXISTS public.legend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Stripe customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  customer_id text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone DEFAULT NULL
);

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text NOT NULL UNIQUE,
  subscription_id text DEFAULT NULL,
  price_id text DEFAULT NULL,
  current_period_start bigint DEFAULT NULL,
  current_period_end bigint DEFAULT NULL,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text DEFAULT NULL,
  payment_method_last4 text DEFAULT NULL,
  status public.stripe_subscription_status NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone DEFAULT NULL
);

-- Stripe orders table
CREATE TABLE IF NOT EXISTS public.stripe_orders (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status public.stripe_order_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone DEFAULT NULL
);

-- Admin events table
CREATE TABLE IF NOT EXISTS public.admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- App secrets table
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- App site settings table
CREATE TABLE IF NOT EXISTS app.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text NOT NULL,
  landing_image_1_url text,
  landing_image_2_url text,
  why_image_1_url text,
  why_image_2_url text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key for active_team_id (check if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_active_team_fk'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_active_team_fk 
    FOREIGN KEY (active_team_id) REFERENCES public.cv_team(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_observations_user_id ON public.observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_team_id ON public.observations(team_id);
CREATE INDEX IF NOT EXISTS idx_observations_caregiver_email ON public.observations(caregiver_email);
CREATE INDEX IF NOT EXISTS idx_observations_user_form_type_idx ON public.observations(user_id, form_type);
CREATE INDEX IF NOT EXISTS idx_responses_observation_id ON public.responses(observation_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON public.questions(category_id);

-- Enable RLS on all user-facing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_team_patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for public read access (will be refined in later migrations)
-- Legend (public read)
DROP POLICY IF EXISTS "legend_public_read" ON public.legend;
CREATE POLICY "legend_public_read" ON public.legend FOR SELECT TO public USING (true);

-- Categories (public read)
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO public USING (true);

-- Questions (public read)
DROP POLICY IF EXISTS "questions_public_read" ON public.questions;
CREATE POLICY "questions_public_read" ON public.questions FOR SELECT TO public USING (true);

-- Profiles (users can view/update their own)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_observations ON public.observations;
CREATE TRIGGER set_updated_at_observations
  BEFORE UPDATE ON public.observations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_responses ON public.responses;
CREATE TRIGGER set_updated_at_responses
  BEFORE UPDATE ON public.responses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
