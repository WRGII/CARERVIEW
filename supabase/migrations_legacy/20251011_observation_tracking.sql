/*
  # Observation Tracking and Quota Enforcement

  1. View
    - cv_v_team_remaining: Shows observation quota usage per team
    - Joins team → plan_limits → observations
    - Calculates used and remaining for current year

  2. Trigger
    - enforce_team_observation_quota: Prevents INSERT when quota exceeded
    - Checks remaining observations before allowing new observation
    - Only applies to team-based observations (team_id NOT NULL)
*/

-- Create view for team observation tracking
CREATE OR REPLACE VIEW public.cv_v_team_remaining
WITH (security_invoker = true)
AS
SELECT
  t.id AS team_id,
  t.plan_id,
  cpl.team_quota_year AS quota,
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
    cpl.team_quota_year - COALESCE(
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
JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id;

-- Grant SELECT on view
GRANT SELECT ON public.cv_v_team_remaining TO authenticated;

-- Create trigger function to enforce observation quota
CREATE OR REPLACE FUNCTION public.enforce_team_observation_quota()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_remaining integer;
BEGIN
  -- Only check quota for team observations
  IF NEW.team_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get remaining observations for this team
  SELECT remaining
  INTO v_remaining
  FROM public.cv_v_team_remaining
  WHERE team_id = NEW.team_id;

  -- If no quota info found, deny
  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'Unable to determine observation quota for team';
  END IF;

  -- If quota exceeded, deny
  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'Team has reached observation limit for this year. Remaining: 0';
  END IF;

  -- Allow insert
  RETURN NEW;
END;
$$;

-- Create trigger on observations
DROP TRIGGER IF EXISTS trg_enforce_team_observation_quota ON public.observations;

CREATE TRIGGER trg_enforce_team_observation_quota
  BEFORE INSERT ON public.observations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_team_observation_quota();
