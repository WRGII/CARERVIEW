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

// Fire-and-forget helper: calls notify-payment without blocking the webhook response.
function fireNotifyPayment(payload: Record<string, unknown>): void {
  const url = `${SUPABASE_URL}/functions/v1/notify-payment`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(payload),
  }).catch((e) => console.warn('[stripe-webhook] notify-payment fire-and-forget failed:', e?.message))
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return ''
  const dollars = (amount / 100).toFixed(2)
  return `${currency.toUpperCase() === 'USD' ? '$' : currency.toUpperCase() + ' '}${dollars}`
}

function isoDate(ts: number | null | undefined): string {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
}

const resp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

async function isEventAlreadyProcessed(db: ReturnType<typeof createClient>, eventId: string): Promise<boolean> {
  const { data } = await db
    .from('webhook_events')
    .select('event_id, status')
    .eq('event_id', eventId)
    .maybeSingle()
  return !!data && data.status === 'completed'
}

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

async function ensureProfileExists(db: ReturnType<typeof createClient>, userId: string, email?: string) {
  const { data } = await db.from('profiles').select('id').eq('id', userId).maybeSingle()
  if (data) return
  const { error } = await db.from('profiles').upsert(
    { id: userId, email: email ?? null, display_name: '', role: 'caregiver', disabled: false },
    { onConflict: 'id' }
  )
  if (error) console.warn('[stripe-webhook] profile auto-create failed (non-fatal):', error.message)
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

  // Idempotency check: skip if already processed (DB-backed, survives cold starts)
  if (await isEventAlreadyProcessed(db, event.id)) {
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
          // Ensure profile row exists before writing anything that FKs to it
          await ensureProfileExists(db, userId)

          const { error: scErr } = await db.from('stripe_customers').upsert(
            { user_id: userId, customer_id: customerId, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
          if (scErr) {
            console.warn(`[stripe-webhook] upsert stripe_customers failed: ${scErr.message}`, {
              userId, customerId, errorCode: scErr.code
            })
          }

          // Eagerly write subscription row so CheckoutSuccess polling resolves without
          // waiting for a separate customer.subscription.created event delivery.
          const subscriptionId = session.subscription as string | null
          const planId = (session.metadata?.plan_id as string | undefined) || undefined

          if (subscriptionId && planId) {
            try {
              const stripeSub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data'] })
              const item: any = stripeSub?.items?.data?.[0]
              const priceId: string | null = item?.price?.id ?? null
              const pStartIso = secToIso(stripeSub.current_period_start)
              const pEndIso = secToIso(stripeSub.current_period_end)
              const trialEndIso = secToIso(stripeSub.trial_end)
              const eventCreatedIso = new Date(event.created * 1000).toISOString()

              const row: Record<string, any> = {
                user_id: userId,
                subscription_id: subscriptionId,
                price_id: priceId ?? undefined,
                plan_id: planId,
                status: stripeSub.status,
                cancel_at_period_end: !!stripeSub.cancel_at_period_end,
                updated_at: eventCreatedIso,
              }
              if (pStartIso) row.current_period_start = pStartIso
              if (pEndIso)   row.current_period_end   = pEndIso
              if (trialEndIso !== null) row.trial_end = trialEndIso

              const { error: subErr } = await db.from('user_subscriptions').upsert(
                row, { onConflict: 'user_id,subscription_id' }
              )
              if (subErr) {
                console.warn(`[stripe-webhook] eager subscription upsert failed: ${subErr.message}`)
              } else {
                await enforceSeats(db, userId, planId)
              }
            } catch (eagerErr: any) {
              console.warn('[stripe-webhook] eager subscription write failed (non-fatal):', eagerErr?.message)
            }
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

        // trial_end: store when the trial period expires
        const trialEndIso = secToIso(src?.trial_end) ?? null

        // Resolve app plan id — never silently fall back to free; throw instead so Stripe retries
        let mappedPlanId: string | undefined = sub.metadata?.plan_id as string | undefined
        if (!mappedPlanId && priceId) {
          mappedPlanId = await planIdFromPrice(db, priceId) // throws on DB error → 500 → Stripe retries
        }

        // Out-of-order guard: only apply this event if it is newer than what we already have
        const { data: existing } = await db
          .from('user_subscriptions')
          .select('updated_at')
          .eq('user_id', userId)
          .eq('subscription_id', sub.id)
          .maybeSingle()

        const eventCreatedIso = new Date(event.created * 1000).toISOString()
        if (existing?.updated_at && existing.updated_at > eventCreatedIso) {
          console.log(`[stripe-webhook] Skipping out-of-order event ${event.id} for sub ${sub.id}`)
          await db.rpc('record_webhook_event', {
            p_event_id: event.id,
            p_event_type: event.type,
            p_status: 'completed'
          })
          return resp({ received: true, skipped: 'out_of_order' })
        }

        // Ensure profile row exists before writing user_subscriptions (FK constraint)
        await ensureProfileExists(db, userId)

        // Upsert subscription row
        const row: Record<string, any> = {
          user_id: userId,
          subscription_id: sub.id,
          price_id: priceId ?? undefined,
          plan_id: mappedPlanId ?? undefined,
          status: sub.status,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          updated_at: eventCreatedIso,
        }
        if (pStartIso)  row.current_period_start = pStartIso
        if (pEndIso)    row.current_period_end   = pEndIso
        if (trialEndIso !== null) row.trial_end  = trialEndIso

        const { error: upErr } = await db.from('user_subscriptions').upsert(
          row,
          { onConflict: 'user_id,subscription_id' },
        )
        if (upErr) throw upErr

        // Determine effective app plan ID to apply to teams
        // Deleted → force 'free'. Otherwise mapped plan (required — already threw if missing).
        const effectivePlanId =
          event.type === 'customer.subscription.deleted' ? 'free' :
          (mappedPlanId ?? 'free')

        await enforceSeats(db, userId, effectivePlanId)

        // Send email notification based on what changed.
        if (mappedPlanId) {
          const planName = mappedPlanId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          if (event.type === 'customer.subscription.created' && sub.status === 'active' && !src?.trial_end) {
            fireNotifyPayment({ type: 'subscription_confirmed', userId, planName, periodEnd: pEndIso ? isoDate(src?.current_period_end) : '' })
          } else if (event.type === 'customer.subscription.deleted') {
            fireNotifyPayment({ type: 'subscription_cancelled', userId, planName, accessUntil: pEndIso ? isoDate(src?.current_period_end) : '' })
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

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string | null
        if (!customerId) {
          await db.rpc('record_webhook_event', { p_event_id: event.id, p_event_type: event.type, p_status: 'completed' })
          return resp({ received: true })
        }
        const userId = await lookupUserIdFromCustomer(db, customerId)
        if (userId) {
          const sub = invoice.subscription ? await stripe.subscriptions.retrieve(invoice.subscription as string, { expand: ['items.data'] }).catch(() => null) : null
          const item: any = sub?.items?.data?.[0]
          const priceId: string | null = item?.price?.id ?? null
          const mappedPlanId = priceId ? await planIdFromPrice(db, priceId).catch(() => undefined) : undefined
          const planName = mappedPlanId ? mappedPlanId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'CarerView'
          const amountFormatted = formatAmount(invoice.amount_paid, invoice.currency)
          const invoiceDate = isoDate(invoice.created)
          const invoiceUrl = invoice.hosted_invoice_url ?? undefined
          // Skip receipt on the very first invoice that triggered subscription_confirmed
          if ((invoice as any).billing_reason !== 'subscription_create') {
            fireNotifyPayment({ type: 'payment_receipt', userId, planName, amountFormatted, invoiceDate, invoiceUrl })
          }
        }
        await db.rpc('record_webhook_event', { p_event_id: event.id, p_event_type: event.type, p_status: 'completed' })
        return resp({ received: true })
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string | null
        if (!customerId) {
          await db.rpc('record_webhook_event', { p_event_id: event.id, p_event_type: event.type, p_status: 'completed' })
          return resp({ received: true })
        }
        const userId = await lookupUserIdFromCustomer(db, customerId)
        if (userId) {
          const sub = invoice.subscription ? await stripe.subscriptions.retrieve(invoice.subscription as string, { expand: ['items.data'] }).catch(() => null) : null
          const item: any = sub?.items?.data?.[0]
          const priceId: string | null = item?.price?.id ?? null
          const mappedPlanId = priceId ? await planIdFromPrice(db, priceId).catch(() => undefined) : undefined
          const planName = mappedPlanId ? mappedPlanId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'CarerView'
          const amountFormatted = formatAmount(invoice.amount_due, invoice.currency)
          const nextAttemptDate = invoice.next_payment_attempt ? isoDate(invoice.next_payment_attempt) : undefined
          fireNotifyPayment({ type: 'payment_failed', userId, planName, amountFormatted, nextAttemptDate })
        }
        await db.rpc('record_webhook_event', { p_event_id: event.id, p_event_type: event.type, p_status: 'completed' })
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
