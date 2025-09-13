// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Read env vars from Vite. Fail fast if missing to avoid silent runtime errors.
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url) throw new Error('VITE_SUPABASE_URL is not set')
if (!anon) throw new Error('VITE_SUPABASE_ANON_KEY is not set')

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,      // keep user signed in across refreshes
    autoRefreshToken: true,    // refresh tokens automatically
    detectSessionInUrl: true,  // handle OAuth redirects if you add them later
  },
})

export default supabase
