/*
  # Create community_public_examples Table

  ## Summary
  Creates a dedicated table for illustrative example discussions shown on the
  public community hub page. These are not real member posts — they are curated
  examples that demonstrate what each room is about, visible to anonymous visitors.

  ## New Table: community_public_examples
  - id          — uuid primary key
  - room_id     — FK to community_rooms
  - locale      — language code (default 'en'), enables future translation
  - title       — max 120 character illustrative discussion title
  - help_type   — matches the help_type enum used in community_posts
  - sort_order  — controls display order within a room
  - created_at  — timestamp

  ## Security
  - RLS enabled; anon users can SELECT (public page needs this)
  - Authenticated users can also SELECT
  - No INSERT/UPDATE/DELETE policies for non-admins (managed via migrations)

  ## Notes
  - 33 seed rows: 3 per room × 11 rooms, all in locale='en'
  - All titles are ≤ 120 characters
  - Future translations can be added as additional rows with the same
    room_id but different locale values
*/

CREATE TABLE IF NOT EXISTS public.community_public_examples (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid NOT NULL REFERENCES public.community_rooms(id) ON DELETE CASCADE,
  locale      text NOT NULL DEFAULT 'en',
  title       text NOT NULL CHECK (char_length(title) <= 120),
  help_type   text CHECK (help_type IN (
                'emotional_support','practical_tips','similar_experiences',
                'question','resource'
              )),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_public_examples_room_locale_idx
  ON public.community_public_examples (room_id, locale, sort_order);

ALTER TABLE public.community_public_examples ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_public_examples'
      AND policyname = 'Anyone can read public examples'
  ) THEN
    CREATE POLICY "Anyone can read public examples"
      ON public.community_public_examples
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- SEED: 3 examples per room × 11 rooms = 33 rows (locale = en)
-- ============================================================

INSERT INTO public.community_public_examples (room_id, locale, title, help_type, sort_order)
SELECT r.id, 'en', e.title, e.help_type, e.sort_order
FROM (VALUES
  -- General Support
  ('general-support', 'Feeling lost as a new carer — where do I even start?',          'question',             1),
  ('general-support', 'Does anyone else feel invisible doing this work?',               'emotional_support',    2),
  ('general-support', 'Small wins this week — share yours here',                        'similar_experiences',  3),

  -- Tips & Tactics
  ('tips-and-tactics', 'Morning routine that cut our daily stress in half',             'practical_tips',       1),
  ('tips-and-tactics', 'Pill organisers vs. blister packs — what works best for you?', 'question',             2),
  ('tips-and-tactics', 'How I finally got my dad to accept help at home',              'similar_experiences',  3),

  -- Emotional Support
  ('emotional-support', 'I cried in the car park after the appointment today',         'emotional_support',    1),
  ('emotional-support', 'Grateful for this community — you make hard days easier',     'similar_experiences',  2),
  ('emotional-support', 'How do you stop feeling guilty for taking time for yourself?','question',             3),

  -- Dementia Support
  ('dementia-support', 'Sundowning is exhausting — any strategies that actually help?','question',             1),
  ('dementia-support', 'She didn''t recognise me today. How do others cope with this?','emotional_support',    2),
  ('dementia-support', 'Tips for redirecting when he becomes distressed',              'practical_tips',       3),

  -- Burnout & Overwhelm
  ('burnout-and-overwhelm', 'Completely empty. How do you refill the tank?',           'question',             1),
  ('burnout-and-overwhelm', 'I haven''t slept properly in three weeks',                'emotional_support',    2),
  ('burnout-and-overwhelm', 'When caregiving starts affecting your own health — what next?', 'question',       3),

  -- Family Conflict
  ('family-conflict', 'My sister refuses to help but criticises everything I do',      'emotional_support',    1),
  ('family-conflict', 'How did you divide care responsibilities fairly in your family?','question',             2),
  ('family-conflict', 'In-laws keep overriding medical decisions — need advice',       'question',             3),

  -- New to Caregiving
  ('new-to-caregiving', 'Just became my mum''s carer overnight — what do I need to know?', 'question',        1),
  ('new-to-caregiving', 'First GP appointment with my care recipient — what to bring?','question',             2),
  ('new-to-caregiving', 'How long until you felt like you knew what you were doing?',  'similar_experiences',  3),

  -- Daily Care Tips
  ('daily-care-tips', 'Evening wind-down routine that actually works for us',          'practical_tips',       1),
  ('daily-care-tips', 'Quick nutritious meals when you have no time to cook',          'practical_tips',       2),
  ('daily-care-tips', 'How I made the bathroom safer with a few simple changes',       'practical_tips',       3),

  -- Practical Advice
  ('practical-advice', 'Navigating home care funding — where do I even start?',        'question',             1),
  ('practical-advice', 'Creating a clear handover sheet for respite workers',          'resource',             2),
  ('practical-advice', 'Best apps for tracking medications and appointments',           'resource',             3),

  -- Diagnosis & Conditions
  ('diagnosis-questions', 'Newly diagnosed with Parkinson''s — what should we expect?','question',             1),
  ('diagnosis-questions', 'Managing chronic pain at home — what has worked for you?',  'question',             2),
  ('diagnosis-questions', 'How do you explain a serious diagnosis to other family members?', 'question',       3),

  -- Equipment & Aids
  ('equipment-and-aids', 'Raised toilet seat recommendations — which hold up long-term?','question',           1),
  ('equipment-and-aids', 'Shower chair vs. walk-in conversion — is it worth the cost?', 'question',           2),
  ('equipment-and-aids', 'Grab rails: self-install or hire a professional?',            'question',            3)
) AS e(slug, title, help_type, sort_order)
JOIN public.community_rooms r ON r.slug = e.slug
ON CONFLICT DO NOTHING;
