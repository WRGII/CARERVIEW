import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

// ✅ Read from your function secrets (with a fallback to VITE_ just in case)
const PRICE_PRIMARY =
  Deno.env.get('STRIPE_PRICE_PRIMARY_WEEKLY') ??
  Deno.env.get('VITE_STRIPE_PRICE_PRIMARY_WEEKLY') ?? ''

const PRICE_OCCASIONAL =
  Deno.env.get('STRIPE_PRICE_OCCASIONAL_WEEKLY') ??
  Deno.env.get('VITE_STRIPE_PRICE_OCCASIONAL_WEEKLY') ?? ''

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' }
})

type Body = {
  price_id: string
  plan_id: 'primary_weekly' | 'occasional_weekly'
  coupon?: string
  success_url: string
  cancel_url: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { headers: corsHeaders, status: 405 })
    }

    // Require an authenticated Supabase user
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const user = auth.user

    const { price_id, plan_id, coupon, success_url, cancel_url } = (await req.json()) as Body
    if (!price_id || !plan_id || !success_url || !cancel_url) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Enforce the correct price for the selected plan
    const expectedPrice = plan_id === 'primary_weekly' ? PRICE_PRIMARY
                       : plan_id === 'occasional_weekly' ? PRICE_OCCASIONAL
                       : ''
    if (!expectedPrice) {
      return new Response(JSON.stringify({ error: `Missing Stripe price id in function env for ${plan_id}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    if (price_id !== expectedPrice) {
      return new Response(JSON.stringify({ error: 'Invalid price for selected plan' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const discounts = coupon?.trim() ? [{ coupon: coupon.trim() }] : undefined

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      success_url,
      cancel_url,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      discounts,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan_id },
      subscription_data: { metadata: { user_id: user.id, plan_id } },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('stripe-checkout error', err)
    return new Response(JSON.stringify({ error: err?.message ?? 'Checkout failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
