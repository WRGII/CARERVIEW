/*
  # Add translations JSONB to content tables

  Adds a `translations` JSONB column to:
  - `categories` — stores locale-keyed name/description overrides
  - `questions`  — stores locale-keyed question_text overrides
  - `legend`     — stores locale-keyed description overrides

  Format: { "es": "Texto en español", "en": "English text" }
  The base columns remain the source of truth; translations override when present.
*/

-- categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'translations'
  ) THEN
    ALTER TABLE categories ADD COLUMN translations jsonb DEFAULT '{}';
  END IF;
END $$;

-- questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'translations'
  ) THEN
    ALTER TABLE questions ADD COLUMN translations jsonb DEFAULT '{}';
  END IF;
END $$;

-- legend
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legend' AND column_name = 'translations'
  ) THEN
    ALTER TABLE legend ADD COLUMN translations jsonb DEFAULT '{}';
  END IF;
END $$;
