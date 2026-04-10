/*
  # Migrate site_settings from app schema to public schema

  ## Problem
  The site_settings table lives in the `app` schema, but PostgREST only exposes
  the `public` and `graphql_public` schemas. Every call to
  `supabase.schema('app').from('site_settings')` returns HTTP 406 with
  "The schema must be one of the following: public, graphql_public".

  ## Fix
  1. Create `public.site_settings` with the same columns as `app.site_settings`
  2. Copy any existing rows from `app.site_settings` → `public.site_settings`
  3. Enable RLS on `public.site_settings`
  4. Add a public SELECT policy (logo_url is branding data, not sensitive)
  5. Add a service-role-only INSERT/UPDATE policy

  ## Tables Modified
  - New: `public.site_settings`

  ## Notes
  - The old `app.site_settings` table is left intact to avoid breaking any
    server-side references; it is no longer used by the frontend.
*/

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text NOT NULL DEFAULT '',
  landing_image_1_url text,
  landing_image_2_url text,
  why_image_1_url text,
  why_image_2_url text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "site_settings_service_role_write" ON public.site_settings;
CREATE POLICY "site_settings_service_role_write"
  ON public.site_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO public.site_settings (id, logo_url, landing_image_1_url, landing_image_2_url, why_image_1_url, why_image_2_url, updated_at)
SELECT id, logo_url, landing_image_1_url, landing_image_2_url, why_image_1_url, why_image_2_url, updated_at
FROM app.site_settings
ON CONFLICT (id) DO NOTHING;
