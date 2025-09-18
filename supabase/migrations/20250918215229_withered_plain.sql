-- Normalize to public.user_subscriptions, migrate away from app.user_subscriptions
-- Idempotent and safe to re-run.

DO $$
BEGIN
  -- 1) Ensure schemas exist (public should, app may or may not)
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'app') THEN
    EXECUTE 'CREATE SCHEMA app';
  END IF;
END $$;

-- 2) If both tables exist and app has rows not in public, copy them over.
-- Try primary key first; fall back to a composite if PK differs. We assume "id" is a unique identifier when present.

DO $$
DECLARE
  has_app_table boolean;
  has_public_table boolean;
  has_id_column boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'app' AND table_name = 'user_subscriptions'
  ) INTO has_app_table;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_subscriptions'
  ) INTO has_public_table;

  IF has_app_table AND has_public_table THEN
    -- check for id column
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'user_subscriptions' AND column_name = 'id'
    ) INTO has_id_column;

    IF has_id_column THEN
      -- Copy by id
      EXECUTE $sql$
        INSERT INTO public.user_subscriptions
        SELECT *
        FROM app.user_subscriptions a
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.user_subscriptions p
          WHERE p.id = a.id
        )
      $sql$;
    ELSE
      -- Fallback: attempt copy by (user_id, subscription_id) if those exist
      PERFORM 1 FROM information_schema.columns WHERE table_schema='app' AND table_name='user_subscriptions' AND column_name='user_id';
      IF FOUND THEN
        PERFORM 1 FROM information_schema.columns WHERE table_schema='app' AND table_name='user_subscriptions' AND column_name='subscription_id';
        IF FOUND THEN
          EXECUTE $sql$
            INSERT INTO public.user_subscriptions
            SELECT *
            FROM app.user_subscriptions a
            WHERE NOT EXISTS (
              SELECT 1
              FROM public.user_subscriptions p
              WHERE p.user_id = a.user_id AND p.subscription_id = a.subscription_id
            )
          $sql$;
        END IF;
      END IF;
    END IF;
  END IF;
END $$;

-- 3) Replace app.user_subscriptions TABLE with a VIEW pointing to public.user_subscriptions
DO $$
DECLARE
  is_table boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'app' AND table_name = 'user_subscriptions'
  ) INTO is_table;

  IF is_table THEN
    EXECUTE 'DROP TABLE app.user_subscriptions';
  END IF;

  -- Create or replace a compatibility VIEW
  EXECUTE 'CREATE OR REPLACE VIEW app.user_subscriptions AS SELECT * FROM public.user_subscriptions';
END $$;