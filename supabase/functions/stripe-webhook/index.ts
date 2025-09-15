// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * ENV required in Supabase (Project Settings → Functions → Secrets)
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const db = createClient(SUPABASE_URL, SERVICE_ROLE)

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Stripe-Signature, Content-Type',
} as const

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: JSON_HEADERS })
    }
    if (req.method !== 'POST') {
      return j({ error: 'Method not allowed' }, 405)
    }

    // 1) Verify Stripe signature (raw body)
    const signature = req.headers.get('stripe-signature')
    if (!signature) return j({ error: 'Missing Stripe-Signature header' }, 400)

    const raw = await req.text()
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(raw, signature, WEBHOOK_SECRET)
    } catch (e: any) {
      console.error('[webhook] signature failed:', e?.message)
      return j({ error: 'Bad signature' }, 400)
    }

    // 2) Handle only the events we care about
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = extractCustomerId(session)
        if (customerId) await syncCustomerFromStripe(customerId)
        break
      }

      // Keep local DB updated whenever Stripe changes sub state
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const obj = event.data.object as any
        const customerId = extractCustomerId(obj)
        if (customerId) await syncCustomerFromStripe(customerId)
        break
      }

      default:
        // ignore others quietly
        break
    }

    return j({ received: true })
  } catch (e: any) {
    console.error('[webhook] error:', e?.message || e)
    return j({ error: e?.message || 'Webhook error' }, 500)
  }
})

function j(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function extractCustomerId(obj: any): string | null {
  if (!obj) return null
  if (typeof obj.customer === 'string') return obj.customer
  if (obj.customer?.id) return obj.customer.id
  if (obj.customer_details?.customer) return obj.customer_details.customer
  return null
}

/**
 * Pull the latest subscription for a Stripe customer and sync:
 * - public.stripe_subscriptions  (minimal mirror)
 * - app.user_subscriptions       (local plan gate)
 */
async function syncCustomerFromStripe(customerId: string) {
  try {
    // 1) Fetch most-recent sub (if any)
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
      expand: ['data.items.data.price'],
    })

    const hasSub = subs.data.length > 0
    const sub = hasSub ? subs.data[0] : null
    const stripePriceId = hasSub ? sub!.items.data[0]?.price?.id ?? null : null

    // 2) Mirror to public.stripe_subscriptions (minimal schema)
    //    Table columns assumed: customer_id, subscription_id, price_id
    {
      const payload = {
        customer_id: customerId,
        subscription_id: sub?.id ?? null,
        price_id: stripePriceId,
      }
      const { error } = await db.from('stripe_subscriptions').upsert(payload, { onConflict: 'customer_id' })
      if (error) console.error('[webhook] stripe_subscriptions upsert failed:', error)
    }

    // 3) Resolve user_id via public.stripe_customers
    const { data: mapRow, error: mapErr } = await db
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle()
    if (mapErr) {
      console.error('[webhook] stripe_customers lookup failed:', mapErr)
      return
    }
    const userId = mapRow?.user_id
    if (!userId) return

    // 4) Map Stripe price → local plan_id (public.subscription_plans.price_id)
    let planId: string | null = null
    if (stripePriceId) {
      const { data: planRow, error: planErr } = await db
        .from('subscription_plans') // public schema
        .select('id')
        .eq('price_id', stripePriceId)
        .maybeSingle()
      if (planErr) console.error('[webhook] subscription_plans lookup failed:', planErr)
      planId = planRow?.id ?? null
    }

    // 5) Normalize status + period and write to app.user_subscriptions
    const localStatus =
      !sub
        ? 'canceled'
        : sub.status === 'active' || sub.status === 'trialing'
        ? sub.status
        : sub.status === 'past_due'
        ? 'past_due'
        : 'canceled'

    const iso = (sec: number | null | undefined) => (sec ? new Date(sec * 1000).toISOString() : null)

    const payload2 = {
      user_id: userId,
      plan_id: planId,
      status: localStatus,
      current_period_start: iso(sub?.current_period_start),
      current_period_end: iso(sub?.current_period_end),
    }

    const { error: up2 } = await db.schema('app').from('user_subscriptions').upsert(payload2, { onConflict: 'user_id' })
    if (up2) console.error('[webhook] user_subscriptions upsert failed:', up2)
  } catch (e) {
    console.error('[webhook] syncCustomerFromStripe error:', e)
  }
}
