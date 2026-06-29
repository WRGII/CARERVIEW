/*
  # Audit View: Users Missing stripe_customers Rows

  ## Summary
  Creates a view for admins to identify users who have a `user_subscriptions`
  record but no corresponding `stripe_customers` row. These users will fail
  when attempting to upgrade to a paid plan.

  ## New Views
  - `app.v_users_missing_stripe_customer`
    - Lists every auth.users row that has at least one user_subscriptions entry
      but has NO matching stripe_customers row
    - Columns: user_id, email, plan_id, subscription_status, period_end

  ## Security
  - View is in the `app` schema (not public) to restrict casual access
  - Only service_role (admin edge functions, migrations) can query app schema by default
*/

CREATE OR REPLACE VIEW app.v_users_missing_stripe_customer AS
SELECT
  u.id                        AS user_id,
  u.email,
  s.plan_id,
  s.status                    AS subscription_status,
  s.current_period_end        AS period_end,
  u.created_at                AS user_created_at
FROM auth.users u
JOIN public.user_subscriptions s ON s.user_id = u.id
LEFT JOIN public.stripe_customers sc ON sc.user_id = u.id
WHERE sc.user_id IS NULL
ORDER BY u.created_at DESC;
