# Database Reconstruction Report

Generated: 2026-06-29

## Overview

This report documents the full audit of 240+ migration files, frontend code, and edge functions to produce a consolidated database schema for CareView. The database is being rebuilt from scratch (fresh Supabase instance, no existing data).

---

## Tables in Final Schema

### Core Tables

| Table | Source | RLS |
|-------|--------|-----|
| profiles | Base schema + i18n additions | Yes |
| observations | Base schema + renames + guest column | Yes |
| responses | Base schema + category_notes column | Yes |
| categories | Base schema + sort_order + translations | Yes |
| questions | Base schema + translations column | Yes |
| legend | Base schema + translations column | Yes |

### Team Management

| Table | Source | RLS |
|-------|--------|-----|
| cv_team | Base schema | Yes |
| cv_team_members | Base schema | Yes |
| cv_team_invites | Base schema | Yes |
| cv_team_patient | Base schema + resident profile extensions | Yes |

### Subscription & Billing

| Table | Source | RLS |
|-------|--------|-----|
| subscription_plans | Base schema | Yes |
| user_subscriptions | Base schema | Yes |
| cv_plan_limits | Base schema | Yes |
| stripe_customers | Base schema | Yes |
| stripe_subscriptions | Base schema | Yes |

### Internationalization

| Table | Source | RLS |
|-------|--------|-----|
| supported_locales | i18n foundation migration | Yes |
| ui_translations | i18n foundation migration | Yes |

### Community (INFERRED base + confirmed upgrades)

| Table | Source | RLS |
|-------|--------|-----|
| community_rooms | INFERRED from upgrade migration | Yes |
| community_profiles | INFERRED + upgrade migration | Yes |
| community_posts | INFERRED + upgrade migration | Yes |
| community_replies | INFERRED + upgrade migration | Yes |
| community_reactions | INFERRED from frontend code | Yes |
| community_reports | INFERRED + upgrade migration | Yes |
| community_bans | INFERRED from edge function refs | Yes |
| community_notifications | Notifications migration | Yes |

### Memory Book

| Table | Source | RLS |
|-------|--------|-----|
| memory_books | Memory book phase 1 | Yes |
| memory_book_identity | Memory book phase 1 | Yes |
| memory_book_contacts | Memory book phase 1 | Yes |
| memory_book_medical | Memory book phase 1 | Yes |
| memory_book_preferences | Memory book phase 1 | Yes |
| memory_book_providers | Household management | Yes |
| memory_book_insurance | Household management | Yes |
| memory_book_finances | Household management | Yes |
| memory_book_subscriptions | Household management | Yes |
| memory_book_vehicle | Household management | Yes |
| memory_book_insurance_entries | Structured entries | Yes |
| memory_book_finance_entries | Structured entries | Yes |
| memory_book_medical_entries | Structured entries | Yes |
| memory_book_preference_entries | Structured entries | Yes |
| memory_book_daily_living_entries | Daily living ADL | Yes |
| memory_book_social_accounts | Social accounts | Yes |
| memory_book_household_providers | Household providers | Yes |
| memory_book_vehicle_care | Vehicle care | Yes |
| memory_book_home_address | Home address | Yes |

### Care Plan

| Table | Source | RLS |
|-------|--------|-----|
| care_plans | Care plan tables migration | Yes |
| care_plan_sections | Care plan tables migration | Yes |

### Infrastructure

| Table | Source | RLS |
|-------|--------|-----|
| user_onboarding | User onboarding migration | Yes |
| cv_guest_tokens | Guest tokens schema | Yes |
| rate_limit_log | Rate limit table migration | Yes |
| webhook_events | Webhook events migration | Yes |
| email_audit_log | Email audit log migration | Yes |
| admin_events | Base schema (MODIFIED for edge functions) | Yes |
| site_settings | Migrated to public schema | Yes |

### Tables EXCLUDED (intentionally dropped)

| Table | Reason |
|-------|--------|
| stripe_orders | Dropped in migration 20260616 |
| app_secrets | Dropped in migration 20260616 |
| app.site_settings | Migrated to public.site_settings |

---

## Views

| View | Security | Purpose |
|------|----------|---------|
| v_category_questions | INVOKER | Joins categories + questions with i18n translations |
| cv_v_team_remaining | INVOKER | Team observation quota usage |
| v_plan_by_price | None (simple) | Plans sorted by price |
| community_posts_public | BARRIER + INVOKER | Anonymous-safe post view |

---

## Functions / RPCs

