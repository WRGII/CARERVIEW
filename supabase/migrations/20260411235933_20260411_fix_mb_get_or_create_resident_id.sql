/*
  # Fix mb_get_or_create function: patient_id → resident_id

  The memory_books.patient_id column was renamed to resident_id.
  This migration updates the mb_get_or_create function to use the new column name
  so Memory Book initialization works correctly.
*/

CREATE OR REPLACE FUNCTION public.mb_get_or_create(
  p_team_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_book_id uuid;
  v_resident_id uuid;
  v_is_member boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND state = 'active'
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not a member of this team';
  END IF;

  SELECT team_id INTO v_resident_id
  FROM public.cv_team_patient
  WHERE team_id = p_team_id;

  IF v_resident_id IS NULL THEN
    RAISE EXCEPTION 'No resident found for this team';
  END IF;

  SELECT id INTO v_book_id
  FROM public.memory_books
  WHERE team_id = p_team_id AND resident_id = v_resident_id;

  IF v_book_id IS NULL THEN
    PERFORM 1 FROM public.cv_team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND state = 'active';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Only team owners can initialize the memory book';
    END IF;

    INSERT INTO public.memory_books (team_id, resident_id, created_by, updated_by)
    VALUES (p_team_id, v_resident_id, auth.uid(), auth.uid())
    RETURNING id INTO v_book_id;
  END IF;

  RETURN v_book_id;
END;
$$;
