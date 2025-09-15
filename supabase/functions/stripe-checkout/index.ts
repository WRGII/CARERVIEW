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
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
} as const

type ReqBody = {
  price_id?: string | null
  plan_id?: string | null        // optional hint from UI; we’ll validate against DB mapping
  promotionCode?: string | null  // preferred key
  coupon?: string | null         // legacy alias
  success_url?: string
  cancel_url?: string
}

type Json = Record<string, unknown>

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    // 0) Auth as the end-user (bearer token forwarded from supabase.functions.invoke)
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error: userErr } = await authClient.auth.getUser()
    if (userErr) throw userErr
    if (!user) return json({ error: 'Not authenticated' }, 401)

    // Service client for privileged DB reads/writes
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = (await req.json().catch(() => ({}))) as ReqBody
    const price_id = body.price_id ?? null
    const plan_hint = body.plan_id ?? null
    const promoCode = (body.promotionCode ?? body.coupon ?? '').trim() || null

    const origin = PUBLIC_SITE_URL || new URL(req.url).origin
    const success_url = body.success_url || `${origin}/caregiver`
    const cancel_url = body.cancel_url || `${origin}/create-account?canceled=1`

    if (!price_id) return json({ error: 'Missing price_id' }, 400)

    // 1) Validate the price against your configured plans in *public.subscription_plans*
    const { data: planRow, error: planErr } = await db
      .from('subscription_plans')               // public schema
      .select('id, price_id')
      .eq('price_id', price_id)
      .maybeSingle()

    if (planErr) throw planErr
    if (!planRow?.id) {
      return json({ error: 'Unknown or disabled price_id' }, 400)
    }
    // Optional: if UI sent a plan_id, sanity-check it
    if (plan_hint && plan_hint !== planRow.id) {
      console.warn(
        `[stripe-checkout] plan_id mismatch: body.plan_id=${plan_hint} vs db.plan_id=${planRow.id}`
      )
      // Non-fatal: continue with db-validated plan
    }

    // 2) Ensure Stripe Customer mapping for this user (public.stripe_customers)
    const { data: existing, error: mapErr } = await db
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (mapErr) throw mapErr

    let customerId: string | undefined = existing?.customer_id as string | undefined
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

    // 3) Optional promo code → `discounts` param
    let discounts: Array<{ promotion_code: string }> | undefined
    if (promoCode) {
      try {
        const promos = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 })
        const promo = promos.data[0]
        if (promo?.id) discounts = [{ promotion_code: promo.id }]
        else console.warn(`[stripe-checkout] promotion code not found: ${promoCode}`)
      } catch (e) {
        console.warn(`[stripe-checkout] promotionCodes.list failed for code "${promoCode}":`, e)
      }
    }

    // 4) Create Stripe Checkout Session
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
      metadata: { user_id: user.id, plan_id: planRow.id },
    })

    return json({ url: session.url, id: session.id })
  } catch (err: any) {
    console.error('[stripe-checkout] error:', err?.message || err)
    return json({ error: err?.message || 'Failed to create checkout session' }, 500)
  }
})

function json(body: Json, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}
