// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Secrets required (Project Settings → Functions → Secrets):
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRETS      // comma-separated list of whsec_... values (new first)
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// allow multiple secrets so rotations don’t break prod
const WH_SECRETS = (Deno.env.get('STRIPE_WEBHOOK_SECRETS') || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Stripe-Signature',
}

function resp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
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
    .from('subscription_plans')
    .select('id')
    .eq('price_id', priceId)
    .maybeSingle()
  if (error) throw error
  return data?.id as string | undefined
}

// Try each secret until one verifies
function constructWithAnySecret(body: string, sig: string): Stripe.Event {
  let lastErr: unknown
  for (const secret of WH_SECRETS) {
    try {
      return stripe.webhooks.constructEvent(body, sig, secret)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST') return resp({ error: 'Method not allowed' }, 405)

  if (!WH_SECRETS.length) {
    console.error('[stripe-webhook] no webhook secrets configured')
    return resp({ error: 'Server not configured' }, 500)
  }

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = constructWithAnySecret(rawBody, signature)
  } catch (err: any) {
    // Don’t log secrets; just give us enough context to debug
    console.error('[stripe-webhook] invalid signature', {
      bodyLen: rawBody.length,
      hasSigHeader: Boolean(signature),
      err: err?.message || String(err),
    })
    return resp({ error: 'Invalid signature' }, 400)
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        // Prefer metadata.user_id; else map via stripe_customers
        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await lookupUserIdFromCustomer(db, sub.customer as string))

        // Maintain customer mapping if we have both
        if (sub.customer && userId) {
          const { error: mapErr } = await db
            .from('stripe_customers')
            .upsert(
              { user_id: userId, customer_id: String(sub.customer) },
              { onConflict: 'user_id' }
            )
          if (mapErr) console.warn('[stripe-webhook] map upsert warn:', mapErr.message)
        }

        if (!userId) {
          console.warn('[stripe-webhook] no user_id for subscription', sub.id)
          return resp({ received: true })
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
            status: sub.status, // 'active' / 'trialing' / 'canceled' / 'past_due' / etc.
            current_period_start: pStart ? pStart.toISOString() : null,
            current_period_end: pEnd ? pEnd.toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,subscription_id' }
        )
        if (upErr) throw upErr

        console.log('[stripe-webhook] upserted', {
          type: event.type,
          userId,
          subId: sub.id,
          status: sub.status,
        })
        return resp({ received: true })
      }

      case 'checkout.session.completed': {
        // Optional: ensure stripe_customers mapping exists
        const cs = event.data.object as Stripe.Checkout.Session
        const userId = (cs.metadata?.user_id as string | undefined) || undefined
        if (cs.customer && userId) {
          const { error } = await db
            .from('stripe_customers')
            .upsert(
              { user_id: userId, customer_id: String(cs.customer) },
              { onConflict: 'user_id' }
            )
          if (error) console.warn('[stripe-webhook] mapping after checkout warn:', error.message)
        }
        return resp({ received: true })
      }

      // Reduce noise
      default:
        return resp({ received: true })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] handler error:', err?.message || String(err))
    return resp({ error: 'Webhook handling failed' }, 500)
  }
})
