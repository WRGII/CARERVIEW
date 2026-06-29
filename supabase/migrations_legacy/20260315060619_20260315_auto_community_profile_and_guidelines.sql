/*
  # Auto-create community profiles and add guidelines/handle tracking

  ## Summary
  This migration does three things:

  1. **New columns on community_profiles**
     - `guidelines_accepted_at` (timestamptz, nullable) — NULL means the user has never accepted the community guidelines. Set to a timestamp on first agreement.
     - `handle_is_auto_generated` (boolean, default true) — Tracks whether the handle was auto-assigned at registration or customised by the user. Used to drive the "personalise your handle" prompt.

  2. **Auto-profile creation trigger**
     A Postgres function `create_community_profile_for_new_user()` fires AFTER INSERT on `public.profiles`.
     - Derives a base handle from `display_name`: takes the first word (first name), lowercases it, strips non-alphanumeric characters, and appends a 4-digit random numeric suffix (e.g. `sarah_4823`).
     - Falls back to the email-username part (from `auth.users`) when `display_name` is blank or would produce an empty slug.
     - Retries up to 10 times on duplicate-key (23505) violations with fresh random suffixes.
     - Inserts with `handle_is_auto_generated = true`.

  3. **Backfill existing users**
     A one-time DO block creates community profiles for all `profiles` rows that do not yet have one, using the same derivation logic.

  ## Security
  - RLS remains enabled on `community_profiles`; existing policies are unchanged.
  - The trigger runs as SECURITY DEFINER so it can insert into community_profiles regardless of the calling user's RLS context.
*/

-- ── 1. Add new columns ──────────────────────────────────────────────────────

ALTER TABLE public.community_profiles
  ADD COLUMN IF NOT EXISTS guidelines_accepted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS handle_is_auto_generated boolean NOT NULL DEFAULT true;

-- ── 2. Trigger function ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_community_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base        text;
  v_handle      text;
  v_attempt     int := 0;
  v_email       text;
  v_display     text;
BEGIN
  -- Derive display_name from the new profiles row (may be empty)
  v_display := COALESCE(NEW.display_name, '');

  -- Extract first word, lowercase, keep only [a-z0-9_]
  v_base := lower(regexp_replace(split_part(trim(v_display), ' ', 1), '[^a-zA-Z0-9_]', '', 'g'));

  -- If base is too short (< 2 chars), fall back to email username
  IF length(v_base) < 2 THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
    v_base := lower(regexp_replace(split_part(COALESCE(v_email, 'caregiver'), '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));
    v_base := left(v_base, 20);
  END IF;

  -- Ensure base is at least 2 chars
  IF length(v_base) < 2 THEN
    v_base := 'caregiver';
  END IF;

  -- Try up to 10 times with random 4-digit suffix
  LOOP
    v_attempt := v_attempt + 1;
    v_handle := v_base || '_' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

    BEGIN
      INSERT INTO public.community_profiles (
        user_id,
        handle,
        bio,
        avatar_color,
        handle_is_auto_generated
      ) VALUES (
        NEW.id,
        v_handle,
        '',
        '#00BCD4',
        true
      );
      RETURN NEW; -- success
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 10 THEN
        -- Last resort: append microseconds-based suffix
        v_handle := v_base || '_' || extract(epoch from clock_timestamp())::bigint % 100000;
        INSERT INTO public.community_profiles (
          user_id,
          handle,
          bio,
          avatar_color,
          handle_is_auto_generated
        ) VALUES (
          NEW.id,
          v_handle,
          '',
          '#00BCD4',
          true
        );
        RETURN NEW;
      END IF;
      -- else loop again
    END;
  END LOOP;
END;
$$;

-- ── 3. Attach trigger to profiles ───────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_create_community_profile ON public.profiles;

CREATE TRIGGER trg_create_community_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_community_profile_for_new_user();

-- ── 4. Backfill existing users ───────────────────────────────────────────────

DO $$
DECLARE
  rec         RECORD;
  v_base      text;
  v_handle    text;
  v_attempt   int;
  v_email     text;
BEGIN
  FOR rec IN
    SELECT p.id, p.display_name
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.community_profiles cp WHERE cp.user_id = p.id
    )
  LOOP
    v_base := lower(regexp_replace(split_part(trim(COALESCE(rec.display_name, '')), ' ', 1), '[^a-zA-Z0-9_]', '', 'g'));

    IF length(v_base) < 2 THEN
      SELECT email INTO v_email FROM auth.users WHERE id = rec.id;
      v_base := lower(regexp_replace(split_part(COALESCE(v_email, 'caregiver'), '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));
      v_base := left(v_base, 20);
    END IF;

    IF length(v_base) < 2 THEN
      v_base := 'caregiver';
    END IF;

    v_attempt := 0;
    LOOP
      v_attempt := v_attempt + 1;
      v_handle := v_base || '_' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

      BEGIN
        INSERT INTO public.community_profiles (
          user_id, handle, bio, avatar_color, handle_is_auto_generated
        ) VALUES (
          rec.id, v_handle, '', '#00BCD4', true
        );
        EXIT; -- inserted successfully
      EXCEPTION WHEN unique_violation THEN
        IF v_attempt >= 10 THEN
          v_handle := v_base || '_' || extract(epoch from clock_timestamp())::bigint % 100000;
          INSERT INTO public.community_profiles (
            user_id, handle, bio, avatar_color, handle_is_auto_generated
          ) VALUES (
            rec.id, v_handle, '', '#00BCD4', true
          )
          ON CONFLICT DO NOTHING;
          EXIT;
        END IF;
      END;
    END LOOP;
  END LOOP;
END;
$$;
