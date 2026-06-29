/*
  # Add DELETE policy for observations

  1. Security Changes
    - Add DELETE policy for observations table
    - Allow authenticated users to delete their own observations
    - Policy checks that user_id matches auth.uid()

  2. Notes
    - Responses will be automatically deleted via ON DELETE CASCADE
    - This enables caregivers to remove observations they created
*/

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "users_can_delete_own_observations" ON public.observations;

-- Create DELETE policy for authenticated users
CREATE POLICY "users_can_delete_own_observations"
  ON public.observations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
