-- Directly set tutorial_dismissed=true for wrgii so GuidedTutorial does not render on load.
-- The previous migration used ON CONFLICT (user_id) DO UPDATE but the row already existed
-- with tutorial_dismissed=false; a later upsert reset it. This UPDATE targets the row directly.
UPDATE public.user_onboarding
SET tutorial_dismissed = true,
    updated_at = now()
WHERE user_id = '11de42b7-1f24-4c86-b22a-6b095f812414';
