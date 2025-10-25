# Bolt Reconnection Guide

## Overview

This guide explains how the CarerView application maintains persistent connection to your Supabase database when reopening Bolt.new or accessing the published site.

## How It Works

Your Supabase database is a cloud-hosted service that exists independently of the Bolt.new development environment. When you close and reopen Bolt.new:

1. **Database Persists**: Your Supabase database remains active at `vmhbujxtvgnnkaykpzas.supabase.co`
2. **Frontend Reconnects**: The React app automatically reconnects using credentials from `.env`
3. **No Migration Needed**: Migrations only need to run once (they're already applied to your remote database)
4. **Sessions Restore**: User authentication sessions are preserved in localStorage

## What Happens When You Reopen Bolt.new

### Automatic Actions
- Environment variables are loaded from `.env` file
- Supabase client initializes with URL and anon key
- Database health check runs automatically
- Connection status displays in bottom-right corner
- Frontend fetches data from existing database

### What Does NOT Happen
- Migrations do NOT re-run (they're already in your database)
- Database does NOT reset or recreate
- Edge functions remain deployed
- User data persists exactly as it was

## Database Status Indicator

A connection status widget appears in the bottom-right corner showing:

- **Green Dot + "Healthy"**: Successfully connected, all tables found
- **Red Dot + "Unhealthy"**: Connection failed or missing tables
- **Yellow Dot + "Checking"**: Currently validating connection

### Viewing Details

Click the status indicator to expand and see:
- Connection status (Connected/Disconnected)
- Supabase URL being used
- Authentication configuration status
- Schema validation results
- Troubleshooting suggestions

### Actions Available
- **Retry Connection**: Attempts to reconnect (3 retries with exponential backoff)
- **Open Dashboard**: Direct link to your Supabase project dashboard

## Troubleshooting Connection Issues

### Issue: Red Status on Reopen

**Possible Causes:**
1. Environment variables not loaded properly
2. Supabase project paused (free tier auto-pauses after 1 week inactivity)
3. Network connectivity issues
4. Invalid credentials in `.env`

**Solutions:**
1. Click "Retry Connection" button
2. Check your Supabase dashboard to ensure project is active
3. Verify `.env` file contains correct values:
   ```
   VITE_SUPABASE_URL=https://vmhbujxtvgnnkaykpzas.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. Refresh the browser page
5. If project is paused, visit Supabase dashboard to reactivate it

### Issue: Missing Tables Error

**Cause:** Schema validation detected missing required tables

**Solutions:**
1. Verify migrations were applied to your remote database
2. Check migration status in Supabase dashboard (Database → Migrations)
3. If needed, manually apply migrations using the Supabase dashboard SQL editor
4. Review migration files in `supabase/migrations/` directory

### Issue: Authentication Not Working

**Cause:** Session expired or auth configuration issue

**Solutions:**
1. Check localStorage for `careview-auth` key
2. Try signing out and signing back in
3. Verify `persistSession: true` in supabaseClient.ts
4. Check Supabase auth settings in dashboard

## Environment Variables

### Required Variables

Your `.env` file must contain:

```env
VITE_SUPABASE_URL=https://vmhbujxtvgnnkaykpzas.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Validation

The app automatically validates:
- URL starts with `https://`
- URL contains `.supabase.co`
- Anon key starts with `eyJ` (JWT format)
- Both values are present and non-empty

### Finding Your Credentials

If you need to retrieve your credentials:
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

## Development vs Production

### Development (Bolt.new)
- Uses environment variables from `.env` file
- Direct connection to Supabase cloud database
- No local database required
- Database status indicator visible

### Production (Bolt Publishing)
- Uses environment variables from `.env` file (same as development)
- Same Supabase database as development
- One-click publishing from Bolt interface
- Environment variables automatically included in published build
- Custom domain support available (carerview.com)

## Database Connection Configuration

The Supabase client is configured in `src/lib/supabaseClient.ts` with:

```typescript
{
  auth: {
    persistSession: true,        // Keep user logged in across sessions
    autoRefreshToken: true,       // Automatically refresh auth tokens
    detectSessionInUrl: true,     // Handle OAuth redirects
    storage: window.localStorage, // Store session in localStorage
    storageKey: 'careview-auth',  // Key for session storage
    flowType: 'pkce',             // Secure authentication flow
  },
  db: {
    schema: 'public',             // Default schema for queries
  },
  global: {
    headers: {
      'X-Client-Info': 'careview-web', // Identify requests
    },
  },
}
```

## Supabase Project Status

### Free Tier Limitations
- Projects auto-pause after 1 week of inactivity
- Simply visiting dashboard reactivates the project
- All data is preserved during pause
- Reactivation takes 1-2 minutes

### Checking Project Status
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Look for "Project paused" banner
3. Click "Restore" if project is paused
4. Wait for project to become active
5. Refresh your Bolt.new app

## Key Files

### Connection Logic
- `src/lib/supabaseClient.ts` - Supabase client initialization
- `src/lib/dbConnection.ts` - Connection validation utilities
- `src/hooks/useDatabaseHealth.ts` - Health check hook

### UI Components
- `src/components/common/DatabaseStatus.tsx` - Status indicator widget

### Configuration
- `.env` - Environment variables (not committed to git)
- `supabase/config.toml` - Supabase project configuration

### Migrations
- `supabase/migrations/` - Database schema migrations (already applied)

## Quick Checklist

When reopening project in Bolt.new:

- [ ] Project loads in browser
- [ ] Database status indicator appears (bottom-right)
- [ ] Status shows "Healthy" with green dot
- [ ] No console errors related to Supabase
- [ ] Can navigate to different pages
- [ ] Authentication works (if logged in before)

If any item fails:
1. Click "Retry Connection"
2. Check Supabase dashboard for project status
3. Verify `.env` file exists and has correct values
4. Refresh browser page
5. Check browser console for specific error messages

## Getting Help

If you continue to experience connection issues:

1. Click the Database Status indicator
2. Review the error messages shown
3. Follow the troubleshooting steps in the expanded view
4. Check your Supabase project dashboard
5. Verify your project is not paused
6. Ensure migrations have been applied

## Summary

Your database connection is **persistent and automatic**. When you reopen Bolt.new:
- The frontend automatically connects to your existing Supabase database
- No migrations need to re-run (they're already applied)
- All your data is exactly as you left it
- The database status indicator confirms successful connection

You're ready to continue developing right where you left off!
