/*
  # Fix Care Plan Function and View Security Issues

  ## Summary
  Addresses two Supabase security advisor warnings:

  1. **Function Search Path Mutable** — `public.set_care_plan_updated_at`
     Recreated with `SET search_path = public, pg_temp` to prevent search path
     injection attacks where a malicious role shadows built-in functions.

  2. **Security Definer View** — `public.cv_v_team_remaining`
     Recreated with `WITH (security_invoker = true)` so the view executes with
     the caller's privileges rather than the owner's. RLS on underlying tables
     applies correctly to all callers.

  ## Changes
  - `set_care_plan_updated_at`: locked search_path
  - `cv_v_team_remaining`: converted from SECURITY DEFINER to SECURITY INVOKER
*/

-- ── Fix 1: Lock search_path on set_care_plan_updated_at ──────────────────────

CREATE OR REPLACE FUNCTION public.set_care_plan_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── Fix 2: Recreate cv_v_team_remaining as SECURITY INVOKER ──────────────────

CREATE OR REPLACE VIEW public.cv_v_team_remaining
WITH (security_invoker = true)
AS
SELECT
  t.id AS team_id,
  t.plan_id,
  COALESCE(cpl.team_quota_year, 0) AS quota,
  COALESCE(
    (
      SELECT COUNT(*)
      FROM public.observations o
      WHERE o.team_id = t.id
        AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    0
  ) AS used,
  GREATEST(
    0,
    COALESCE(cpl.team_quota_year, 0) - COALESCE(
      (
        SELECT COUNT(*)
        FROM public.observations o
        WHERE o.team_id = t.id
          AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      ),
      0
    )
  ) AS remaining
FROM public.cv_team t
LEFT JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id;
