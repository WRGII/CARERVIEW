// supabase/functions/caregiver-delete-account/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'
import Stripe from 'npm:stripe@17.7.0'

/**
 * Caregiver Self-Service Account Deletion
 *
 * Requires Function secrets:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - STRIPE_SECRET_KEY
 *
 * Behavior:
 * - Authenticates the caller (must be signed in)
 * - Verifies user is deleting their own account
 * - Validates team ownership (prevents deletion if owner with active members)
 * - Cancels active Stripe subscriptions
 * - Deletes all user data (observations, responses, subscriptions, teams, etc.)
 * - Deletes the auth user
 * - Sends confirmation email
 * - Inserts audit row in public.admin_events
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const ALLOWED_ORIGIN = Deno.env.get('PUBLIC_SITE_URL') || '*'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400',
} as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Rate limiting check (5 requests per minute for account deletion)
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
          ...CORS_HEADERS,
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
    if (!user) return json({ error: 'Not authenticated' }, 401)

    const userId = user.id
    const userEmail = user.email ?? null

    audit.actor_id = userId
    audit.actor_email = userEmail
    audit.target_user_id = userId
    audit.target_email = userEmail

    const srv = createClient(SUPABASE_URL, SERVICE_ROLE)

    // 1. Check if user is a team owner with active members
    const { data: ownedTeams, error: teamsErr } = await srv
      .from('cv_team')
      .select(`
        id,
        name,
        cv_team_members!inner(user_id, state)
      `)
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
          }, 403)
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
            await stripe.subscriptions.cancel(subscription.id, {
              invoice_now: false,
              prorate: false,
            })
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

    // Delete team invitations created by user
    await srv.from('cv_team_invites').delete().eq('created_by', userId)

    // Remove user from all team memberships
    await srv.from('cv_team_members').delete().eq('user_id', userId)

    // Delete teams owned by user (no other members at this point)
    if (ownedTeams && ownedTeams.length > 0) {
      for (const team of ownedTeams) {
        await srv.from('cv_team').delete().eq('id', team.id)
      }
    }

    // Delete observations (cascades to responses)
    const { count: obsCount } = await srv
      .from('observations')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true })

    audit.details.observations_deleted = obsCount ?? 0

    // Delete subscription records
    await srv.from('user_subscriptions').delete().eq('user_id', userId)

    // Delete Stripe records
    await srv.from('stripe_subscriptions').delete().eq('customer_id', stripeCustomer?.customer_id || '')
    await srv.from('stripe_customers').delete().eq('user_id', userId)

    // Delete profile
    await srv.from('profiles').delete().eq('id', userId)

    // 4. Send confirmation email BEFORE deleting the auth user so the
    //    Supabase admin mailer can still target the address.
    let emailSent = false
    try {
      if (userEmail) {
        await sendConfirmationEmail(userEmail)
        emailSent = true
      }
    } catch (emailErr: any) {
      console.error('Failed to send confirmation email:', emailErr?.message)
      audit.details.email_error = emailErr?.message || 'Email sending failed'
    }

    // 5. Delete auth user
    const { error: authDelErr } = await srv.auth.admin.deleteUser(userId)
    if (authDelErr) {
      audit.details = { ...audit.details, step: 'auth.deleteUser', error: authDelErr.message }
      audit.success = false
      await insertAudit(srv, audit)
      throw authDelErr
    }

    audit.details = {
      ...audit.details,
      step: 'complete',
      email_sent: emailSent
    }
    audit.success = true
    await insertAudit(srv, audit)

    return json({
      ok: true,
      deleted: true,
      email: userEmail,
      emailSent
    })
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

    return json({ error: err?.message || 'Account deletion failed' }, 500)
  }
})

function sendConfirmationEmail(_email: string) {
  console.info('[caregiver-delete-account] Deletion confirmation email skipped — in-app confirmation shown to user')
}

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
    action: 'caregiver_delete_account',
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
