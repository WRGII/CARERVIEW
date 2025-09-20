// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Secrets in Supabase → Project Settings → Functions → Secrets:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET          (single secret)          [optional]
 * - STRIPE_WEBHOOK_SECRETS         (JSON array or CSV)      [preferred]
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
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Stripe-Signature',
}

const resp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

// --- helpers ---
async function lookupUserIdFromCustomer(db: ReturnType<typeof createClient>, customerId: string) {
  const { data, error } = await db
    .from('stripe_customers') // public.stripe_customers
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()
  if (error) throw error
  return data?.user_id as string | undefined
}

// ✅ FIXED: pass db in, use TABLE public.subscription_plans, match on stripe_price_id, return id
async function planIdFromPrice(db: ReturnType<typeof createClient>, priceId: string) {
  const { data, error } = await db
    .from('subscription_plans')  // public.subscription_plans (table)
    .select('id')
    .eq('stripe_price_id', priceId)
    .maybeSingle()
  if (error) throw error
  return data?.id as string | undefined
}

const secToIso = (sec?: number | null) =>
  typeof sec === 'number' && isFinite(sec) ? new Date(sec * 1000).toISOString() : null

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST')    return resp({ error: 'Method not allowed' }, 405)

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? req.headers.get('Stripe-Signature') ?? ''

  console.info('[stripe-webhook] debug', {
    hasSigHeader: !!sig,
    bodyLen: rawBody.length,
    secretCount: WEBHOOK_SECRETS.length,
  })

  if (!sig) return resp({ error: 'Missing Stripe-Signature header' }, 400)
  if (WEBHOOK_SECRETS.length === 0) {
    console.error('[stripe-webhook] no webhook secrets configured')
    return resp({ error: 'Webhook secret not configured' }, 500)
  }

  // Verify (Edge needs the async variant)
  let event: Stripe.Event | undefined
  let lastErr: unknown
  for (let i = 0; i < WEBHOOK_SECRETS.length; i++) {
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, WEBHOOK_SECRETS[i])
      console.log(`[stripe-webhook] signature ok with secret #${i + 1} (${event.type})`)
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string | null
        const userId = (session.metadata?.user_id as string | undefined) || undefined

        if (customerId && userId) {
          const { error } = await db.from('stripe_customers').upsert(
            { user_id: userId, customer_id: customerId, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
          if (error) console.warn('[stripe-webhook] upsert stripe_customers failed', error)
        }
        return resp({ received: true })
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await lookupUserIdFromCustomer(db, sub.customer as string))

        if (!userId) {
          console.warn('[stripe-webhook] no user_id for subscription', sub.id)
          return resp({ ok: true })
        }

        const item    = sub.items?.data?.[0]
        const priceId = item?.price?.id ?? null

        // Prefer subscription-level period fields (present on all API versions)
        const pStartIso = secToIso(sub.current_period_start)
        const pEndIso   = secToIso(sub.current_period_end)

        // Try to get plan_id from metadata first, then fallback to price lookup
        let mappedPlanId: string | undefined = sub.metadata?.plan_id as string | undefined
        if (priceId && !mappedPlanId) {
          try { mappedPlanId = await planIdFromPrice(db, priceId) }
          catch (e) { console.warn('[stripe-webhook] plan lookup failed for price', priceId, e) }
        }

        const { error: upErr } = await db.from('user_subscriptions').upsert(
          {
            user_id: userId,
            subscription_id: sub.id,
            price_id: priceId ?? undefined,          // Stripe price id
            plan_id: mappedPlanId ?? undefined,      // Our plan key (primary_weekly, occasional_weekly)
            status: sub.status,                      // 'active' | 'trialing' | ...
            current_period_start: pStartIso,
            current_period_end:   pEndIso,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,subscription_id' },
        )
        if (upErr) throw upErr

        console.info('[stripe-webhook] upserted user_subscriptions', {
          userId, subscription: sub.id, plan: mappedPlanId, priceId, status: sub.status,
          pStartIso, pEndIso
        })

        return resp({ received: true })
      }

      default:
        return resp({ received: true })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] handler error:', err?.message || err)
    return resp({ error: 'Webhook handling failed' }, 500)
  }
})
