# CarerView — Architecture & Developer Reference

> **Stack:** React 18 · TypeScript · Vite · Supabase (PostgreSQL + Edge Functions) · TailwindCSS · TanStack Query · Stripe

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Tech Stack](#3-tech-stack)
4. [Frontend Architecture](#4-frontend-architecture)
   - [Entry Point & Providers](#41-entry-point--providers)
   - [Routing](#42-routing)
   - [Layouts](#43-layouts)
   - [State Management](#44-state-management)
   - [Context Providers](#45-context-providers)
5. [Authentication](#5-authentication)
   - [Regular User Auth](#51-regular-user-auth-supabase)
   - [Admin Auth](#52-admin-auth-custom-jwt)
6. [Data Access Layer](#6-data-access-layer)
   - [Hooks Pattern](#61-hooks-pattern)
   - [Service Libraries](#62-service-libraries)
7. [Internationalisation (i18n)](#7-internationalisation-i18n)
8. [Backend — Supabase Edge Functions](#8-backend--supabase-edge-functions)
9. [Database Design](#9-database-design)
   - [Core Tables](#91-core-tables)
   - [Row-Level Security (RLS)](#92-row-level-security-rls)
   - [Migrations](#93-migrations)
10. [Subscription & Billing (Stripe)](#10-subscription--billing-stripe)
11. [Error Handling Strategy](#11-error-handling-strategy)
12. [Guards & Access Control](#12-guards--access-control)
13. [Key Patterns & Conventions](#13-key-patterns--conventions)
14. [Development Commands](#14-development-commands)

---

## 1. Project Overview

**CarerView** is a web application for informal caregivers (family members looking after elderly relatives). It provides:

| Feature | Description |
|---|---|
| **Observations** | Log daily care observations for a resident |
| **Memory Book** | Structured profile of the care recipient |
| **Care Plan** | Guided care planning builder with gap analysis |
| **Community** | Moderated discussion rooms for caregivers |
| **New Carer Guide** | Educational module for first-time caregivers |
| **Team / Family Circle** | Multiple caregivers sharing one care plan |
| **Guest Submissions** | Token-based external submissions (no account required) |
| **Admin Portal** | Separate admin dashboard for platform management |

---

## 2. Repository Structure

```
.
├── src/                        # React/TypeScript frontend
│   ├── App.tsx                 # Root router and provider tree
│   ├── main.tsx                # Vite entry point
│   ├── components/             # UI components (feature-scoped)
│   │   ├── admin/
│   │   ├── care-plan/
│   │   ├── caregiver/
│   │   ├── common/             # Guards, AuthForm, etc.
│   │   ├── community/
│   │   ├── layout/             # MainLayout, AdminLayout, AuthLayout
│   │   ├── memory-book/
│   │   ├── new-carer/
│   │   ├── seo/
│   │   ├── ui/                 # Design-system primitives
│   │   └── util/               # ErrorBoundary, ScrollToTop, etc.
│   ├── context/                # React Contexts (auth, active team)
│   ├── hooks/                  # TanStack Query hooks per feature
│   ├── i18n/                   # Locale provider, context, types
│   ├── lib/                    # Service layer, utilities, error handling
│   ├── pages/                  # One file per route
│   ├── types/                  # Shared TypeScript types
│   └── stripe-config.ts        # Stripe product definitions
│
├── supabase/
│   ├── functions/              # Deno Edge Functions (backend)
│   │   ├── _shared/            # Shared utilities across functions
│   │   ├── admin-data/         # Admin API (all admin actions)
│   │   ├── admin-bootstrap/    # One-time admin setup
│   │   ├── admin-delete-user/  # Hard delete user
│   │   ├── caregiver-delete-account/
│   │   ├── notify-*/           # Email notification functions
│   │   ├── send-*/             # Invite / email send functions
│   │   ├── stripe-checkout/
│   │   ├── stripe-ensure-customer/
│   │   ├── stripe-portal/
│   │   └── stripe-webhook/
│   ├── migrations/             # Ordered SQL migration files
│   ├── migrations_legacy/
│   └── config.toml
│
├── database_recovery/          # DB recovery scripts and i18n snapshots
├── docs/                       # Developer documentation
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 18 with TypeScript |
| **Build tool** | Vite 5 |
| **Styling** | TailwindCSS 3 |
| **Routing** | React Router v6 |
| **Server state** | TanStack Query v5 |
| **Backend / DB** | Supabase (PostgreSQL 15) |
| **Serverless functions** | Supabase Edge Functions (Deno) |
| **Auth** | Supabase Auth (for users) + custom HMAC-JWT (for admins) |
| **Payments** | Stripe (subscriptions + customer portal) |
| **Icons** | Lucide React |
| **SEO** | react-helmet-async |
| **Document export** | docx + file-saver |
| **Testing** | Vitest + Testing Library |
| **Analytics** | Google Ads (gtag) |

---

## 4. Frontend Architecture

### 4.1 Entry Point & Providers

`src/main.tsx` bootstraps the app inside `React.StrictMode` with a top-level `ErrorBoundary`.

`src/App.tsx` composes the full provider tree (outermost → innermost):

```
HelmetProvider
  BrowserRouter
    QueryClientProvider          ← TanStack Query
      AuthProvider               ← Supabase session + profile
        AppLocaleWrapper         ← i18n locale detection
          ToastProvider          ← Global toast notifications
            ActiveTeamProvider   ← Active care team state
              Routes
```

### 4.2 Routing

All routes are declared in `App.tsx` using React Router v6. Routes are grouped by layout:

| Layout | Routes |
|---|---|
| `MainLayout` | Public marketing pages, auth pages, community |
| `AuthLayout` | Authenticated caregiver pages (with sidebar) |
| `AdminLayout` | Admin portal pages |
| *(no layout)* | `/auth/callback`, `/auth/error` |

Sensitive caregiver routes are wrapped in `<CaregiverGuard>` and `<ErrorBoundary>` inline at the route level.

### 4.3 Layouts

| Component | Responsibility |
|---|---|
| `MainLayout` | Header + Footer + offline banner + community banner |
| `AuthLayout` | Sidebar + main content for signed-in users |
| `AdminLayout` | Admin sidebar + header |

`MainLayout` uses `useOnlineStatus()` to conditionally show an `OfflineBanner` and includes a "Skip to main content" accessibility link.

### 4.4 State Management

There is **no global state library** (no Redux/Zustand). State is handled by two complementary systems:

1. **TanStack Query** — all server state (observations, plans, community posts, translations, etc.)
2. **React Context** — ambient client state (auth session, active team, locale, toasts)

The `QueryClient` (`src/lib/queryClient.ts`) is configured with:
- `staleTime: 5 min` — avoids redundant refetches
- `gcTime: 10 min` — keeps cached data for back-navigation
- `refetchOnWindowFocus: false`
- `networkMode: 'offlineFirst'`
- Custom `shouldRetry` logic that skips retries for `auth` and `validation` errors

### 4.5 Context Providers

| Context | File | Purpose |
|---|---|---|
| `AuthContext` | `src/context/AuthContext.tsx` | Supabase user session + profile + role |
| `ActiveTeam` | `src/context/ActiveTeam.tsx` | Currently selected care team ID |
| `LocaleContext` | `src/i18n/LocaleContext.tsx` | Active locale + `t()` translation function |

---

## 5. Authentication

### 5.1 Regular User Auth (Supabase)

**Supabase client** (`src/lib/supabaseClient.ts`) is configured with:
- `persistSession: true` — stored in `localStorage` under key `careview-auth`
- `autoRefreshToken: true`
- `flowType: 'implicit'`
- `detectSessionInUrl: true` — handles magic links and OAuth redirects

**`AuthProvider`** (`src/context/AuthContext.tsx`) manages the full auth lifecycle:

1. Calls `supabase.auth.getSession()` on mount
2. Subscribes to `supabase.auth.onAuthStateChange()` for login/logout events
3. On each session, runs `upsertProfile()` — creates a `profiles` row if missing, syncs email
4. Blocks disabled accounts immediately (`profile.disabled === true` → force sign out)
5. Sets a 10-second hard timeout on loading to prevent infinite spinners
6. Exposes: `user`, `userId`, `email`, `profile`, `role`, `isAdmin`, `loading`, `error`

All components consume auth via `useAuth()` (re-exported from `src/hooks/useAuth.ts`).

Admin users are blocked from signing into the caregiver portal — `AuthForm` checks the returned role and calls `signOut()` with an error message.

### 5.2 Admin Auth (Custom JWT)

Admins authenticate through `/admin/login` using a separate custom JWT flow:

- Token is stored in **`sessionStorage`** (cleared on tab close, never in localStorage)
- `getAdminToken()` validates the token on every read: 3-part JWT, `role === 'admin'`, not expired
- `useAdminSession()` hook provides `{ isAuthenticated, token, signOut }`
- `AdminGuard` redirects to `/admin/login` if no valid token exists

The `admin-data` Edge Function verifies every request independently using **HMAC-SHA256** (`crypto.subtle.verify`) against the `ADMIN_SECRET` server environment variable.

```
Frontend token (sessionStorage JWT)
  ↓ Authorization: Bearer <token>
admin-data Edge Function
  → verify HMAC signature
  → check role === 'admin'
  → check exp
  → IP rate limit (60 req/min via check_rate_limit RPC)
  → execute action
```

---

## 6. Data Access Layer

### 6.1 Hooks Pattern

All data fetching uses **TanStack Query hooks** in `src/hooks/`. Each hook is scoped to a feature:

| Hook | Responsibility |
|---|---|
| `useObservations()` | List / CRUD observations for current user |
| `useUserPlan()` | Fetch active subscription (own or via team) |
| `useCommunityPosts()` | Posts for a community room |
| `useCommunityReplies()` | Replies within a post |
| `useCommunityReactions()` | Reaction counts + current user reactions |
| `useMemoryBook()` | Memory book sections for a resident |
| `useCarePlan()` | Care plan data and section answers |
| `useCategoryQuestions()` | Observation form question categories |
| `useOnboarding()` | Tracks which onboarding steps are complete |
| `useUserPlan()` | Plan status, limits, and source (own vs team) |
| `useDatabaseHealth()` | DB connection health check |

Query keys follow the pattern `[resource, scopeId]` — e.g. `['observations', user.id]`.

### 6.2 Service Libraries

Pure async service functions live in `src/lib/`:

| File | Responsibility |
|---|---|
| `supabaseClient.ts` | Configured Supabase client singleton |
| `cv.ts` | Team CRUD — `cvCreateTeamWithResident`, `cvListMembersWithProfile`, etc. via RPC |
| `community.ts` | Community posts, replies, profiles, reports (direct DB + admin Edge Function) |
| `caregiver.ts` | Caregiver-specific DB calls |
| `admin.ts` | Wrapper around the `admin-data` Edge Function |
| `exports.ts` | DOCX export for care plans and observations |
| `carePlanGaps.ts` | Logic to detect gaps in a care plan |
| `subPeriod.ts` | Subscription period date utilities |
| `passwordValidation.ts` | Password strength validation |
| `navigation.ts` | Route constants |
| `siteConfig.ts` | Site-wide constants (URL, name) |
| `analytics.ts` | Google Ads conversion and event tracking |
| `errorLogger.ts` | Batched error log writes to `error_logs` table |
| `globalErrorHandler.ts` | `window.onerror` + `unhandledrejection` setup |
| `errors.ts` | Error classification into typed `ClassifiedError` |

---

## 7. Internationalisation (i18n)

Translations are stored in **PostgreSQL** (`ui_translations` table) and fetched via the `get_translations_for_locale` RPC. The system supports 8 locales: `en`, `es`, `it`, `fr`, `de`, `sv`, `fi`, `ja`.

**Cache layers (fastest → slowest):**
1. `window.__CV_TRANSLATIONS__` — bootstrap cache injected at build/render time
2. `localStorage` (key: `cv_trans_<locale>_v11`) — per-version locale cache
3. Supabase RPC call — live fetch

**`LocaleProvider`** (`src/i18n/LocaleProvider.tsx`):
- Reads user's preferred locale from `localStorage` or `profile.preferred_locale`
- Provides `t(key, vars?)` function with support for:
  - Simple `{variable}` interpolation
  - ICU-style plurals: `{count, plural, one {item} other {items}}`
- Sets `dir="rtl"` on `<html>` for RTL locales

**`AppLocaleWrapper`** (`src/i18n/AppLocaleWrapper.tsx`) bridges auth state into locale selection (syncs `profile.preferred_locale` into `LocaleProvider`).

All UI strings throughout the app use `const { t } = useLocale()` — no hardcoded English strings in components.

---

## 8. Backend — Supabase Edge Functions

All Edge Functions are Deno-based and live in `supabase/functions/`.

| Function | Purpose |
|---|---|
| `admin-data` | Central admin API (stats, users, translations, community moderation) |
| `admin-bootstrap` | One-time admin account setup |
| `admin-delete-user` | Hard-delete a user and all their data |
| `caregiver-delete-account` | Self-service account deletion |
| `notify-welcome` | Send welcome email on signup |
| `notify-payment` | Send payment confirmation email |
| `notify-admin-report` | Alert admin on community report |
| `notify-guest-submitted` | Confirm guest observation submission |
| `notify-member-joined` | Team join notification |
| `send-invite-email` | Send team invite link |
| `send-guest-invite` | Send token-based guest observation invite |
| `stripe-checkout` | Create Stripe checkout session |
| `stripe-ensure-customer` | Get or create Stripe customer |
| `stripe-portal` | Create Stripe billing portal session |
| `stripe-webhook` | Handle Stripe events (subscription lifecycle) |

**Common patterns across all Edge Functions:**
- CORS is handled per-request with origin validation against `PUBLIC_SITE_URL`
- Rate limiting via `check_rate_limit` PostgreSQL RPC (IP-based)
- All responses use `Content-Type: application/json`
- Error responses always include `{ error: string }`

---

## 9. Database Design

### 9.1 Core Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase `auth.users` — role, display_name, email, disabled, preferred_locale |
| `cv_teams` | Care teams (one per care recipient) |
| `cv_team_members` | Team membership (owner / member, active / frozen) |
| `cv_team_patient` | Care recipient details (name, DOB, gender, notes) |
| `cv_invites` | Pending team invite tokens |
| `observations` | Daily care log entries |
| `user_subscriptions` | Active subscription per user (links to `subscription_plans`) |
| `subscription_plans` | Plan definitions (free, primary_qtr, family_qtr) with limits |
| `care_plan_sections` | Care plan sections keyed by `section_key` |
| `memory_book_*` | Memory book sections (personal info, medical, etc.) |
| `community_rooms` | Moderated discussion rooms |
| `community_posts` | Posts within rooms |
| `community_replies` | Replies to posts |
| `community_profiles` | Community display name, handle, ban status |
| `community_reports` | Moderation reports |
| `community_notifications` | In-app notifications |
| `community_bans` | Ban audit log |
| `ui_translations` | All UI text strings keyed by `(key, locale)` |
| `supported_locales` | Active locales configuration |
| `error_logs` | Frontend error log entries |
| `rate_limit_log` | IP-based rate limit tracking |
| `user_onboarding` | Tracks onboarding state per user |

### 9.2 Row-Level Security (RLS)

RLS is enabled on all user-facing tables. Core policy patterns:

- **Own data only** — `auth.uid() = user_id` for observations, subscriptions, onboarding
- **Team-scoped** — users can only read/write data for teams they're members of
- **Admin bypass** — service role key bypasses all RLS (used only in Edge Functions)
- **Guest tokens** — `verify_guest_token()` RPC validates one-time tokens for guest submissions
- **Community** — posts/replies readable by all authenticated users; write restricted to non-banned members

Anonymous access to sensitive functions (e.g. session helpers, webhook handlers) is explicitly revoked via `REVOKE EXECUTE` in migrations.

### 9.3 Migrations

All schema changes are SQL migration files in `supabase/migrations/` named with timestamps. Migrations are ordered and cumulative — the consolidated set (`consolidated_01` through `consolidated_06`) provides the full baseline schema, with incremental patches on top.

---

## 10. Subscription & Billing (Stripe)

Plans are defined in `src/stripe-config.ts` (`STRIPE_PRODUCTS`) and in the DB `subscription_plans` table.

| Plan ID | Name | Observation Limit |
|---|---|---|
| `free` | Community Member | 3 / year |
| `primary_qtr` | Primary Carer | 100 / year |
| `family_qtr` | Family Circle | 200 / year (team) |

**Checkout flow:**
1. User selects plan on `/pricing` or `/choose-plan`
2. Frontend calls `stripe-checkout` Edge Function → returns Stripe session URL
3. User completes payment on Stripe-hosted page
4. Redirect to `/checkout/success` — polls `useUserPlan()` until plan activates
5. `stripe-webhook` Edge Function receives Stripe events and writes to `user_subscriptions`

`useUserPlan()` resolves the effective plan by checking:
1. Own active subscription
2. Team owner's subscription (for team members)

`hasActivePlan(plan)` validates both `status` (`active`|`trialing`) and that `now` is within `[current_period_start, current_period_end]`.

---

## 11. Error Handling Strategy

Errors flow through a layered pipeline:

```
Component crash
  → ErrorBoundary (catches React render errors)
      → classifyError() → ClassifiedError { errorClass, severity, retryable }
          → logError() → batched write to error_logs table (10s flush, batch=5)

window.onerror / unhandledrejection
  → globalErrorHandler (set up in main.tsx)
      → same classifyError → logError pipeline

TanStack Query mutations
  → queryClient onError → classifyError → logError

Network / auth errors
  → errors.ts classifies by HTTP status, message patterns, navigator.onLine
```

Error classes: `network` | `auth` | `rate_limit` | `server` | `validation` | `offline` | `unknown`

Retry logic in `QueryClient`:
- Max 3 retries
- No retry for `auth` or `validation` errors
- No retry when `navigator.onLine === false`
- Exponential back-off via `retryDelay`

---

## 12. Guards & Access Control

Guards are React components wrapping route content:

| Guard | Checks |
|---|---|
| `CaregiverGuard` | Auth + active plan + not frozen + onboarding redirect |
| `AdminGuard` | Valid admin JWT in sessionStorage |
| `CommunityGuard` | Authenticated user |
| `PaidPlanGuard` | Active paid plan |
| `TeamGuard` | Active team membership |

`CaregiverGuard` also handles the **care hub onboarding redirect** — first-time paid users visiting `/caregiver` are redirected to `/care-hub/care-plan` and `markCareHubVisited()` is called.

---

## 13. Key Patterns & Conventions

### Hooks as the only data access point
Components never call Supabase directly — they always go through a custom hook or a lib service function.

### Single auth subscription
`AuthProvider` uses a single `onAuthStateChange` subscription shared via React Context, avoiding the React Error #310 bug that occurred when multiple components each subscribed independently.

### Stable query keys
Query keys include only stable IDs, never mutable auth state that resolves asynchronously. This prevents cache key mismatches during session load.

### Disabled-account enforcement at two layers
1. `AuthProvider` — signs out disabled users on session load
2. `AuthForm` — checks profile after sign-in before navigating

### i18n-first UI strings
No hardcoded English strings in components. Every user-visible string goes through `t(key)`. Translations are seeded and managed via DB migrations.

### Edge Function action dispatch
`admin-data` uses a single `POST /admin-data` endpoint with `{ action, payload }` body — acting as an internal RPC bus. This avoids deploying many small functions while keeping all admin logic server-side.

### Export-as-docx
Care plans and observations can be exported as `.docx` files via `src/lib/exports.ts` using the `docx` library, triggered client-side with `file-saver`.

---

## 14. Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check + build
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Supabase local dev (requires Supabase CLI)
supabase start
supabase db push
supabase functions serve

# Deploy a single Edge Function
supabase functions deploy admin-data
```

**Required environment variables (`.env.local`):**

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=<stripe-pk>
```

**Required Edge Function secrets (set via Supabase dashboard or CLI):**

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_SECRET
PUBLIC_SITE_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY  (or equivalent email provider key)
```