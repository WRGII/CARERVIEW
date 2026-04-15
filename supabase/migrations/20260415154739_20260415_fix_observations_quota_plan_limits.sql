/*
  # Fix observation quota: add missing plan rows and harden the remaining view

  ## Problem
  The `cv_v_team_remaining` view JOINs `cv_team` to `cv_plan_limits` on `plan_id`.
  Only `family_qtr` had a row in `cv_plan_limits`, so teams on `free` or `primary_qtr`
  plans returned no row from the view. The frontend called `.single()` on that empty
  result, which threw an error and crashed the New Observation page.

  ## Changes

  ### 1. cv_plan_limits – fill missing rows
  - Insert `free` (3 obs/year, 1 seat) and `primary_qtr` (100 obs/year, 1 seat)
    if not already present.

  ### 2. cv_v_team_remaining – use LEFT JOIN with fallback
  - Switch from INNER JOIN to LEFT JOIN so teams without a cv_plan_limits row still
    appear in the view with quota = 0 and remaining = 0 rather than being invisible.
*/

-- 1. Seed missing rows in cv_plan_limits
INSERT INTO public.cv_plan_limits (plan_id, seats, team_quota_year)
VALUES
  ('free',         1,   3),
  ('primary_qtr',  1, 100)
ON CONFLICT (plan_id) DO NOTHING;

-- 2. Replace cv_v_team_remaining with a LEFT JOIN so no team falls through the cracks
CREATE OR REPLACE VIEW public.cv_v_team_remaining AS
SELECT
  t.id        AS team_id,
  t.plan_id,
  COALESCE(cpl.team_quota_year, 0)                                             AS quota,
  COALESCE(
    (SELECT COUNT(*) FROM public.observations o
     WHERE o.team_id = t.id
       AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)),
    0
  )                                                                             AS used,
  GREATEST(
    0,
    COALESCE(cpl.team_quota_year, 0) - COALESCE(
      (SELECT COUNT(*) FROM public.observations o
       WHERE o.team_id = t.id
         AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)),
      0
    )
  )                                                                             AS remaining
FROM public.cv_team t
LEFT JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id;
