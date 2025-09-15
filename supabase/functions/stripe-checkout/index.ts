// supabase/functions/stripe-checkout/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * ENV (Supabase → Project Settings → Functions → Secrets)
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PUBLIC_SITE_URL (e.g., https://carerview.netlify.app)
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || ''

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS })
  }
  if (req.method !== 'POST') {
    return resp({ error: 'Method not allowed' }, 405)
  }

  try {
    // End-user auth context (bearer comes from the frontend)
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error: userErr } = await authClient.auth.getUser()
    if (userErr) throw userErr
    if (!user) return resp({ error: 'Not authenticated' }, 401)

    // Privileged DB client
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json().catch(() => ({}))
    const price_id: string | null = body?.price_id ?? null
    const promotionCode: string | null = (body?.promotionCode || body?.coupon) ?? null

    const origin = PUBLIC_SITE_URL || new URL(req.url).origin
    const success_url: string = body?.success_url || `${origin}/caregiver`
    const cancel_url: string = body?.cancel_url || `${origin}/create-account?canceled=1`

    if (!price_id) return resp({ error: 'Missing price_id' }, 400)

    // 1) Ensure Stripe customer mapping for this user
    const { data: existing, error: mapErr } = await db
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (mapErr) throw mapErr

    let customerId = existing?.customer_id as string | undefined
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

    // 2) Optional promo code -> Stripe promotion_code
    let discounts: Array<{ promotion_code: string }> | undefined
    let promoApplied = false
    if (promotionCode) {
      const promos = await stripe.promotionCodes.list({
        code: promotionCode,
        active: true,
        limit: 1,
      })
      const promo = promos.data[0]
      if (promo?.id) {
        discounts = [{ promotion_code: promo.id }]
        promoApplied = true
      }
    }

    // 3) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      discounts,
      success_url,
      cancel_url,
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id },
    })

    return resp({ url: session.url, id: session.id, promo_applied: promoApplied })
  } catch (err: any) {
    console.error('[stripe-checkout] error:', err?.message || err)
    return resp({ error: err?.message || 'Failed to create checkout session' }, 500)
  }
})

function resp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}
