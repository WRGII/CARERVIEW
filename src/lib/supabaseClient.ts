// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Central Supabase client.
 * - Sets the DEFAULT DB SCHEMA to "app" so `.from("...")` queries hit `app.<table>` by default.
 * - Keeps sessions persisted and tokens auto-refreshed.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL is not set");
if (!supabaseAnonKey) throw new Error("VITE_SUPABASE_ANON_KEY is not set");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // 👇 Important: default all REST/RPC calls to the `app` schema
  db: { schema: "app" },

  auth: {
    persistSession: true,     // keep user signed in across refreshes
    autoRefreshToken: true,   // refresh tokens automatically
    detectSessionInUrl: true, // handle OAuth redirects if added later
  },

  // Optional: light telemetry header for easier debugging in logs
  global: {
    headers: { "X-Client-Info": "carerview-web/0.0.1" },
  },
});

export default supabase;
