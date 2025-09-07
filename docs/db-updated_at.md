# Database Updated At Configuration

This document contains SQL commands to configure automatic `created_at` and `updated_at` timestamp management for the `observations` table.

## SQL Commands

Run the following SQL in your Supabase SQL editor:

```sql
ALTER TABLE public.observations
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_updated_at ON public.observations;
CREATE TRIGGER trg_touch_updated_at
BEFORE UPDATE ON public.observations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

NOTIFY pgrst, 'reload schema';
```

## What This Does

- Sets default values for `created_at` and `updated_at` columns to `now()`
- Creates a trigger function that automatically updates the `updated_at` timestamp on row updates
- Applies the trigger to the `observations` table
- Notifies PostgREST to reload the schema cache

## Notes

- The client application should NOT send `updated_at` values - the database will handle this automatically
- The `last_saved_at` column has been removed from the client code as it's not needed
- All timestamp management is now handled at the database level for consistency