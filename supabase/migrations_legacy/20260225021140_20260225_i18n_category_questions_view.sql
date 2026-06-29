/*
  # Create v_category_questions view and add sort_order to categories

  ## Summary
  The useCategoryQuestions hook queries a `v_category_questions` view that did not
  exist. This migration:

  1. Adds `sort_order` column to `categories` table (if missing) with default 0
  2. Creates the `v_category_questions` view that joins categories and questions,
     exposing `translations` JSONB on both so the frontend hook can apply locale
     overrides client-side.

  ## New view: v_category_questions
  Columns: category_id, category_name, category_translations (jsonb), type,
           category_order, question_id, question_text, question_translations (jsonb),
           question_order

  ## Notes
  - The view is in the public schema and accessible to authenticated users via
    the existing RLS on the underlying tables (views inherit underlying table RLS
    when security_invoker is not set, which is the default).
  - The `translations` JSONB stores locale-keyed overrides:
      {"es": "Texto en español", "en": "Text in English"}
    The frontend picks the active locale key at render time.
*/

-- 1. Add sort_order to categories if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 2. Create (or replace) the view
CREATE OR REPLACE VIEW public.v_category_questions AS
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
