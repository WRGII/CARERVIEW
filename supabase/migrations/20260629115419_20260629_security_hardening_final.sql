-- =============================================================================
-- Security Hardening: Fix all linter errors and warnings
-- 1. Fix SECURITY DEFINER view (v_plan_by_price)
-- 2. Enable RLS on 5 unprotected public tables
-- 3. Fix mutable search_path on 16 functions
-- 4. Move pg_trgm extension out of public schema
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: Fix v_plan_by_price - recreate with security_invoker = true
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.v_plan_by_price;

CREATE VIEW public.v_plan_by_price
  WITH (security_invoker = true)
AS
SELECT
  id            AS plan_id,
  name,
  interval,
  price_cents,
  stripe_price_id
FROM public.subscription_plans
ORDER BY price_cents ASC;

GRANT SELECT ON public.v_plan_by_price TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- PART 2: Enable RLS on unprotected tables + add appropriate policies
-- -----------------------------------------------------------------------------

-- subscription_plans: public pricing reference data, readable by all
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscription_plans' AND policyname = 'select_subscription_plans_public'
  ) THEN
    CREATE POLICY "select_subscription_plans_public" ON public.subscription_plans
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- cv_plan_limits: internal reference data, readable by authenticated users
-- (all writes go through service role or SECURITY DEFINER functions)
ALTER TABLE public.cv_plan_limits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cv_plan_limits' AND policyname = 'select_cv_plan_limits_authenticated'
  ) THEN
    CREATE POLICY "select_cv_plan_limits_authenticated" ON public.cv_plan_limits
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- admin_events: internal audit log, only admins can select; writes via service role
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_events' AND policyname = 'select_admin_events_admins_only'
  ) THEN
    CREATE POLICY "select_admin_events_admins_only" ON public.admin_events
      FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- webhook_events: written by stripe webhook edge function via service role
-- SECURITY DEFINER record_webhook_event() function also bypasses RLS
-- No client policies needed
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- rate_limit_log: accessed exclusively by SECURITY DEFINER check_rate_limit() function
-- which runs as postgres and bypasses RLS; no direct client access
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PART 3: Fix mutable search_path on functions
-- (ALTER FUNCTION ... SET search_path locks the path so it cannot be hijacked)
-- -----------------------------------------------------------------------------

-- Trigger functions (no arguments)
ALTER FUNCTION public.set_updated_at()
  SET search_path = '';

ALTER FUNCTION public.community_set_updated_at()
  SET search_path = '';

ALTER FUNCTION public.community_on_post_insert()
  SET search_path = '';

ALTER FUNCTION public.community_on_post_update()
  SET search_path = '';

ALTER FUNCTION public.community_on_reply_insert()
  SET search_path = '';

ALTER FUNCTION public.community_on_reply_update()
  SET search_path = '';

ALTER FUNCTION public.community_on_reaction_insert()
  SET search_path = '';

ALTER FUNCTION public.community_on_reaction_delete()
  SET search_path = '';

ALTER FUNCTION public.set_care_plan_updated_at()
  SET search_path = '';

-- Team management functions
ALTER FUNCTION public.cv_get_active_team()
  SET search_path = '';

ALTER FUNCTION public.cv_set_active_team(uuid)
  SET search_path = '';

ALTER FUNCTION public.cv_check_team_seats(uuid)
  SET search_path = '';

ALTER FUNCTION public.cv_create_team_with_patient(text, text, text, date, public.cv_gender, text)
  SET search_path = '';

ALTER FUNCTION public.cv_list_members(uuid)
  SET search_path = '';

ALTER FUNCTION public.cv_get_remaining(uuid)
  SET search_path = '';

ALTER FUNCTION public.cv_apply_plan_to_owner_teams(uuid, text)
  SET search_path = '';

-- -----------------------------------------------------------------------------
-- PART 4: Move pg_trgm extension out of public schema
-- -----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
