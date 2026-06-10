-- Fix FK constraints that currently RESTRICT (block) user deletion.
-- These NO ACTION/RESTRICT constraints prevent deleting users who have observations,
-- stripe customers, or created team invites — breaking GDPR right-to-erasure.

-- 1. observations.user_id: RESTRICT → SET NULL
ALTER TABLE observations DROP CONSTRAINT IF EXISTS observations_user_id_fkey;
ALTER TABLE observations
  ADD CONSTRAINT observations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. stripe_customers.user_id: RESTRICT → CASCADE
ALTER TABLE stripe_customers DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;
ALTER TABLE stripe_customers
  ADD CONSTRAINT stripe_customers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. cv_team_invites.created_by: RESTRICT → SET NULL
ALTER TABLE cv_team_invites DROP CONSTRAINT IF EXISTS cv_team_invites_created_by_fkey;
ALTER TABLE cv_team_invites
  ADD CONSTRAINT cv_team_invites_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. profiles.active_team_id: RESTRICT → SET NULL
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_active_team_fk;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_active_team_fk
  FOREIGN KEY (active_team_id) REFERENCES cv_team(id) ON DELETE SET NULL;

-- 5. memory_book_insurance_entries created_by/updated_by: RESTRICT → SET NULL
ALTER TABLE memory_book_insurance_entries DROP CONSTRAINT IF EXISTS memory_book_insurance_entries_created_by_fkey;
ALTER TABLE memory_book_insurance_entries DROP CONSTRAINT IF EXISTS memory_book_insurance_entries_updated_by_fkey;
ALTER TABLE memory_book_insurance_entries
  ADD CONSTRAINT memory_book_insurance_entries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE memory_book_insurance_entries
  ADD CONSTRAINT memory_book_insurance_entries_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. memory_book_finance_entries created_by/updated_by: RESTRICT → SET NULL
ALTER TABLE memory_book_finance_entries DROP CONSTRAINT IF EXISTS memory_book_finance_entries_created_by_fkey;
ALTER TABLE memory_book_finance_entries DROP CONSTRAINT IF EXISTS memory_book_finance_entries_updated_by_fkey;
ALTER TABLE memory_book_finance_entries
  ADD CONSTRAINT memory_book_finance_entries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE memory_book_finance_entries
  ADD CONSTRAINT memory_book_finance_entries_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. memory_book_medical_entries created_by/updated_by: RESTRICT → SET NULL
ALTER TABLE memory_book_medical_entries DROP CONSTRAINT IF EXISTS memory_book_medical_entries_created_by_fkey;
ALTER TABLE memory_book_medical_entries DROP CONSTRAINT IF EXISTS memory_book_medical_entries_updated_by_fkey;
ALTER TABLE memory_book_medical_entries
  ADD CONSTRAINT memory_book_medical_entries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE memory_book_medical_entries
  ADD CONSTRAINT memory_book_medical_entries_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 8. memory_book_preference_entries created_by/updated_by: RESTRICT → SET NULL
ALTER TABLE memory_book_preference_entries DROP CONSTRAINT IF EXISTS memory_book_preference_entries_created_by_fkey;
ALTER TABLE memory_book_preference_entries DROP CONSTRAINT IF EXISTS memory_book_preference_entries_updated_by_fkey;
ALTER TABLE memory_book_preference_entries
  ADD CONSTRAINT memory_book_preference_entries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE memory_book_preference_entries
  ADD CONSTRAINT memory_book_preference_entries_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 9. memory_book_daily_living_entries created_by/updated_by: RESTRICT → SET NULL
ALTER TABLE memory_book_daily_living_entries DROP CONSTRAINT IF EXISTS memory_book_daily_living_entries_created_by_fkey;
ALTER TABLE memory_book_daily_living_entries DROP CONSTRAINT IF EXISTS memory_book_daily_living_entries_updated_by_fkey;
ALTER TABLE memory_book_daily_living_entries
  ADD CONSTRAINT memory_book_daily_living_entries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE memory_book_daily_living_entries
  ADD CONSTRAINT memory_book_daily_living_entries_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 10. community_reports.reviewed_by: RESTRICT → SET NULL
ALTER TABLE community_reports DROP CONSTRAINT IF EXISTS community_reports_reviewed_by_fkey;
ALTER TABLE community_reports
  ADD CONSTRAINT community_reports_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
