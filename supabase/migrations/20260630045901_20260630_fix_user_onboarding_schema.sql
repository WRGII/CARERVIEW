-- Add missing columns that useOnboarding hook expects
ALTER TABLE user_onboarding
  ADD COLUMN IF NOT EXISTS tutorial_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tutorial_step integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tutorial_dismissed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS welcome_dismissed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS care_hub_visited boolean NOT NULL DEFAULT false;

-- Insert row for wrgii@icloud.com with tutorial dismissed so it doesn't crash
INSERT INTO user_onboarding (user_id, tutorial_completed, tutorial_step, tutorial_dismissed, welcome_dismissed, care_hub_visited)
VALUES ('11de42b7-1f24-4c86-b22a-6b095f812414', false, 0, true, false, false)
ON CONFLICT (user_id) DO UPDATE SET tutorial_dismissed = true;
