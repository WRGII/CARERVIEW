// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * REQUIRED (Project Settings → Functions → Secrets)
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * OPTIONAL (fallback mapping if DB lookup misses)
 * - STRIPE_PRICE_PRIMARY_WEEKLY
 * - STRIPE_PRICE_OCCASIONAL_WEEKLY
 */
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Optional env fallbacks for plan mapping
const ENV_PRICE_PRIMARY = Deno.env.get('STRIPE_PRICE_PRIMARY_WEEKLY') || ''
const ENV_PRICE_OCC = Deno.env.get('STRIPE_PRICE_OCCASIONAL_WEEKLY') || ''

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Stripe-Signature',
}

function resp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function toIso(ts?: number | null) {
  return ts ? new Date(ts * 1000).toISOString() : null
}

// --- Helpers ---------------------------------------------------------------

async function lookupUserIdFromCustomer(db: ReturnType<typeof createClient>, customerId: string) {
  const { data, error } = await db
    .from('stripe_customers') // public schema by default
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()
  if (error) throw error
  return data?.user_id as string | undefined
}

async function mapPlanId(
  db: ReturnType<typeof createClient>,
  priceId: string | null | undefined
): Promise<string | undefined> {
  if (!priceId) return undefined

  // Try DB lookup: support both price_id and stripe_price_id
  const { data, error } = await db
    .from('subscription_plans')
    .select('id, price_id, stripe_price_id')
    .or(`price_id.eq.${priceId},stripe_price_id.eq.${priceId}`)
    .maybeSingle()

  if (error) {
    // Non-fatal; we’ll try env fallbacks
    console.warn('[stripe-webhook] plan lookup error', error.message || error)
  }

  if (data?.id) return data.id as string

  // Env fallbacks
  if (priceId === ENV_PRICE_PRIMARY) return 'primary_weekly'
  if (priceId === ENV_PRICE_OCC) return 'occasional_weekly'

  return undefined
}

// --- Handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST') return resp({ error: 'Method not allowed' }, 405)

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[stripe-webhook] invalid signature', err?.message || err)
    return resp({ error: 'Invalid signature' }, 400)
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        // Prefer metadata.user_id; fall back to mapping by customer id
        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await lookupUserIdFromCustomer(db, String(sub.customer)))

        if (!userId) {
          console.warn('[stripe-webhook] no user_id for subscription', sub.id)
          return resp({ ok: true }) // acknowledge, don’t retry forever
        }

        const item = sub.items?.data?.[0]
        const priceId = item?.price?.id ?? null

        const planId = await mapPlanId(db, priceId)

        // Normalize status (store Stripe status verbatim; your app can interpret)
        const status = sub.status // 'active' | 'trialing' | 'canceled' | ...

        // Upsert into canonical public.user_subscriptions
        // Use subscription_id as conflict target (natural unique key).
        const payload: Record<string, any> = {
          user_id: userId,
          subscription_id: sub.id,
          price_id: priceId ?? null,
          status,
          current_period_start: toIso(sub.current_period_start),
          current_period_end: toIso(sub.current_period_end),
          updated_at: new Date().toISOString(),
        }
        if (planId) payload.plan_id = planId

        const { error: upErr } = await db
          .from('user_subscriptions')
          .upsert(payload, { onConflict: 'subscription_id' }) // ensure a UNIQUE index on subscription_id
        if (upErr) throw upErr

        return resp({ received: true })
      }

      case 'checkout.session.completed': {
        // Subscription state will be handled by the subscription.* events above.
        return resp({ received: true })
      }

      default:
        // Acknowledge everything else to avoid retries; add cases as needed
        return resp({ received: true })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] error:', err?.message || err)
    return resp({ error: 'Webhook handling failed' }, 500)
  }
})
