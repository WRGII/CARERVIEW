// netlify/functions/create-checkout-session.ts
import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
})

// Service-role Supabase client (bypasses RLS for webhooks/system writes)
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:5173'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const { user_id, email, price_id, coupon_code } = JSON.parse(event.body || '{}') as {
      user_id: string
      email: string
      price_id: string
      coupon_code?: string | null
    }

    if (!user_id || !email || !price_id) {
      return { statusCode: 400, body: 'Missing user_id, email, or price_id' }
    }

    // 1) Ensure Stripe customer
    let customerId: string | null = null

    // Try lookup from your local table
    const { data: existing, error: selErr } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user_id)
      .maybeSingle()

    if (selErr) {
      console.warn('stripe_customers lookup error:', selErr)
    }

    if (existing?.customer_id) {
      customerId = existing.customer_id
    } else {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id },
      })
      customerId = customer.id
      // Save mapping
      const { error: insErr } = await supabase
        .from('stripe_customers')
        .insert({ user_id, customer_id: customerId })
      if (insErr) console.warn('stripe_customers insert error:', insErr)
    }

    // 2) Optional: resolve promotion code -> ID (if a valid code was supplied)
    let discount: Stripe.Checkout.SessionCreateParams.Discount | undefined
    if (coupon_code && coupon_code.trim()) {
      const promos = await stripe.promotionCodes.list({
        code: coupon_code.trim(),
        active: true,
        limit: 1,
      })
      const promo = promos.data[0]
      if (promo) {
        discount = { promotion_code: promo.id }
      } else {
        // soft-fail: ignore bad code; front-end can show a warning if you prefer
        console.warn('No active promotion code found for:', coupon_code)
      }
    }

    // 3) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId!,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${PUBLIC_SITE_URL}/caregiver?checkout=success`,
      cancel_url: `${PUBLIC_SITE_URL}/create-account?checkout=cancel`,
      // Attach user reference so the webhook knows who this belongs to
      metadata: { user_id },
      discounts: discount ? [discount] : undefined,
      allow_promotion_codes: true, // also let users enter directly in Stripe UI
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
      headers: { 'Content-Type': 'application/json' },
    }
  } catch (err: any) {
    console.error('create-checkout-session error:', err)
    return { statusCode: 500, body: err?.message || 'Server error' }
  }
}
