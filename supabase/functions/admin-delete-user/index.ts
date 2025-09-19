// supabase/functions/admin-delete-user/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Requires these Function secrets (already used elsewhere in your project):
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Behavior:
 * - Authenticates the caller (must be signed in)
 * - Verifies caller is an admin via public.profiles.role = 'admin'
 * - Deletes user rows in app DB (observations cascade responses if FK is CASCADE)
 * - Deletes stripe mapping rows
 * - Deletes the auth user (auth.admin.deleteUser)
 * - Returns JSON { ok: true, deleted: true } on success
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
} as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    // End-user auth check from the bearer on the request
    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error: userErr } = await authed.auth.getUser()
    if (userErr) throw userErr
    if (!user) return json({ error: 'Not authenticated' }, 401)

    // Check admin role
    const { data: me, error: profErr } = await authed
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profErr) throw profErr
    if (me?.role !== 'admin') return json({ error: 'Admins only' }, 403)

    // Body
    const body = await req.json().catch(() => ({}))
    const email = (body?.email as string | undefined)?.trim()
    if (!email) return json({ error: 'Missing email' }, 400)

    // Service-role client (bypasses RLS for hard deletes)
    const srv = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Find the user id by email
    const { data: found, error: findErr } = await srv
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (findErr) throw findErr
    if (!found?.id) return json({ ok: true, deleted: false, reason: 'No profile for that email' })

    const uid = found.id as string

    // Delete domain data first (order chosen to minimize FK issues)
    // If responses are ON DELETE CASCADE from observations, the first line is enough.
    await srv.from('observations').delete().eq('user_id', uid)
    await srv.from('user_subscriptions').delete().eq('user_id', uid)
    await srv.from('stripe_customers').delete().eq('user_id', uid)
    await srv.from('profiles').delete().eq('id', uid)

    // Delete the auth user
    const { error: authDelErr } = await srv.auth.admin.deleteUser(uid)
    if (authDelErr) throw authDelErr

    return json({ ok: true, deleted: true })
  } catch (err: any) {
    console.error('[admin-delete-user] error:', err?.message || err)
    return json({ error: err?.message || 'Delete failed' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS })
}
