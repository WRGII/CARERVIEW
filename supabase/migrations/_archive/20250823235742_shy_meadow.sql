/*
  # Add function for calculating average scores by category

  1. Functions
    - `get_average_scores_by_category()` - Returns average scores grouped by category
    
  2. Security
    - Function accessible to admins only
*/

CREATE OR REPLACE FUNCTION get_average_scores_by_category()
RETURNS TABLE(
  category text,
  type text,
  average numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as category,
    c.type::text,
    ROUND(AVG(r.score::numeric), 2) as average
  FROM categories c
  JOIN questions q ON q.category_id = c.id
  JOIN responses r ON r.question_id = q.id
  GROUP BY c.id, c.name, c.type, c.sort_order
  ORDER BY c.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_average_scores_by_category() TO authenticated;