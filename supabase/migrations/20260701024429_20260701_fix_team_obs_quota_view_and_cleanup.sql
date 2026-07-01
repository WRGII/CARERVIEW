-- Part 1: Rebuild cv_v_team_remaining to join cv_plan_limits via cv_team.plan_id
-- This eliminates the multi-row problem caused by users having multiple subscription records
-- (e.g. an active 'free' row coexisting with an active paid row after upgrading).
-- Using cv_team.plan_id as the authoritative source guarantees exactly one row per team.
-- Quota is now yearly (matching UI label "100 yearly observations"), not monthly.
CREATE OR REPLACE VIEW public.cv_v_team_remaining
WITH (security_invoker = true)
AS
SELECT
    t.id                                                              AS team_id,
    t.owner_user_id,
    COALESCE(pl.team_quota_year, 0)                                   AS quota,
    COALESCE(COUNT(o.id), 0)::integer                                 AS used,
    GREATEST(
        COALESCE(pl.team_quota_year, 0) - COALESCE(COUNT(o.id), 0)::integer,
        0
    )                                                                 AS remaining
FROM public.cv_team t
LEFT JOIN public.cv_plan_limits pl ON pl.plan_id = t.plan_id
LEFT JOIN public.observations o
    ON o.team_id = t.id
    AND EXTRACT(YEAR FROM o.observation_date) = EXTRACT(YEAR FROM CURRENT_DATE)
WHERE is_team_member(t.id)
GROUP BY t.id, t.owner_user_id, pl.team_quota_year;

-- Part 2: Cancel orphaned free-plan subscription rows for users who have an active paid subscription.
-- Safe to run multiple times (idempotent WHERE clause).
UPDATE public.user_subscriptions AS us
SET
    status     = 'canceled',
    updated_at = now()
WHERE us.plan_id        = 'free'
  AND us.subscription_id LIKE 'free_%'
  AND us.status         = 'active'
  AND EXISTS (
      SELECT 1
      FROM public.user_subscriptions us2
      WHERE us2.user_id  = us.user_id
        AND us2.plan_id != 'free'
        AND us2.status  IN ('active', 'trialing')
  );
