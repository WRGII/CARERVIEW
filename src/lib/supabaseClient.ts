// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Read env vars from Vite. Fail fast if missing to avoid silent runtime errors.
const url  = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url)  throw new Error('VITE_SUPABASE_URL is not set')
if (!anon) throw new Error('VITE_SUPABASE_ANON_KEY is not set')

// Default client -> targets app.* tables
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,      // keep user signed in across refreshes
    autoRefreshToken: true,    // refresh tokens automatically
    detectSessionInUrl: true,  // handle OAuth redirects if you add them later
  },
  db: { schema: 'app' },       // 👈 all .from(...) now hits app.*
})

export default supabase

// Optional: use this when you intentionally need public.* (e.g., mirrored Stripe tables)
export const supabasePublic = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: { schema: 'public' },
})
