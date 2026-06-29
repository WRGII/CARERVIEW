/*
  # Internationalization (i18n) Foundation

  ## Summary
  Introduces multi-language support infrastructure for the CarerView application.

  ## New Tables

  ### `supported_locales`
  Defines available languages in the application.
  - `code` (text, PK) — ISO 639-1 locale code (e.g. 'en', 'es')
  - `label` (text) — Display name shown in UI (e.g. 'English', 'Espanol')
  - `is_active` (boolean) — Whether this locale is selectable
  - `is_default` (boolean) — Whether this is the fallback locale
  - `sort_order` (int) — Display order in language switcher

  ### `ui_translations`
  Stores all UI string translations keyed by namespace.key and locale.
  - `key` (text) — Dot-notated translation key (e.g. 'nav.sign_in')
  - `locale` (text, FK → supported_locales.code) — Target language code
  - `value` (text) — Translated string
  - `updated_at` (timestamptz) — Last modified timestamp
  - Primary key: composite (key, locale)

  ## Modified Tables

  ### `profiles`
  - Adds `preferred_locale` (text, default 'en') — User's saved language preference

  ## Security
  - RLS enabled on both new tables
  - `supported_locales`: public SELECT; no public mutations
  - `ui_translations`: public SELECT; no public mutations
  - Profiles policy inherits existing policies; the new column is read/writable by the profile owner via existing UPDATE policy
*/

-- 1. supported_locales table
CREATE TABLE IF NOT EXISTS supported_locales (
  code        text PRIMARY KEY,
  label       text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  is_default  boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE supported_locales ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supported_locales' AND policyname = 'Anyone can read supported locales'
  ) THEN
    CREATE POLICY "Anyone can read supported locales"
      ON supported_locales FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;

-- Seed locales
INSERT INTO supported_locales (code, label, is_active, is_default, sort_order) VALUES
  ('en', 'English',  true, true,  1),
  ('es', 'Espanol',  true, false, 2)
ON CONFLICT (code) DO UPDATE SET
  label      = EXCLUDED.label,
  is_active  = EXCLUDED.is_active,
  is_default = EXCLUDED.is_default,
  sort_order = EXCLUDED.sort_order;

-- 2. ui_translations table
CREATE TABLE IF NOT EXISTS ui_translations (
  key        text        NOT NULL,
  locale     text        NOT NULL REFERENCES supported_locales(code) ON DELETE CASCADE,
  value      text        NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, locale)
);

ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS ui_translations_locale_idx ON ui_translations (locale);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ui_translations' AND policyname = 'Anyone can read translations'
  ) THEN
    CREATE POLICY "Anyone can read translations"
      ON ui_translations FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Admin update policy (service_role bypasses RLS; authenticated admins need explicit policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ui_translations' AND policyname = 'Authenticated users can update translations'
  ) THEN
    CREATE POLICY "Authenticated users can update translations"
      ON ui_translations FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ui_translations' AND policyname = 'Authenticated admins can insert translations'
  ) THEN
    CREATE POLICY "Authenticated admins can insert translations"
      ON ui_translations FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- 3. Add preferred_locale to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_locale'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_locale text NOT NULL DEFAULT 'en';
  END IF;
END $$;
