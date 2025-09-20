// supabase/functions/stripe-checkout/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Secrets (Supabase → Project Settings → Functions → Secrets):
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PUBLIC_SITE_URL  (e.g. https://carerview.netlify.app)
 */
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUBLIC_SITE_URL = (Deno.env.get('PUBLIC_SITE_URL') || '').trim()

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
}

function resp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST') return resp({ error: 'Method not allowed' }, 405)

  try {
    // End-user auth context
    const auth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: userData, error: userErr } = await auth.auth.getUser()
    if (userErr) throw userErr
    const user = userData.user
    if (!user) return resp({ error: 'Not authenticated' }, 401)

    const body = await req.json().catch(() => ({}))
    const price_id: string | null = body?.price_id ?? null
    const plan_id: string | null = body?.plan_id ?? null
    const promotionCode: string | null = (body?.promotionCode || body?.coupon) ?? null

    // Build success/cancel URLs. Include {CHECKOUT_SESSION_ID} so we can poll on the success page.
    const origin = PUBLIC_SITE_URL || new URL(req.url).origin
    const success_url: string =
      body?.success_url ||
      `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancel_url: string =
      body?.cancel_url ||
      `${origin}/choose-plan?canceled=1`

    if (!price_id) return resp({ error: 'Missing price_id' }, 400)
    if (!plan_id) return resp({ error: 'Missing plan_id' }, 400)

    // Privileged client for mapping persistence
    const db = createClient(SUPABASE_URL, SERVICE_KEY)

    // Ensure stripe_customers mapping
    let customerId: string | undefined
    {
      const { data: existing, error: mapErr } = await db
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (mapErr) throw mapErr

      customerId = existing?.customer_id as string | undefined
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { user_id: user.id },
        })
        customerId = customer.id
        const { error: upErr } = await db
          .from('stripe_customers')
          .upsert({ user_id: user.id, customer_id: customerId }, { onConflict: 'user_id' })
        if (upErr) throw upErr
      }
    }

    // Optional promo code lookup
    let discounts: Array<{ promotion_code: string }> | undefined
    if (promotionCode) {
      const promos = await stripe.promotionCodes.list({
        code: promotionCode,
        active: true,
        limit: 1,
      })
      const promo = promos.data[0]
      if (promo?.id) discounts = [{ promotion_code: promo.id }]
    }

    // Create checkout session with user + plan metadata
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      discounts,
      success_url,
      cancel_url,
      client_reference_id: user.id,
      subscription_data: {
        metadata: { user_id: user.id, plan_id },
      },
      metadata: { user_id: user.id, plan_id },
    })

    return resp({ url: session.url, id: session.id })
  } catch (err: any) {
    console.error('[stripe-checkout] error:', err?.message || err)
    return resp({ error: err?.message || 'Failed to create checkout session' }, 500)
  }
})
