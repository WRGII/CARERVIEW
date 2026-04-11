/*
  # Rename memory_books.patient_id to resident_id

  Continues the "patient → resident" nomenclature unification.
  The memory_books table stores a patient_id foreign key (or identifier).
  This migration renames it to resident_id.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memory_books' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE memory_books RENAME COLUMN patient_id TO resident_id;
  END IF;
END $$;
