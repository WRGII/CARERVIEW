import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * ENV (Project Settings → Functions → Secrets)
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRETS  (comma-separated; fallback: STRIPE_WEBHOOK_SECRET)
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SECRET_LIST = (
  Deno.env.get('STRIPE_WEBHOOK_SECRETS') ||
  Deno.env.get('STRIPE_WEBHOOK_SECRET') ||
  ''
)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Stripe-Signature',
}
const resp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

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
    .from('subscription_plans')
    .select('id')
    .eq('price_id', priceId)
    .maybeSingle()
  if (error) throw error
  return data?.id as string | undefined
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST') return resp({ error: 'Method not allowed' }, 405)

  // IMPORTANT: read raw body first, before touching it.
  const rawBody = await req.text()
  const sigHeader = req.headers.get('stripe-signature') ?? ''

  // 🔎 Debug: confirm Stripe is really reaching us with header + body
  console.log('[stripe-webhook] debug', {
    hasSigHeader: !!sigHeader,
    bodyLen: rawBody.length,
    secretCount: SECRET_LIST.length,
  })

  let event: Stripe.Event | null = null
  let lastErr: unknown = null

  for (let i = 0; i < SECRET_LIST.length; i++) {
    const secret = SECRET_LIST[i]
    try {
      event = stripe.webhooks.constructEvent(rawBody, sigHeader, secret)
      console.log('[stripe-webhook] signature matched', { matchedIndex: i })
      break
    } catch (e) {
      lastErr = e
    }
  }

  if (!event) {
    console.error('[stripe-webhook] invalid signature for all secrets', { lastErr: String(lastErr) })
    return resp({ error: 'Invalid signature' }, 400)
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await lookupUserIdFromCustomer(db, sub.customer as string))

        if (!userId) {
          console.warn('[stripe-webhook] no user_id for subscription', sub.id, sub.customer)
          return resp({ ok: true })
        }

        const item = sub.items?.data?.[0]
        const priceId = item?.price?.id ?? null
        const pStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : null
        const pEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null

        let mappedPlanId: string | undefined
        if (priceId) {
          try {
            mappedPlanId = await planIdFromPrice(db, priceId)
          } catch (e) {
            console.warn('[stripe-webhook] plan lookup failed for price', priceId, e)
          }
        }

        const { error: upErr } = await db.from('user_subscriptions').upsert(
          {
            user_id: userId,
            subscription_id: sub.id,
            price_id: priceId ?? undefined,
            plan_id: mappedPlanId ?? undefined,
            status: sub.status,
            current_period_start: pStart ? pStart.toISOString() : null,
            current_period_end: pEnd ? pEnd.toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,subscription_id' }
        )
        if (upErr) throw upErr

        return resp({ received: true })
      }

      case 'checkout.session.completed': {
        return resp({ received: true })
      }

      default:
        return resp({ received: true })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] error:', err?.message || err)
    return resp({ error: 'Webhook handling failed' }, 500)
  }
})
