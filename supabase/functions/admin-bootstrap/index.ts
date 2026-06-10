import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || ''

function getAllowedOrigin(req: Request): string {
  const incoming = req.headers.get('origin') || ''
  if (!PUBLIC_SITE_URL) return incoming || '*'
  if (incoming === PUBLIC_SITE_URL) return incoming
  const host = incoming.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const siteHost = PUBLIC_SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const bare = siteHost.replace(/^www\./, '')
  if (host === bare || host === `www.${bare}`) return incoming
  return PUBLIC_SITE_URL
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Access-Control-Max-Age': '86400',
  }
}

function json(body: unknown, status = 200, req: Request) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) })
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  if (aBytes.length !== bBytes.length) {
    // Still do a comparison to avoid length-based timing leak; result will always be false
    await crypto.subtle.timingSafeEqual(aBytes, aBytes)
    return false
  }
  return crypto.subtle.timingSafeEqual(aBytes, bBytes)
}

async function signAdminToken(email: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const now = Math.floor(Date.now() / 1000)
  const payload = btoa(JSON.stringify({ sub: email, role: 'admin', iat: now, exp: now + 8 * 60 * 60 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const signingInput = `${header}.${payload}`
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `${signingInput}.${sigB64}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req)

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')?.trim()
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')?.trim()
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD')?.trim()
    const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET')?.trim()

    if (!SUPABASE_URL || !SERVICE_ROLE || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_SECRET) {
      console.error('[admin-bootstrap] one or more required environment variables are missing')
      return json({ error: 'Server configuration error' }, 500, req)
    }

    const srv = createClient(SUPABASE_URL, SERVICE_ROLE)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const { data: rateLimitCheck } = await srv.rpc('check_rate_limit', {
      p_identifier: clientIp,
      p_endpoint: 'admin-bootstrap',
      p_max_requests: 5,
      p_window_minutes: 1,
    })
    if (rateLimitCheck && !rateLimitCheck.allowed) {
      return json({ error: 'Too many attempts. Please wait before trying again.' }, 429, req)
    }

    const body = await req.json().catch(() => ({}))
    const submittedEmail = (body?.email as string | undefined)?.trim() ?? ''
    const submittedPassword = (body?.password as string | undefined) ?? ''

    const [emailMatch, passwordMatch] = await Promise.all([
      timingSafeEqual(submittedEmail, ADMIN_EMAIL),
      timingSafeEqual(submittedPassword, ADMIN_PASSWORD),
    ])

    if (!emailMatch || !passwordMatch) {
      return json({ error: 'Invalid credentials' }, 403, req)
    }

    const token = await signAdminToken(ADMIN_EMAIL, ADMIN_SECRET)
    return json({ ok: true, token }, 200, req)
  } catch (err: any) {
    console.error('[admin-bootstrap] error:', err?.message || err)
    return json({ error: 'Internal server error' }, 500, req)
  }
})
