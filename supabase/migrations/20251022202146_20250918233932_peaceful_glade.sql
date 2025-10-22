-- Add a tag that identifies which form created the observation
alter table public.observations
  add column if not exists form_type text
  check (form_type in ('ADL','IADL','COMPREHENSIVE'));

-- Helpful composite index for user + form type queries
create index if not exists observations_user_form_type_idx
  on public.observations(user_id, form_type);
