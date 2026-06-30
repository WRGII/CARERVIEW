-- ============================================================
-- Memory Book comprehensive schema migration
-- Adds created_by / updated_by audit columns to all tables
-- and adds any missing columns needed by the React hooks/components
-- ============================================================

-- ── memory_book_contacts ─────────────────────────────────────
ALTER TABLE memory_book_contacts
  ADD COLUMN IF NOT EXISTS full_name         text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role_tag          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_providers ────────────────────────────────────
ALTER TABLE memory_book_providers
  ADD COLUMN IF NOT EXISTS name              text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS specialty_label   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_name     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_primary        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_insurance ────────────────────────────────────
ALTER TABLE memory_book_insurance
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_finances ─────────────────────────────────────
ALTER TABLE memory_book_finances
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_subscriptions ────────────────────────────────
ALTER TABLE memory_book_subscriptions
  ADD COLUMN IF NOT EXISTS name              text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_vehicle ──────────────────────────────────────
ALTER TABLE memory_book_vehicle
  ADD COLUMN IF NOT EXISTS make_model_year   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS registration_due  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS service_provider  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS parking_location  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_social_accounts ──────────────────────────────
ALTER TABLE memory_book_social_accounts
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_household_providers ──────────────────────────
ALTER TABLE memory_book_household_providers
  ADD COLUMN IF NOT EXISTS category          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sub_category      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS provider_name     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website           text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_insurance_entries ────────────────────────────
ALTER TABLE memory_book_insurance_entries
  ADD COLUMN IF NOT EXISTS label             text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS insurer           text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS member_id         text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_finance_entries ──────────────────────────────
ALTER TABLE memory_book_finance_entries
  ADD COLUMN IF NOT EXISTS label             text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS company           text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS value             text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_medical_entries ──────────────────────────────
ALTER TABLE memory_book_medical_entries
  ADD COLUMN IF NOT EXISTS label             text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS value             text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_preference_entries ───────────────────────────
ALTER TABLE memory_book_preference_entries
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_daily_living_entries ─────────────────────────
ALTER TABLE memory_book_daily_living_entries
  ADD COLUMN IF NOT EXISTS section           text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label             text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS independence_level text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_home_address ─────────────────────────────────
ALTER TABLE memory_book_home_address
  ADD COLUMN IF NOT EXISTS street_number     text,
  ADD COLUMN IF NOT EXISTS street_name       text,
  ADD COLUMN IF NOT EXISTS apt_unit          text,
  ADD COLUMN IF NOT EXISTS building_name     text,
  ADD COLUMN IF NOT EXISTS county_township   text,
  ADD COLUMN IF NOT EXISTS state_province    text,
  ADD COLUMN IF NOT EXISTS postal_code       text,
  ADD COLUMN IF NOT EXISTS history_description text,
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);

-- ── memory_book_vehicle_care ─────────────────────────────────
ALTER TABLE memory_book_vehicle_care
  ADD COLUMN IF NOT EXISTS sub_category      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website           text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by        uuid REFERENCES auth.users(id);
