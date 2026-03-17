import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET') || 'fallback-dev-secret-change-in-prod'

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
    p_endpoint: 'admin-data',
    p_max_requests: 60,
    p_window_minutes: 1,
  })
  if (rateLimitCheck && !rateLimitCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...CORS_HEADERS, 'Retry-After': String(Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000)) },
    })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const adminPayload = await verifyAdminToken(token, ADMIN_SECRET)
  if (!adminPayload) return json({ error: 'Admins only' }, 403)

  let body: { action?: string; payload?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { action, payload = {} } = body
  if (!action) return json({ error: 'Missing action' }, 400)

  try {
    switch (action) {

      // ── Caregivers ──────────────────────────────────────────────────────────

      case 'list_caregivers': {
        const { data, error } = await srv
          .from('profiles')
          .select('id, display_name, email, role, disabled, created_at')
          .eq('role', 'caregiver')
          .order('created_at', { ascending: false })
        if (error) throw error
        return json({ ok: true, data: data ?? [] })
      }

      case 'toggle_caregiver': {
        const { id, disabled } = payload as { id: string; disabled: boolean }
        if (!id) return json({ error: 'Missing id' }, 400)
        const { error } = await srv.from('profiles').update({ disabled }).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'add_caregiver': {
        const { email, display_name } = payload as { email: string; display_name: string }
        if (!email) return json({ error: 'Missing email' }, 400)
        const tempPassword = Array.from(
          crypto.getRandomValues(new Uint8Array(18)),
          b => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*'[b % 70]
        ).join('')
        const { data: created, error: createErr } = await srv.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: false,
          user_metadata: { display_name: display_name ?? '' },
        })
        if (createErr) throw createErr
        const uid = created.user.id
        const { error: upErr } = await srv.from('profiles').upsert({
          id: uid,
          email,
          display_name: display_name ?? '',
          role: 'caregiver',
          disabled: false,
        })
        if (upErr) throw upErr
        await srv.auth.admin.generateLink({ type: 'magiclink', email })
        return json({ ok: true, id: uid })
      }

      // ── Translations ─────────────────────────────────────────────────────────

      case 'upsert_translations': {
        const { rows } = payload as { rows: { key: string; locale: string; value: string }[] }
        if (!Array.isArray(rows) || rows.length === 0) return json({ error: 'No rows provided' }, 400)
        const { error } = await srv.from('ui_translations').upsert(rows, { onConflict: 'key,locale' })
        if (error) throw error
        return json({ ok: true })
      }

      // ── Community moderation ─────────────────────────────────────────────────

      case 'resolve_report': {
        const { reportId, action: reportAction, mod_note } = payload as { reportId: string; action: string; mod_note?: string }
        if (!reportId) return json({ error: 'Missing reportId' }, 400)
        const { error } = await srv
          .from('community_reports')
          .update({
            report_status: reportAction,
            reviewed_by: null,
            reviewed_at: new Date().toISOString(),
            mod_note: mod_note?.trim() ?? null,
          })
          .eq('id', reportId)
        if (error) throw error
        return json({ ok: true })
      }

      case 'moderate_post': {
        const { postId, post_status } = payload as { postId: string; post_status: string }
        if (!postId) return json({ error: 'Missing postId' }, 400)
        const { error } = await srv.from('community_posts').update({ post_status }).eq('id', postId)
        if (error) throw error
        return json({ ok: true })
      }

      case 'moderate_reply': {
        const { replyId, reply_status } = payload as { replyId: string; reply_status: string }
        if (!replyId) return json({ error: 'Missing replyId' }, 400)
        const { error } = await srv.from('community_replies').update({ reply_status }).eq('id', replyId)
        if (error) throw error
        return json({ ok: true })
      }

      case 'ban_member': {
        const { userId: targetId, reason } = payload as { userId: string; reason?: string }
        if (!targetId) return json({ error: 'Missing userId' }, 400)
        const { error: pErr } = await srv
          .from('community_profiles')
          .update({ is_banned: true, ban_reason: reason?.trim() ?? null })
          .eq('user_id', targetId)
        if (pErr) throw pErr
        await srv.from('community_bans').insert({
          user_id: targetId,
          banned_by: null,
          reason: reason?.trim() ?? '',
        })
        return json({ ok: true })
      }

      case 'unban_member': {
        const { userId: targetId } = payload as { userId: string }
        if (!targetId) return json({ error: 'Missing userId' }, 400)
        const { error } = await srv
          .from('community_profiles')
          .update({ is_banned: false, ban_reason: null })
          .eq('user_id', targetId)
        if (error) throw error
        return json({ ok: true })
      }

      case 'send_notification': {
        const { userId: targetId, type, subject, message, post_id, reply_id } = payload as {
          userId: string; type: string; subject: string; message: string
          post_id?: string | null; reply_id?: string | null
        }
        if (!targetId || !type || !subject || !message) return json({ error: 'Missing required fields' }, 400)
        const { error } = await srv.from('community_notifications').insert({
          user_id: targetId,
          type,
          subject,
          message,
          post_id: post_id ?? null,
          reply_id: reply_id ?? null,
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'delete_post': {
        const { postId } = payload as { postId: string }
        if (!postId) return json({ error: 'Missing postId' }, 400)
        const { error } = await srv.from('community_posts').delete().eq('id', postId)
        if (error) throw error
        return json({ ok: true })
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (err: any) {
    console.error(`[admin-data] action=${action} error:`, err?.message || err)
    return json({ error: err?.message || 'Operation failed' }, 500)
  }
})
