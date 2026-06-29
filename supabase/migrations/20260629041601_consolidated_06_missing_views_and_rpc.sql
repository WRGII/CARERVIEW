-- Phase 2: Restore missing views and RPC

-- 1. v_category_questions
DROP VIEW IF EXISTS public.v_category_questions;

CREATE VIEW public.v_category_questions WITH (security_invoker = true) AS
SELECT
  c.id            AS category_id,
  c.name          AS category_name,
  c.translations  AS category_translations,
  c.type          AS type,
  c.sort_order    AS category_order,
  q.id            AS question_id,
  q.question_text AS question_text,
  q.translations  AS question_translations,
  q.sort_order    AS question_order
FROM public.categories c
JOIN public.questions q ON q.category_id = c.id;

GRANT SELECT ON public.v_category_questions TO anon;
GRANT SELECT ON public.v_category_questions TO authenticated;
GRANT SELECT ON public.v_category_questions TO service_role;

-- 2. community_posts_public (adapted to actual table schema)
DROP VIEW IF EXISTS public.community_posts_public;

CREATE VIEW public.community_posts_public
  WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  id,
  room_id,
  author_user_id,
  title,
  body,
  post_status,
  reply_count,
  reaction_count,
  last_activity_at,
  created_at,
  updated_at
FROM public.community_posts
WHERE post_status = 'active';

REVOKE ALL ON public.community_posts_public FROM anon;
GRANT SELECT ON public.community_posts_public TO anon;
ALTER VIEW public.community_posts_public OWNER TO postgres;

-- 3. v_plan_by_price
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

-- 4. get_community_public_stats RPC
CREATE OR REPLACE FUNCTION public.get_community_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_members  bigint;
  v_posts    bigint;
BEGIN
  SELECT COUNT(*) INTO v_members
  FROM public.community_profiles
  WHERE is_banned = false;

  SELECT COUNT(*) INTO v_posts
  FROM public.community_posts
  WHERE post_status = 'active';

  RETURN jsonb_build_object(
    'member_count', v_members,
    'post_count',   v_posts
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_public_stats() TO anon, authenticated;
