// supabase/functions/admin-delete-user/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Requires Function secrets:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Behavior:
 * - Authenticates the caller (must be signed in)
 * - Verifies caller is an admin via public.profiles.role = 'admin'
 * - Deletes app rows (observations → responses via FK CASCADE, user_subscriptions, stripe_customers, profiles)
 * - Deletes the auth user (auth.admin.deleteUser)
 * - Inserts an audit row in public.admin_events
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

  // we’ll record one audit row per invocation
  let audit: {
    actor_id: string | null
    actor_email: string | null
    target_email: string | null
    target_user_id: string | null
    success: boolean
    details: Record<string, unknown>
  } = {
    actor_id: null,
    actor_email: null,
    target_email: null,
    target_user_id: null,
    success: false,
    details: {},
  }

  try {
    const body = await req.json().catch(() => ({}))
    const email = (body?.email as string | undefined)?.trim() || null
    if (!email) return json({ error: 'Missing email' }, 400)
    audit.target_email = email

    // End-user auth check from the bearer on the request
    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error: userErr } = await authed.auth.getUser()
    if (userErr) throw userErr
    if (!user) return json({ error: 'Not authenticated' }, 401)

    audit.actor_id = user.id
    audit.actor_email = user.email ?? null

    // Check admin role
    const { data: me, error: profErr } = await authed
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profErr) throw profErr
    if (me?.role !== 'admin') return json({ error: 'Admins only' }, 403)

    // Service-role client (bypasses RLS for hard deletes + audit insert)
    const srv = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Find the user id by email
    const { data: found, error: findErr } = await srv
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (findErr) throw findErr

    if (!found?.id) {
      audit.details = { reason: 'No profile for that email' }
      audit.success = false
      await insertAudit(srv, audit)
      return json({ ok: true, deleted: false, reason: 'No profile for that email' })
    }

    const uid = String(found.id)
    audit.target_user_id = uid

    // Delete domain data first
    await srv.from('observations').delete().eq('user_id', uid)
    await srv.from('user_subscriptions').delete().eq('user_id', uid)
    await srv.from('stripe_customers').delete().eq('user_id', uid)
    await srv.from('profiles').delete().eq('id', uid)

    // Delete the auth user
    const { error: authDelErr } = await srv.auth.admin.deleteUser(uid)
    if (authDelErr) {
      audit.details = { step: 'auth.deleteUser', error: authDelErr.message }
      audit.success = false
      await insertAudit(srv, audit)
      throw authDelErr
    }

    audit.details = { step: 'complete' }
    audit.success = true
    await insertAudit(srv, audit)

    return json({ ok: true, deleted: true })
  } catch (err: any) {
    console.error('[admin-delete-user] error:', err?.message || err)
    // best-effort audit write on error (service-role client)
    try {
      const srv = createClient(SUPABASE_URL, SERVICE_ROLE)
      await insertAudit(srv, {
        ...audit,
        details: { ...(audit.details ?? {}), error: err?.message || String(err) },
        success: false,
      })
    } catch {
      // ignore audit failure
    }
    return json({ error: err?.message || 'Delete failed' }, 500)
  }
})

async function insertAudit(
  srv: ReturnType<typeof createClient>,
  a: {
    actor_id: string | null
    actor_email: string | null
    target_email: string | null
    target_user_id: string | null
    success: boolean
    details: Record<string, unknown>
  }
) {
  const row = {
    actor_id: a.actor_id,
    actor_email: a.actor_email,
    action: 'admin_delete_user',
    target_email: a.target_email,
    target_user_id: a.target_user_id,
    success: a.success,
    details: a.details ?? {},
  }
  await srv.from('admin_events').insert(row)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS })
}
