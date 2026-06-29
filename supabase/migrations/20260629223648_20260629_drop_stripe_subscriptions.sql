-- stripe_subscriptions was never written to or read from in application code.
-- user_subscriptions is the sole source of subscription state.
DROP TABLE IF EXISTS public.stripe_subscriptions;
