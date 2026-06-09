// supabase/functions/caregiver-delete-account/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'
import Stripe from 'npm:stripe@17.7.0'
import { sendEmail } from '../_shared/emailService.ts'
import { buildAccountDeletionEmail } from '../_shared/emailTemplates.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || ''

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

function getAllowedOrigin(req: Request): string {
  const incoming = req.headers.get('origin') || ''
  if (incoming === PUBLIC_SITE_URL) return incoming
  const host = incoming.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const siteHost = PUBLIC_SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const bare = siteHost.replace(/^www\./, '')
  if (host === bare || host === `www.${bare}`) return incoming
  return PUBLIC_SITE_URL || '*'
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Access-Control-Max-Age': '86400',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req)

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const srvForRateLimit = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { data: rateLimitCheck } = await srvForRateLimit.rpc('check_rate_limit', {
    p_identifier: clientIp,
    p_endpoint: 'caregiver-delete-account',
    p_max_requests: 5,
    p_window_minutes: 1
  })

  if (rateLimitCheck && !rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retry_after: Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders(req),
          'Retry-After': String(Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimitCheck.limit),
          'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
          'X-RateLimit-Reset': rateLimitCheck.reset_at
        }
      }
    )
  }

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
    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { data: { user }, error: userErr } = await authed.auth.getUser()
    if (userErr) throw userErr
    if (!user) return json({ error: 'Not authenticated' }, 401, req)

    const userId = user.id
    const userEmail = user.email ?? null

    audit.actor_id = userId
    audit.actor_email = userEmail
    audit.target_user_id = userId
    audit.target_email = userEmail

    const srv = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Capture display name before deletion for the confirmation email
    const { data: profile } = await srv
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle()
    const displayName = profile?.display_name || ''

    // 1. Check if user is a team owner with active members
    const { data: ownedTeams, error: teamsErr } = await srv
      .from('cv_team')
      .select(`id, name, cv_team_members!inner(user_id, state)`)
      .eq('owner_user_id', userId)

    if (teamsErr) throw teamsErr

    if (ownedTeams && ownedTeams.length > 0) {
      for (const team of ownedTeams) {
        const activeMembers = (team.cv_team_members as any[]).filter(
          (m: any) => m.state === 'active' && m.user_id !== userId
        )
        if (activeMembers.length > 0) {
          audit.details = {
            reason: 'Team owner with active members',
            team_id: team.id,
            team_name: team.name,
            active_member_count: activeMembers.length
          }
          audit.success = false
          await insertAudit(srv, audit)
          return json({
            error: 'TEAM_OWNER_HAS_MEMBERS',
            message: 'You must remove all team members before deleting your account',
            teamName: team.name,
            activeMemberCount: activeMembers.length
          }, 403, req)
        }
      }
    }

    // 2. Cancel active Stripe subscriptions
    const { data: stripeCustomer } = await srv
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    let stripeCancellationResult = { success: false, subscriptionsCancelled: 0, error: null as string | null }

    if (stripeCustomer?.customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomer.customer_id,
          status: 'active',
        })
        for (const subscription of subscriptions.data) {
          try {
            await stripe.subscriptions.cancel(subscription.id, { invoice_now: false, prorate: false })
            stripeCancellationResult.subscriptionsCancelled++
          } catch (subErr: any) {
            console.error(`Failed to cancel subscription ${subscription.id}:`, subErr?.message)
            stripeCancellationResult.error = subErr?.message || 'Subscription cancellation failed'
          }
        }
        stripeCancellationResult.success = true
      } catch (stripeErr: any) {
        console.error('Stripe cancellation error:', stripeErr?.message)
        stripeCancellationResult.error = stripeErr?.message || 'Stripe API error'
      }
    }

    audit.details.stripe_cancellation = stripeCancellationResult

    // 3. Delete user data in proper order
    await srv.from('cv_team_invites').delete().eq('created_by', userId)
    await srv.from('cv_team_members').delete().eq('user_id', userId)

    if (ownedTeams && ownedTeams.length > 0) {
      for (const team of ownedTeams) {
        await srv.from('cv_team').delete().eq('id', team.id)
      }
    }

    const { count: obsCount } = await srv
      .from('observations')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true })

    audit.details.observations_deleted = obsCount ?? 0

    await srv.from('user_subscriptions').delete().eq('user_id', userId)
    await srv.from('stripe_subscriptions').delete().eq('customer_id', stripeCustomer?.customer_id || '')
    await srv.from('stripe_customers').delete().eq('user_id', userId)
    await srv.from('profiles').delete().eq('id', userId)

    // 4. Delete auth user
    const { error: authDelErr } = await srv.auth.admin.deleteUser(userId)
    if (authDelErr) {
      audit.details = { ...audit.details, step: 'auth.deleteUser', error: authDelErr.message }
      audit.success = false
      await insertAudit(srv, audit)
      throw authDelErr
    }

    audit.details = { ...audit.details, step: 'complete' }
    audit.success = true
    await insertAudit(srv, audit)

    // 5. Send deletion confirmation email (fire-and-forget — never fail the response)
    if (userEmail) {
      try {
        const html = buildAccountDeletionEmail({ displayName })
        await sendEmail({
          to: userEmail,
          subject: 'Your CarerView account has been deleted',
          html,
          edgeFunction: 'caregiver-delete-account',
          templateName: 'account_deletion',
        })
      } catch (emailErr: any) {
        console.error('Deletion confirmation email failed (non-fatal):', emailErr?.message)
      }
    }

    return json({ ok: true, deleted: true, email: userEmail }, 200, req)
  } catch (err: any) {
    console.error('[caregiver-delete-account] error:', err?.message || err)
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
    return json({ error: err?.message || 'Account deletion failed' }, 500, req)
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
  await srv.from('admin_events').insert({
    actor_id: a.actor_id,
    actor_email: a.actor_email,
    action: 'caregiver_delete_account',
    target_email: a.target_email,
    target_user_id: a.target_user_id,
    success: a.success,
    details: a.details ?? {},
  })
}

function json(body: unknown, status = 200, req: Request) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) })
}
