// functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Secrets (Project Settings → Functions → Secrets):
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET          (or)
 * - STRIPE_WEBHOOK_SECRETS         (JSON array or CSV)
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

function parseSecrets(): string[] {
  const multi = Deno.env.get('STRIPE_WEBHOOK_SECRETS')?.trim()
  const single = Deno.env.get('STRIPE_WEBHOOK_SECRET')?.trim()
  if (multi) {
    try {
      const asJson = JSON.parse(multi)
      if (Array.isArray(asJson)) return asJson.filter(Boolean).map((s: string) => s.trim())
    } catch {
      return multi.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return single ? [single] : []
}

const WEBHOOK_SECRETS = parseSecrets()
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature',
}

const resp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

// Track processed events to prevent duplicate processing
const processedEvents = new Map<string, number>()

// ---------- helpers ----------
const secToIso = (sec?: number | null) =>
  typeof sec === 'number' && isFinite(sec) ? new Date(sec * 1000).toISOString() : null

const addDaysIso = (isoStart: string, days: number) => {
  const d = new Date(isoStart)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

async function lookupUserIdFromCustomer(db: ReturnType<typeof createClient>, customerId: string) {
  const { data, error } = await db
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()
  if (error) throw error
  return data?.user_id as string | undefined
}

async function planIdFromPrice(db: ReturnType<typeof createClient>, priceId: string) {
  const { data, error } = await db
    .from('subscription_plans') // public table with app plan ids in `id`
    .select('id')
    .eq('stripe_price_id', priceId)
    .maybeSingle()
  if (error) throw error
  return data?.id as string | undefined // e.g., 'family_qtr' | 'primary_qtr' | 'free'
}

// Enforce seats on all teams owned by user. Do not fail the webhook if this fails.
async function enforceSeats(db: ReturnType<typeof createClient>, ownerUserId: string, planId: string) {
  try {
    const { error } = await db.rpc('cv_apply_plan_to_owner_teams', {
      p_owner: ownerUserId,
      p_plan_id: planId, // 'family_qtr' | 'primary_qtr' | 'free'
    })
    if (error) throw error
  } catch (e) {
    console.warn('[stripe-webhook] enforceSeats failed', e)
  }
}

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST')    return resp({ error: 'Method not allowed' }, 405)

  // Rate limiting check (100 requests per minute for webhooks)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'stripe'
  const dbForRateLimit = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: rateLimitCheck } = await dbForRateLimit.rpc('check_rate_limit', {
    p_identifier: clientIp,
    p_endpoint: 'stripe-webhook',
    p_max_requests: 100,
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
          ...JSON_HEADERS,
          'Retry-After': String(Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000))
        }
      }
    )
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? req.headers.get('Stripe-Signature') ?? ''

  if (!sig) return resp({ error: 'Missing Stripe-Signature header' }, 400)
  if (WEBHOOK_SECRETS.length === 0) return resp({ error: 'Webhook secret not configured' }, 500)

  let event: Stripe.Event | undefined
  let lastErr: unknown
  for (let i = 0; i < WEBHOOK_SECRETS.length; i++) {
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, WEBHOOK_SECRETS[i])
      break
    } catch (e) {
      lastErr = e
    }
  }
  if (!event) {
    const errorMsg = lastErr instanceof Error ? lastErr.message : String(lastErr)
    console.warn(`[stripe-webhook] Invalid signature: ${errorMsg}`)
    return resp({ error: 'Invalid signature' }, 400)
  }

  // Reuse db instance from rate limiting
  const db = dbForRateLimit

  // Idempotency check: skip if we've recently processed this event
  const now = Date.now()
  const lastProcessed = processedEvents.get(event.id)
  if (lastProcessed && (now - lastProcessed) < 60000) {
    console.log(`[stripe-webhook] Skipping duplicate event ${event.id}`)
    return resp({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string | null
        const userId = (session.metadata?.user_id as string | undefined) || undefined

        if (customerId && userId) {
          const { error } = await db.from('stripe_customers').upsert(
            { user_id: userId, customer_id: customerId, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
          if (error) {
            console.warn(`[stripe-webhook] upsert stripe_customers failed: ${error.message}`, {
              userId,
              customerId,
              errorCode: error.code
            })
          }
        }

        // Mark event as completed
        await db.rpc('record_webhook_event', {
          p_event_id: event.id,
          p_event_type: event.type,
          p_status: 'completed'
        })

        return resp({ received: true })
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await lookupUserIdFromCustomer(db, sub.customer as string))

        if (!userId) return resp({ ok: true })

        // retrieve full subscription for accurate period fields
        let full: Stripe.Subscription | undefined
        try {
          full = await stripe.subscriptions.retrieve(sub.id, { expand: ['items.data'] })
        } catch {
          /* ignore; use webhook payload */
        }

        const src: any = full ?? (sub as any)
        const item: any = src?.items?.data?.[0]
        const priceId: string | null = item?.price?.id ?? null

        let pStartIso =
          secToIso(src?.current_period_start) ??
          secToIso(item?.current_period_start) ?? null

        let pEndIso =
          secToIso(src?.current_period_end) ??
          secToIso(item?.current_period_end) ?? null

        if (!pStartIso) pStartIso = secToIso(src?.billing_cycle_anchor) ?? null
        if (!pEndIso && pStartIso) {
          const interval = item?.price?.recurring?.interval || src?.plan?.interval
          if (interval === 'week') pEndIso = addDaysIso(pStartIso, 7)
          else if (interval === 'month') pEndIso = addDaysIso(pStartIso, 30)
        }

        // Resolve app plan id
        let mappedPlanId: string | undefined = sub.metadata?.plan_id as string | undefined
        if (!mappedPlanId && priceId) {
          try { mappedPlanId = await planIdFromPrice(db, priceId) } catch {/* noop */}
        }

        // Upsert subscription row
        const row: Record<string, any> = {
          user_id: userId,
          subscription_id: sub.id,
          price_id: priceId ?? undefined,
          plan_id: mappedPlanId ?? undefined,
          status: sub.status,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }
        if (pStartIso) row.current_period_start = pStartIso
        if (pEndIso)   row.current_period_end   = pEndIso

        const { error: upErr } = await db.from('user_subscriptions').upsert(
          row,
          { onConflict: 'user_id,subscription_id' },
        )
        if (upErr) throw upErr

        // Determine effective app plan ID to apply to teams
        // Deleted → force 'free'. Otherwise mapped plan or default to 'free'.
        const effectivePlanId =
          event.type === 'customer.subscription.deleted' ? 'free' :
          (mappedPlanId ?? 'free')

        await enforceSeats(db, userId, effectivePlanId)

        // Mark event as completed
        await db.rpc('record_webhook_event', {
          p_event_id: event.id,
          p_event_type: event.type,
          p_status: 'completed'
        })

        return resp({ received: true })
      }

      default:
        // Mark non-critical events as completed
        await db.rpc('record_webhook_event', {
          p_event_id: event.id,
          p_event_type: event.type,
          p_status: 'completed'
        })
        return resp({ received: true })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] handler error:', err?.message || err)
    // Don't mark as processed on error - allow retry
    return resp({ error: 'Webhook handling failed' }, 500)
  }
})
