-- Fix v_category_questions view: add missing type, category_order, question_order columns
-- that useCategoryQuestions.ts expects. The view was missing `type` (causing
-- "column v_category_questions.type does not exist" error) and had mismatched
-- sort order column names.

DROP VIEW IF EXISTS v_category_questions;

CREATE VIEW v_category_questions
  WITH (security_invoker = true)
AS
SELECT
  c.id            AS category_id,
  c.name          AS category_name,
  c.type          AS type,
  c.sort_order    AS category_order,
  c.translations  AS category_translations,
  q.id            AS question_id,
  q.question_text AS question_text,
  q.sort_order    AS question_order,
  q.translations  AS question_translations
FROM categories c
JOIN questions q ON q.category_id = c.id
ORDER BY c.sort_order, q.sort_order;
