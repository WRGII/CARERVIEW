// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL!
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: { schema: 'public' }, // ✅ default to public
})

export default supabase
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url)  throw new Error('VITE_SUPABASE_URL is not set')
if (!anon) throw new Error('VITE_SUPABASE_ANON_KEY is not set')

export const supabase = createClient(url, anon, {
  // ✅ Default all calls to the *public* schema
  // (omit this block entirely if you prefer; public is the SDK default)
  db: { schema: 'public' },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
