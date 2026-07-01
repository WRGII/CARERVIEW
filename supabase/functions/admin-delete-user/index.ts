import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET')
if (!ADMIN_SECRET) throw new Error('ADMIN_SECRET environment variable is required')
const ALLOWED_ORIGIN = Deno.env.get('PUBLIC_SITE_URL') || ''

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400',
} as const

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS })
}

async function verifyAdminToken(token: string, secret: string): Promise<{ sub: string; role: string } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const encoder = new TextEncoder()
    const signingInput = `${parts[0]}.${parts[1]}`
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const sigBytes = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signingInput))
    if (!valid) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    if (payload.role !== 'admin') return null
    return payload
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const srv = createClient(SUPABASE_URL, SERVICE_ROLE)

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { data: rateLimitCheck } = await srv.rpc('check_rate_limit', {
    p_identifier: clientIp,
    p_endpoint: 'admin-delete-user',
    p_max_requests: 10,
    p_window_minutes: 1,
  })
  if (rateLimitCheck && !rateLimitCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...CORS_HEADERS, 'Retry-After': String(Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000)) },
    })
  }

  let audit: { actor_email: string | null; target_email: string | null; target_user_id: string | null; success: boolean; details: Record<string, unknown> } = {
    actor_email: null, target_email: null, target_user_id: null, success: false, details: {},
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const payload = await verifyAdminToken(token, ADMIN_SECRET!)
    if (!payload) return json({ error: 'Admins only' }, 403)
    audit.actor_email = payload.sub

    const body = await req.json().catch(() => ({}))
    const email = (body?.email as string | undefined)?.trim() || null
    if (!email) return json({ error: 'Missing email' }, 400)
    audit.target_email = email

    const { data: found, error: findErr } = await srv.from('profiles').select('id').eq('email', email).maybeSingle()
    if (findErr) throw findErr

    if (!found?.id) {
      audit.details = { reason: 'No profile for that email' }
      await insertAudit(srv, audit)
      return json({ ok: true, deleted: false, reason: 'No profile for that email' })
    }

    const uid = String(found.id)
    audit.target_user_id = uid

    await srv.from('community_reports').delete().eq('reporter_user_id', uid)
    await srv.from('community_reactions').delete().eq('user_id', uid)
    await srv.from('community_replies').delete().eq('author_user_id', uid)
    await srv.from('community_posts').delete().eq('author_user_id', uid)
    await srv.from('community_profiles').delete().eq('user_id', uid)
    await srv.from('cv_team_invites').delete().eq('created_by', uid)
    await srv.from('cv_team_members').delete().eq('user_id', uid)
    await srv.from('observations').delete().eq('user_id', uid)
    await srv.from('user_subscriptions').delete().eq('user_id', uid)
    await srv.from('stripe_customers').delete().eq('user_id', uid)
    await srv.from('profiles').delete().eq('id', uid)

    const { error: authDelErr } = await srv.auth.admin.deleteUser(uid)
    if (authDelErr) {
      audit.details = { step: 'auth.deleteUser', error: authDelErr.message }
      await insertAudit(srv, audit)
      throw authDelErr
    }

    audit.details = { step: 'complete' }
    audit.success = true
    await insertAudit(srv, audit)
    return json({ ok: true, deleted: true })
  } catch (err: any) {
    console.error('[admin-delete-user] error:', err?.message || err)
    try { await insertAudit(srv, { ...audit, details: { ...(audit.details ?? {}), error: err?.message || String(err) }, success: false }) } catch { }
    return json({ error: err?.message || 'Delete failed' }, 500)
  }
})

async function insertAudit(srv: ReturnType<typeof createClient>, a: { actor_email: string | null; target_email: string | null; target_user_id: string | null; success: boolean; details: Record<string, unknown> }) {
  await srv.from('admin_events').insert({ actor_id: null, actor_email: a.actor_email, action: 'admin_delete_user', target_email: a.target_email, target_user_id: a.target_user_id, success: a.success, details: a.details ?? {} })
}
