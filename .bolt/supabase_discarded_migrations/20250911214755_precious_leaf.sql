/*
  # Add site_settings table with RLS policies

  1. New Tables
    - `app.site_settings` - Site-wide configuration settings
      - `id` (uuid, primary key)
      - `logo_url` (text, URL to site logo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on app.site_settings table
    - Add SELECT policy for anon and authenticated users (public read)
    - Add admin management policies for INSERT/UPDATE/DELETE

  3. Initial Data
    - Insert default logo URL if table is empty
*/

-- Ensure app schema exists
CREATE SCHEMA IF NOT EXISTS app;

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text NOT NULL DEFAULT '/CareView_logo_1_colored_highres.png',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on site_settings table
ALTER TABLE app.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings (anon and authenticated users)
DROP POLICY IF EXISTS "site_settings_public_select" ON app.site_settings;
CREATE POLICY "site_settings_public_select" ON app.site_settings
  FOR SELECT TO PUBLIC
  USING (true);

-- Allow admins to manage site settings
DROP POLICY IF EXISTS "site_settings_admin_all" ON app.site_settings;
CREATE POLICY "site_settings_admin_all" ON app.site_settings
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.disabled = false
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.disabled = false
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION app.update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON app.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON app.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION app.update_site_settings_updated_at();

-- Insert default site settings if table is empty
INSERT INTO app.site_settings (logo_url)
SELECT '/CareView_logo_1_colored_highres.png'
WHERE NOT EXISTS (SELECT 1 FROM app.site_settings);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON app.site_settings(updated_at DESC);