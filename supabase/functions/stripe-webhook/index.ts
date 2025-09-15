// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * ENV (Supabase → Project Settings → Functions → Secrets)
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Stripe-Signature',
}

function resp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

// helpers
async function lookupUserIdFromCustomer(db: ReturnType<typeof createClient>, customerId: string) {
  const { data, error } = await db
    .from('stripe_customers') // default schema is public
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()
  if (error) throw error
  return data?.user_id as string | undefined
}

async function planIdFromPrice(db: ReturnType<typeof createClient>, priceId: string) {
  // Works if public.subscription_plans is either a table or a view with price_id
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

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[stripe-webhook] invalid signature', err?.message || err)
    return resp({ error: 'Invalid signature' }, 400)
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        // Prefer metadata.user_id (we set it during checkout); fall back to mapping table.
        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await lookupUserIdFromCustomer(db, sub.customer as string))

        if (!userId) {
          console.warn('[stripe-webhook] no user_id for subscription', sub.id)
          return resp({ ok: true }) // don’t fail webhook
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

        // Upsert into the canonical table in PUBLIC
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
          { onConflict: 'user_id' }
        )
        if (upErr) throw upErr

        return resp({ received: true })
      }

      // Optional: you can log checkout completion, but subscription.created/updated
      // is where we keep state in the DB.
      case 'checkout.session.completed': {
        return resp({ received: true })
      }

      default:
        // Ignore other events
        return resp({ received: true })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] error:', err?.message || err)
    return resp({ error: 'Webhook handling failed' }, 500)
  }
})
