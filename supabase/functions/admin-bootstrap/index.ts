import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')!
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD')!
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400',
} as const

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const srv = createClient(SUPABASE_URL, SERVICE_ROLE)

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const { data: rateLimitCheck } = await srv.rpc('check_rate_limit', {
      p_identifier: clientIp,
      p_endpoint: 'admin-bootstrap',
      p_max_requests: 5,
      p_window_minutes: 1,
    })
    if (rateLimitCheck && !rateLimitCheck.allowed) {
      return json({ error: 'Too many attempts. Please wait before trying again.' }, 429)
    }

    const body = await req.json().catch(() => ({}))
    const submittedEmail = (body?.email as string | undefined)?.trim() ?? ''
    const submittedPassword = (body?.password as string | undefined) ?? ''

    const emailMatch = submittedEmail === ADMIN_EMAIL
    const passwordMatch = submittedPassword === ADMIN_PASSWORD

    if (!emailMatch || !passwordMatch) {
      return json({ error: 'Invalid credentials' }, 403)
    }

    const { data: existingUsers, error: listErr } = await srv.auth.admin.listUsers()
    if (listErr) throw listErr

    const existingAuthUser = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL)

    if (!existingAuthUser) {
      const { data: created, error: createErr } = await srv.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })
      if (createErr) throw createErr

      const uid = created.user!.id
      const { error: profErr } = await srv.from('profiles').upsert({
        id: uid,
        email: ADMIN_EMAIL,
        display_name: 'Admin',
        role: 'admin',
        disabled: false,
      })
      if (profErr) throw profErr

      return json({ ok: true, created: true })
    }

    const uid = existingAuthUser.id

    const { error: pwErr } = await srv.auth.admin.updateUserById(uid, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (pwErr) throw pwErr

    const { data: prof } = await srv
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .maybeSingle()

    if (prof?.role !== 'admin') {
      await srv.from('profiles').upsert({
        id: uid,
        email: ADMIN_EMAIL,
        display_name: 'Admin',
        role: 'admin',
        disabled: false,
      })
    }

    return json({ ok: true, created: false })
  } catch (err: any) {
    console.error('[admin-bootstrap] error:', err?.message || err)
    return json({ error: 'Internal server error' }, 500)
  }
})
