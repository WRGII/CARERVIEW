-- Restore 3 views and 1 RPC for CareView app

-- Drop existing views if they exist (in reverse dependency order)
DROP VIEW IF EXISTS cv_v_team_remaining CASCADE;
DROP VIEW IF EXISTS v_category_questions CASCADE;
DROP VIEW IF EXISTS v_plan_by_price CASCADE;
DROP VIEW IF EXISTS community_posts_public CASCADE;

-- 1. v_category_questions view
CREATE OR REPLACE VIEW v_category_questions
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
ORDER BY c.sort_order, q.id;

-- 2. cv_v_team_remaining view
CREATE OR REPLACE VIEW cv_v_team_remaining
  WITH (security_invoker = true)
AS
SELECT
  t.id                                          AS team_id,
  t.owner_user_id,
  pl.team_quota_year                            AS quota,
  COALESCE(COUNT(o.id), 0)::integer             AS used,
  GREATEST(
    pl.team_quota_year - COALESCE(COUNT(o.id), 0),
    0
  )::integer                                    AS remaining
FROM cv_team t
JOIN cv_plan_limits pl ON pl.plan_id = t.plan_id
LEFT JOIN observations o
  ON  o.team_id = t.id
  AND date_trunc('month', o.observation_date) = date_trunc('month', now())
GROUP BY t.id, t.owner_user_id, pl.team_quota_year;

-- 3. v_plan_by_price view
CREATE OR REPLACE VIEW v_plan_by_price AS
SELECT *
FROM subscription_plans
ORDER BY price_cents ASC;

-- 4. community_posts_public view
CREATE OR REPLACE VIEW community_posts_public
  WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  p.id,
  p.room_id,
  p.author_user_id,
  cp.handle           AS author_handle,
  cp.avatar_color     AS author_avatar_color,
  p.title,
  p.body,
  p.post_status,
  p.pinned,
  p.reply_count,
  p.reaction_count,
  p.last_activity_at,
  p.created_at,
  p.updated_at
FROM community_posts p
LEFT JOIN community_profiles cp ON cp.user_id = p.author_user_id
WHERE p.post_status = 'active';

-- 5. get_community_public_stats RPC
CREATE OR REPLACE FUNCTION get_community_public_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_posts',   (SELECT COUNT(*) FROM community_posts  WHERE post_status = 'active'),
    'total_replies', (SELECT COUNT(*) FROM community_replies WHERE reply_status = 'active'),
    'total_members', (SELECT COUNT(*) FROM community_profiles)
  );
$$;

GRANT EXECUTE ON FUNCTION get_community_public_stats() TO anon, authenticated;
