CREATE TABLE IF NOT EXISTS public.memory_book_pharmacies (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_book_id    uuid NOT NULL REFERENCES public.memory_books(id) ON DELETE CASCADE,
  team_id           uuid REFERENCES public.cv_team(id) ON DELETE CASCADE,
  name              text NOT NULL DEFAULT '',
  phone             text,
  fax               text,
  address           text,
  notes             text,
  is_primary        boolean NOT NULL DEFAULT false,
  sort_order        integer DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.memory_book_pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_pharmacies_team_member"
  ON public.memory_book_pharmacies FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.cv_team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_pharmacies_team_member"
  ON public.memory_book_pharmacies FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.cv_team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "update_pharmacies_team_member"
  ON public.memory_book_pharmacies FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.cv_team_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.cv_team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "delete_pharmacies_team_owner"
  ON public.memory_book_pharmacies FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.cv_team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE INDEX idx_memory_book_pharmacies_memory_book_id
  ON public.memory_book_pharmacies(memory_book_id);

CREATE TRIGGER set_updated_at_memory_book_pharmacies
  BEFORE UPDATE ON public.memory_book_pharmacies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
