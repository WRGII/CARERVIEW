// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl) console.error('[CarerView] VITE_SUPABASE_URL is not set — database features will not work')
if (!supabaseAnonKey) console.error('[CarerView] VITE_SUPABASE_ANON_KEY is not set — database features will not work')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'careview-auth',
    flowType: 'implicit',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'careview-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export default supabase
