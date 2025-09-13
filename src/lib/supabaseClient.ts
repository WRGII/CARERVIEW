// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is not set')
if (!supabaseAnonKey) throw new Error('VITE_SUPABASE_ANON_KEY is not set')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // We default to the public schema. Use supabase.schema('app') explicitly
  // wherever you need to hit the app.* tables (e.g. subscription_plans).
  db: { schema: 'public' },
})

export default supabase
