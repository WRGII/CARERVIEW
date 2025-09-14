// supabase/functions/stripe-checkout/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Required env (set in Supabase Project Settings → Functions):
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({}))
    const {
      price_id,                // required for paid plans
      plan_key,                // optional, for your own logging/metadata
      promotionCode,           // optional user-entered code, e.g. "CarerViewFriend2025"
      success_url,             // required
      cancel_url,              // required
    } = body ?? {}

    // If price_id is null/empty, caller should have skipped; guard anyway.
    if (!price_id) {
      return json({ skip: true })
    }

    // Build a client that can read the auth user from the request
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { data: userRes } = await supabase.auth.getUser()
    const user = userRes?.user
    if (!user?.id) {
      return json({ error: 'Not authenticated' }, 401)
    }

    // Try to reuse existing Stripe customer (if mapping exists)
    let customerId: string | null = null
    {
      const { data, error } = await supabase
        .from('stripe_customers') // public schema
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!error && data?.customer_id) {
        customerId = data.customer_id
      }
    }

    // Resolve promotion code (string) → promotion_code id for Stripe
    let discounts: Array<{ promotion_code: string }> | undefined
    if (promotionCode && typeof promotionCode === 'string') {
      try {
        const list = await stripe.promotionCodes.list({
          code: promotionCode,
          active: true,
          limit: 1,
        })
        const promo = list.data[0]
        if (promo?.id) {
          discounts = [{ promotion_code: promo.id }]
        }
      } catch (err) {
        // Non-fatal: if code is invalid, proceed without a discount
        console.warn('promotionCode lookup failed:', err)
      }
    }

    // Create checkout session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url,
      cancel_url,
      line_items: [{ price: price_id, quantity: 1 }],
      customer: customerId ?? undefined, // let Stripe create a new one if null
      metadata: {
        user_id: user.id,
        plan_key: plan_key ?? '',
      },
      allow_promotion_codes: true, // lets users enter at checkout too
      discounts,
    })

    return json({ url: session.url })
  } catch (err: any) {
    console.error('stripe-checkout error:', err?.message || err)
    return json({ error: err?.message || 'Stripe checkout error' }, 500)
  }
})
