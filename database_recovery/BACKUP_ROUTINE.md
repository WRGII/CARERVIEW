# CarerView Backup Routine

---

## What GitHub Protects (and What It Does Not)

**GitHub protects:**
- All application source code
- All migration files in `supabase/migrations/`
- All archived legacy migrations in `supabase/migrations_legacy/`
- Edge function source code
- Configuration files

**GitHub does NOT protect:**
- Live database contents (user accounts, observations, team data, posts)
- Supabase Auth user records
- File storage bucket contents (if storage is ever used)
- Environment variables and secrets (never commit `.env`)

If the Supabase project becomes unavailable and you have no database dump, user data is lost. Only the schema can be rebuilt from migrations.

---

## Database Export (Supabase Dashboard)

### Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings → Database**
3. Use **Database Backups** if your plan includes it (Pro plan and above)
4. Or use **SQL Editor → Export** for targeted table exports

### Via `pg_dump` (requires direct DB access)

```bash
pg_dump \
  --host=<your-project-ref>.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-owner \
  --no-acl \
  --format=custom \
  --file=careview_backup_$(date +%Y%m%d).dump
```

Use `SUPABASE_DB_URL` from your `.env` for the connection string.

### Export Only User Data (without schema)

If you only need to preserve user-generated data (not schema):

```sql
-- Export observations
COPY (SELECT * FROM observations) TO '/tmp/observations_backup.csv' CSV HEADER;

-- Export profiles (excluding auth details)
COPY (SELECT id, email, display_name, role, created_at FROM profiles) TO '/tmp/profiles_backup.csv' CSV HEADER;
```

---

## Auth User Handling

Supabase Auth users (`auth.users`) **cannot be exported with a standard pg_dump** unless you have service-role database access with auth schema permissions. Even then, password hashes cannot be transferred to a new Supabase project.

**Practical approach for recovery:**
- Export a CSV of email addresses from `public.profiles` before a migration
- After restore, notify affected users to re-register
- Promote admin users using `ADMIN_PROMOTION.sql`

Once real production users exist, this becomes a significant data loss risk. Plan accordingly.

---

## Recommended Backup Cadence

### During Active Development

| Trigger | Action |
|---------|--------|
| Before any migration that alters existing tables | Manual pg_dump |
| Before any destructive SQL (even if not expected to be destructive) | Manual pg_dump |
| Weekly | Export key tables (observations, profiles, community_posts) to CSV |
| After any major feature ships | Full pg_dump |

### After Production Launch (Real Users)

| Trigger | Action |
|---------|--------|
| Daily | Automated Supabase Pro backup (enable in dashboard) |
| Weekly | Manual pg_dump stored off-site |
| Before any migration | Manual pg_dump |
| Monthly | Verify restore procedure on a test project |

---

## Storage Buckets (If Used)

CarerView does not currently use Supabase Storage buckets. If storage is added in future:

- Storage bucket contents are NOT covered by database backups
- Export storage contents separately using the Supabase Storage API or dashboard
- Store exported files in a secure, private location (not the GitHub repo)

---

## Security Reminders

**Never commit to a public or private repo:**
- `.env` files containing real credentials
- Database dump files containing real user data
- Auth tokens, API keys, or secrets of any kind

**Do store privately:**
- Database dumps (encrypted, access-controlled cloud storage)
- A copy of the current `.env` in a secure password manager (1Password, Bitwarden, etc.)
- Stripe webhook secrets and Supabase service role keys

---

## Supabase Pro Backup Note

The free Supabase tier does not include automated backups. The Pro tier ($25/month) includes:
- Daily automated backups with 7-day retention
- Point-in-time recovery (available on higher tiers)

Upgrade to Pro before going to production with real users.
