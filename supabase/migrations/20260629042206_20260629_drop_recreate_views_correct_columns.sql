-- Drop and recreate views with correct column names

DROP VIEW IF EXISTS community_posts_public CASCADE;
DROP VIEW IF EXISTS cv_v_team_remaining CASCADE;
DROP VIEW IF EXISTS v_category_questions CASCADE;
DROP VIEW IF EXISTS v_plan_by_price CASCADE;

CREATE VIEW v_category_questions
  WITH (security_invoker = true)
AS
SELECT
  c.id            AS category_id,
  c.name          AS category_name,
  c.sort_order    AS category_sort_order,
  c.translations  AS category_translations,
  q.id            AS question_id,
  q.question_text AS question_text,
  q.translations  AS question_translations
FROM categories c
JOIN questions q ON q.category_id = c.id
ORDER BY c.sort_order, q.sort_order;

CREATE VIEW cv_v_team_remaining
  WITH (security_invoker = true)
AS
SELECT
  t.id                                                          AS team_id,
  t.owner_user_id,
  ROUND(pl.team_quota_year / 12.0)::integer                    AS quota,
  COALESCE(COUNT(o.id), 0)::integer                            AS used,
  GREATEST(
    ROUND(pl.team_quota_year / 12.0)::integer - COALESCE(COUNT(o.id), 0),
    0
  )::integer                                                    AS remaining
FROM cv_team t
JOIN user_subscriptions us ON us.user_id = t.owner_user_id
JOIN cv_plan_limits pl     ON pl.plan_id  = us.plan_id
LEFT JOIN observations o
  ON  o.team_id = t.id
  AND date_trunc('month', o.observation_date) = date_trunc('month', now())
WHERE is_team_member(t.id)
GROUP BY t.id, t.owner_user_id, pl.team_quota_year;

CREATE VIEW v_plan_by_price AS
SELECT *
FROM subscription_plans
ORDER BY price_cents ASC;

-- community_posts: is_anonymous, is_locked, help_type do NOT exist in schema
-- Only include columns that actually exist
CREATE VIEW community_posts_public
  WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  p.id,
  p.room_id,
  p.author_user_id,
  cp.handle       AS author_handle,
  cp.avatar_color AS author_avatar_color,
  p.title,
  p.body,
  p.post_status,
  p.reply_count,
  p.reaction_count,
  p.last_activity_at,
  p.created_at,
  p.updated_at
FROM community_posts p
LEFT JOIN community_profiles cp ON cp.user_id = p.author_user_id
WHERE p.post_status = 'active';
