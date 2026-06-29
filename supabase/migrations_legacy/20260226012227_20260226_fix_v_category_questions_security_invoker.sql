/*
  # Fix v_category_questions: add security_invoker and restore grants

  ## Summary
  The v_category_questions view was created without security_invoker=true, meaning
  queries ran in the postgres owner's context rather than the calling user's context.
  This migration corrects that by recreating the view with security_invoker=true and
  restoring the necessary grants so the frontend can continue querying it directly.

  ## Changes
  1. Recreate v_category_questions with security_invoker=true (no column or logic changes)
  2. Re-grant SELECT to anon, authenticated, and service_role

  ## Why grants must be re-applied
  Dropping and recreating a view removes its ACL entries. The frontend queries this
  view directly via supabase-js (both anon and authenticated roles), so grants are
  required.
*/

-- 1. Drop the existing view (recreating is the only way to change reloptions)
DROP VIEW IF EXISTS public.v_category_questions;

-- 2. Recreate with security_invoker so queries run in the caller's RLS context
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

-- 3. Restore grants (dropped along with the view)
GRANT SELECT ON public.v_category_questions TO anon;
GRANT SELECT ON public.v_category_questions TO authenticated;
GRANT SELECT ON public.v_category_questions TO service_role;
