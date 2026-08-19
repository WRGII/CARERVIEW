# CarerView Database Restore Instructions

Use these instructions if the Supabase project becomes unavailable again and you need to rebuild the database from scratch.

---

## Prerequisites

- A fresh Supabase project provisioned in Bolt
- The project `.env` file updated with the new project's `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL`
- Access to `supabase/migrations/` in the codebase

---

## Step 1: Identify the Active Migration Folder

The active, authoritative migration set lives in:

```
supabase/migrations/
```

This folder contains **65 files**, all prefixed `20260629_`, representing the full consolidated schema rebuild as of 2026-06-29.

Do NOT run files from:
- `supabase/migrations_legacy/` — archived historical migrations, already consolidated into the active set
- `supabase/migrations/_archive/` — discarded experimental migrations
- `.bolt/supabase_discarded_migrations/` — Bolt-discarded migrations

---

## Step 2: Apply Migrations via Bolt MCP

In Bolt, migrations are applied using the `apply_migration` MCP tool, not the Supabase CLI. Apply them in filename order (they are already named to sort correctly).

The consolidated files apply in this order:

1. `20260629013605_consolidated_01_extensions_enums_tables.sql` — core schema
2. `20260629013825_consolidated_01b_fix_table_schemas.sql`
3. `20260629013849_consolidated_01c_cv_team_patient_extensions.sql`
4. `20260629014017_consolidated_02a_functions_core_team.sql`
5. `20260629014142_consolidated_02b_functions_invites_quotas_guest_community.sql`
6. `20260629014337_consolidated_03a_fix_community_and_memory_book_columns.sql`
7. `20260629014417_consolidated_03b_views_triggers.sql`
8. `20260629014435_consolidated_03c_indexes.sql`
9. `20260629014507_consolidated_03d_rls_policies_part1.sql`
10. `20260629014600_consolidated_03e_rls_policies_part2.sql`
11. `20260629014623_consolidated_03f_grants.sql`
12. `20260629014802_consolidated_04a_fix_seed_table_columns.sql`
13. `20260629014906_consolidated_04b_fix_supported_locales_nulls.sql`
14. `20260629014937_consolidated_05b_seed_data.sql`
15. `20260629015053_consolidated_05c_seed_questions.sql`
16. Then all remaining `20260629_*.sql` files in order

---

## Step 3: Verify Core Structure

After applying all migrations, run these verification queries:

```sql
-- All expected tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- All expected views exist
SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Translation row count
SELECT locale, COUNT(*) FROM ui_translations GROUP BY locale ORDER BY locale;

-- Supported locales
SELECT code, label, is_active FROM supported_locales ORDER BY sort_order;

-- RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

The last query should return only `cv_plan_limits` (read-only config table — intentionally unprotected).

---

## Step 4: Verify RPCs

```sql
-- Translations RPC returns data
SELECT count(*) FROM (
  SELECT jsonb_object_keys(get_translations_for_locale('en')::jsonb)
) k;
-- Expected: ~2,577

-- Community stats RPC is callable
SELECT * FROM get_community_public_stats();
```

---

## Step 5: Create Admin User

**Do NOT seed auth.users manually.** Instead:

1. Go to the app and create a user account through the normal sign-up flow
2. Log into the Supabase dashboard (or use the SQL editor)
3. Run the SQL from `database_recovery/ADMIN_PROMOTION.sql` with the real email address
4. Verify by checking `SELECT role FROM profiles WHERE email = 'your@email.com'`

---

## Step 6: Run the App Build

```
npm run build
```

Expected result: `✓ built in ~18s` with all routes prerendered. Zero errors.

---

## Step 7: Post-Restore Checklist

Work through `database_recovery/VERIFICATION_CHECKLIST.md` item by item before marking the restore complete.

---

## Important Notes

- **Stripe price IDs** in `cv_plan_limits` must match the live Stripe environment. Verify after restoring.
- **Edge functions** must be redeployed separately via the `deploy_edge_function` MCP tool. They are not covered by migrations.
- **File storage** (if used) must be separately restored. The database rebuild does not restore storage bucket contents.
- **Auth users** cannot be migrated from a dead Supabase project. All users must re-register.
- **The `.env` file** contains credentials for the current project. Update it after provisioning a new project. Never commit the `.env` file.
