/*
  # Add help_type column to community_posts

  ## Summary
  Adds a `help_type` column to the `community_posts` table to categorize
  what kind of support the poster is looking for.

  ## Changes
  - `community_posts`: new `help_type` column (text, nullable, constrained to valid values)

  ## Valid Values
  - emotional_support
  - practical_tips
  - similar_experiences
  - question
  - resource

  ## Notes
  - Column is nullable so existing posts are unaffected
  - No RLS changes needed; existing post policies cover this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'help_type'
  ) THEN
    ALTER TABLE community_posts
      ADD COLUMN help_type text
        CHECK (help_type IN (
          'emotional_support',
          'practical_tips',
          'similar_experiences',
          'question',
          'resource'
        ));
  END IF;
END $$;
