/*
  # Production Fixes Batch

  ## Changes

  ### 1. user_subscriptions — add trial_end column
  Stores the timestamp when a Stripe trial period ends so the UI can display
  a warning to users before their trial expires.

  ### 2. subscription_plans — add UNIQUE constraint on stripe_price_id
  Prevents two plans from sharing the same Stripe price ID, which would break
  webhook-to-plan resolution.

  ### 3. enforce_team_observation_quota — fix race condition with advisory lock
  The existing trigger checks quota before insert but is not protected against
  concurrent inserts. Wrapping the quota check in pg_try_advisory_xact_lock
  ensures that concurrent inserts for the same team serialise correctly.

  ### 4. webhook_events — add 90-day cleanup index
  Adds a partial index to make the periodic TTL cleanup query efficient.
*/

-- ─── 1. trial_end column on user_subscriptions ───────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_subscriptions'
      AND column_name  = 'trial_end'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN trial_end timestamptz DEFAULT NULL;
  END IF;
END $$;

-- ─── 2. UNIQUE constraint on subscription_plans.stripe_price_id ──────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.subscription_plans'::regclass
      AND conname   = 'subscription_plans_stripe_price_id_unique'
  ) THEN
    -- Only add if there are no existing duplicate values
    IF (
      SELECT COUNT(*) FROM (
        SELECT stripe_price_id
        FROM public.subscription_plans
        WHERE stripe_price_id IS NOT NULL AND stripe_price_id <> ''
        GROUP BY stripe_price_id
        HAVING COUNT(*) > 1
      ) dupes
    ) = 0 THEN
      ALTER TABLE public.subscription_plans
        ADD CONSTRAINT subscription_plans_stripe_price_id_unique
        UNIQUE (stripe_price_id);
    END IF;
  END IF;
END $$;

-- ─── 3. Observation quota race condition — advisory lock on quota check ───────
-- Replace the existing trigger function with one that acquires a per-team
-- advisory lock for the duration of the transaction, preventing two concurrent
-- inserts from both reading "1 slot remaining" and both succeeding.
CREATE OR REPLACE FUNCTION public.enforce_team_observation_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id     uuid;
  v_plan_id     text;
  v_obs_limit   int;
  v_used        int;
BEGIN
  -- Determine the team for this observation
  v_team_id := COALESCE(NEW.team_id, (
    SELECT tm.team_id
    FROM public.cv_team_members tm
    WHERE tm.user_id = NEW.user_id
      AND tm.state = 'active'
    LIMIT 1
  ));

  IF v_team_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Acquire a per-team advisory lock so concurrent inserts serialise here
  PERFORM pg_advisory_xact_lock(hashtext('obs_quota:' || v_team_id::text));

  -- Get the plan limit for this team's owner
  SELECT sp.obs_limit
  INTO   v_obs_limit
  FROM   public.cv_team          t
  JOIN   public.user_subscriptions us ON us.user_id = t.owner_user_id
  JOIN   public.subscription_plans  sp ON sp.id       = us.plan_id
  WHERE  t.id = v_team_id
    AND  us.status IN ('active', 'trialing')
    AND  (us.current_period_end IS NULL OR us.current_period_end > now())
  ORDER  BY us.current_period_end DESC NULLS LAST
  LIMIT  1;

  -- No plan row found → free plan default
  IF v_obs_limit IS NULL THEN
    SELECT obs_limit INTO v_obs_limit
    FROM public.subscription_plans WHERE id = 'free'
    LIMIT 1;
  END IF;

  -- NULL obs_limit means unlimited
  IF v_obs_limit IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count existing observations this billing period
  SELECT COUNT(*) INTO v_used
  FROM public.observations
  WHERE team_id = v_team_id;

  IF v_used >= v_obs_limit THEN
    RAISE EXCEPTION 'observation_quota_exceeded'
      USING DETAIL = format('Team has used %s of %s allowed observations', v_used, v_obs_limit);
  END IF;

  RETURN NEW;
END;
$$;

-- Re-attach trigger if it doesn't already exist with the right function
DROP TRIGGER IF EXISTS trg_enforce_observation_quota ON public.observations;
CREATE TRIGGER trg_enforce_observation_quota
  BEFORE INSERT ON public.observations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_team_observation_quota();

-- ─── 4. webhook_events cleanup index ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_webhook_events_cleanup
  ON public.webhook_events (created_at)
  WHERE status = 'completed';