### Team Management (authenticated only)
- `cv_get_active_team()` -> uuid
- `cv_set_active_team(p_team uuid)` -> void
- `cv_create_team_with_patient(p_name, p_plan_id, p_patient_name, p_dob, p_gender, p_notes)` -> uuid
- `cv_list_members_with_profile(p_team uuid)` -> TABLE
- `cv_list_invites(p_team uuid)` -> TABLE
- `cv_remove_member(p_team uuid, p_user uuid)` -> void
- `cv_get_team_patient(p_team uuid)` -> TABLE
- `cv_get_remaining(p_team uuid)` -> integer
- `cv_get_solo_remaining()` -> integer

### Invite Management
- `cv_create_invite(p_team uuid, p_email text)` -> jsonb (authenticated)
- `cv_accept_invite(p_token text)` -> uuid (authenticated)
- `cv_revoke_invite(p_invite_id uuid)` -> void (authenticated)
- `cv_peek_invite(p_token text)` -> jsonb (anon + authenticated)
- `cv_email_registered(p_email text)` -> boolean (anon + authenticated)
- `cv_check_team_seats(p_team uuid)` -> boolean (authenticated)

### Guest Observation
- `cv_create_guest_token(p_team, p_resident_name, p_form_type, p_guest_email, p_guest_name)` -> text (authenticated)
- `cv_peek_guest_token(p_token text)` -> jsonb (anon + authenticated)
- `cv_submit_guest_observation(p_token, p_guest_name, p_guest_email, p_observation_date, p_mode, p_notes, p_answers)` -> uuid (anon + authenticated)

### Memory Book
- `mb_get_or_create(p_team_id uuid)` -> uuid (authenticated)
- `cv_sync_resident_to_memory_book_identity(p_team_id uuid)` -> void (authenticated)

### Plan & Subscription
- `cv_apply_plan_to_owner_teams(p_owner uuid, p_plan_id text)` -> void (service_role)
- `enforce_team_observation_quota()` -> trigger

### Translation
- `get_translations_for_locale(p_locale text)` -> json (anon + authenticated)

### Rate Limiting & Webhooks (service_role only)
- `check_rate_limit(p_identifier, p_endpoint, p_max_requests, p_window_minutes)` -> jsonb
- `record_webhook_event(p_event_id, p_event_type, p_status)` -> void

### Helper Functions (authenticated only, no direct call)
- `is_team_member(p_team_id uuid)` -> boolean
- `is_team_owner(p_team_id uuid)` -> boolean
- `get_user_team_ids()` -> SETOF uuid
- `get_active_team_ids()` -> SETOF uuid
- `is_admin()` -> boolean
- `is_community_admin()` -> boolean
- `get_own_profile_immutable_fields()` -> TABLE

### Trigger Functions (no role grants - invoked by triggers only)
- `set_updated_at()`, `community_set_updated_at()`, `set_care_plan_updated_at()`
- `community_on_post_insert()`, `community_on_post_update()`
- `community_on_reply_insert()`, `community_on_reply_update()`
- `community_on_reaction_insert()`, `community_on_reaction_delete()`
- `create_community_profile_for_new_user()`
- `rate_limit_log_cleanup_trigger()`

---

## INFERRED Sections

### Community Base Tables (INFERRED)

The original community base schema migration is missing from the repository. The community tables were reconstructed from:
1. `20260311024320_community_schema_upgrade.sql` (which ALTERs existing tables)
2. Frontend code in `src/lib/community.ts` and community hooks
3. Edge function references in `admin-delete-user` and `admin-data`
4. Policy and index creation migrations

**community_rooms** columns inferred: id (uuid PK), slug (text UNIQUE), name (text), description (text), color (text), icon_name (text), is_active (boolean), post_count (integer), sort_order (integer), created_at (timestamptz)

**community_posts** columns: id (uuid PK), room_id (uuid FK), author_user_id (uuid FK auth.users), is_anonymous (boolean), title (text), body (text), post_status (text), is_locked (boolean), help_type (text), reply_count (integer), reaction_count (integer), last_activity_at (timestamptz), created_at, updated_at

**community_replies** columns: id (uuid PK), post_id (uuid FK), author_user_id (uuid FK), is_anonymous (boolean), body (text), reply_status (text), created_at, updated_at

**community_profiles** columns: user_id (uuid PK FK profiles.id), handle (text UNIQUE), bio (text), avatar_color (text), post_count (integer), reply_count (integer), is_banned (boolean), ban_reason (text), guidelines_accepted_at (timestamptz), handle_is_auto_generated (boolean), created_at, updated_at

**community_reactions** columns: id (uuid PK), post_id (uuid FK), user_id (uuid FK), reaction_type (text), created_at

**community_reports** columns: id (uuid PK), reporter_user_id (uuid FK), post_id (uuid FK nullable), reply_id (uuid FK nullable), reason (text), details (text), report_status (text), reviewed_by (uuid FK nullable), reviewed_at (timestamptz), mod_note (text), created_at

**community_bans** columns (INFERRED from edge function usage): id (uuid PK), user_id (uuid FK), banned_by (uuid FK), reason (text), created_at

### admin_events Table (MODIFIED)

The base schema defines admin_events with: admin_id, event_type, event_data. However, edge functions (`admin-delete-user`, `caregiver-delete-account`) INSERT with columns: actor_id, actor_email, action, target_email, target_user_id, success, details. The consolidated schema uses the edge function schema since that represents actual production usage.

---

## Stale Frontend References

| Reference | Status | Resolution |
|-----------|--------|------------|
| `observations.resident_name` | RENAMED from patient_name | Use `resident_name` in schema |
| `v_category_questions` | EXISTS | View with security_invoker = true |
| `cv_v_team_remaining` | EXISTS | View with security_invoker |
| `community_posts_public` | EXISTS | Security barrier view |
| `categories.translations` | ADDED by i18n | jsonb column |
| `questions.translations` | ADDED by i18n | jsonb column |
| `legend.translations` | ADDED by i18n | jsonb column |
| `profiles.preferred_locale` | ADDED by i18n | text column |

No stale references requiring compatibility views were found. All frontend `.from()` calls reference tables/views that exist in the final schema.

---

## Seed Data Summary

### Included in seed (required for app to function):
- 3 subscription plans (free, primary_qtr, family_qtr) with June 2026 Stripe price IDs
- 3 cv_plan_limits entries
- 8 supported_locales (en, es, fr, de, it, sv, fi, ja)
- All ui_translations (1300+ keys across 8 locales)
- Categories + questions (ADL, IADL with sort_order)
- Legend entries (scores 1-5, reversed scale)
- Community rooms (6 active rooms)
- 1 site_settings row (default empty URLs)

### EXCLUDED from seed (per requirements):
- Admin user profiles (user will create via Supabase Auth)
- Fake auth.users for community starter posts
- Community starter posts/examples (require fake auth.users)

---

## Frontend Compatibility Audit Summary

All frontend `supabase.from()` table references, `.rpc()` calls, and column names were audited against the consolidated schema.

### Scope
- 45+ unique tables/views referenced across `src/`
- All community hooks: `useCommunityPosts`, `useCommunityProfile`, `useCommunityRooms`, `useCommunityReactions`, `useCommunityReplies`, `useCommunityReports`
- All memory book hooks and components
- All team management RPCs in `src/lib/cv.ts`
- All edge function table dependencies

### Findings

#### FIXED — `src/components/layout/Footer.tsx` (line 18)
**Bug:** `.schema("app").from("site_settings")` referenced the old `app.site_settings` table that was migrated to the `public` schema in migration `20260410162315`.
**Fix applied:** Removed `.schema("app")` chain — now calls `.from("site_settings")` against `public` schema.

#### FIXED — `src/components/layout/Header.tsx` (line 22)
**Bug:** Same `.schema("app").from("site_settings")` pattern as Footer.tsx.
**Fix applied:** Removed `.schema("app")` chain.

#### VERIFIED OK — `src/lib/cv.ts` (line 47)
The RPC call `cv_create_team_with_patient` passes `p_patient_name` as a parameter name. This was audited against the consolidated function definition in `consolidated_02a_functions_core_team.sql` — the function signature uses `p_patient_name` throughout. No change required.

#### VERIFIED OK — `src/hooks/usePrefetchStatic.ts`
Calls `.from("site_settings")` without a schema prefix — already correct.

#### VERIFIED OK — Community tables
All community hooks correctly use the renamed columns: `post_status`, `reply_status`, `author_user_id`, `reporter_user_id`, `report_status`. Column `user_id` used as PK on `community_profiles` matches trigger function expectations.

### Schema modification applied during reconstruction
- **admin_events**: Edge functions (`admin-delete-user`, `caregiver-delete-account`) INSERT with columns `actor_id, actor_email, action, target_email, target_user_id, success, details`. Consolidated schema adopted the edge function column names rather than the original base schema definition.

### Result
All frontend references are now compatible with the consolidated schema. Two bugs fixed (`.schema("app")` in Header and Footer). No other incompatibilities found.
