// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * ENV EXPECTATIONS (set in Supabase project settings)
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables for Stripe webhook function.')
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-06-20',
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const supabase = createClient(supabaseUrl, serviceRoleKey)

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature, Authorization',
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: JSON_HEADERS })
    }
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: JSON_HEADERS })
    }

    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing Stripe-Signature header' }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }

    // IMPORTANT: use the raw body for signature verification
    const body = await req.text()

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Stripe signature verification failed:', err?.message)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }

    // Process and then return 200 to Stripe
    await handleEvent(event)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (err: any) {
    console.error('Webhook error:', err?.message || err)
    return new Response(JSON.stringify({ error: err?.message || 'Webhook error' }), {
      status: 500,
      headers: JSON_HEADERS,
    })
  }
})

/**
 * Top-level handler for Stripe events we care about.
 */
async function handleEvent(event: Stripe.Event) {
  const type = event.type
  const obj = event.data?.object as any

  // Extract Stripe customer id (present on sessions, subscriptions, invoices, etc.)
  const customerId = extractCustomerId(obj)

  switch (type) {
    case 'checkout.session.completed': {
      const session = obj as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(session)
      break
    }

    // Subscription lifecycle — keep our DB in sync
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      if (customerId) {
        await syncCustomerFromStripe(customerId)
      } else {
        console.warn(`No customerId found for event: ${type}`)
      }
      break
    }

    default: {
      // Not relevant for our flow — ignore quietly
      break
    }
  }
}

function extractCustomerId(obj: any): string | null {
  if (!obj) return null
  if (typeof obj.customer === 'string') return obj.customer
  if (obj.customer && typeof obj.customer.id === 'string') return obj.customer.id
  if (obj.customer_details?.customer) return obj.customer_details.customer
  return null
}

/**
 * When checkout completes:
 * - ensure we have a stripe_customers mapping (user_id ↔ customer_id)
 * - if mode=subscription, sync subscription and local user_subscriptions
 * - if mode=payment, insert into stripe_orders
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = extractCustomerId(session)
  if (!customerId) {
    console.warn('checkout.session.completed without customerId; skipping')
    return
  }

  // Ensure stripe_customers mapping
  // We expect you passed user_id in session.metadata.user_id when creating the session
  const userId = (session.metadata?.user_id as string) || null
  if (userId) {
    // Upsert mapping in public.stripe_customers
    await upsertStripeCustomer(userId, customerId)
  } else {
    // Try to see if mapping already exists; if not, we still continue
    const { data, error } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle()
    if (error) {
      console.error('stripe_customers lookup failed:', error)
    }
    if (!data) {
      console.warn('No stripe_customers mapping and no user_id in metadata; continuing anyway.')
    }
  }

  if (session.mode === 'subscription') {
    await syncCustomerFromStripe(customerId)
  } else if (session.mode === 'payment' && session.payment_status === 'paid') {
    await insertOneTimeOrder(session, customerId)
  }
}

/**
 * Insert one-time payment into public.stripe_orders (if you later sell one-off items).
 */
async function insertOneTimeOrder(session: Stripe.Checkout.Session, customerId: string) {
  try {
    const payload = {
      checkout_session_id: session.id,
      payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      customer_id: customerId,
      amount_subtotal: session.amount_subtotal ?? null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      payment_status: session.payment_status,
      status: 'completed',
    }

    const { error } = await supabase.from('stripe_orders').insert(payload)
    if (error) {
      console.error('stripe_orders insert failed:', error)
    }
  } catch (err) {
    console.error('insertOneTimeOrder error:', err)
  }
}

/**
 * Keep public.stripe_customers in sync (user_id ↔ customer_id)
 */
async function upsertStripeCustomer(userId: string, customerId: string) {
  const { error } = await supabase
    .from('stripe_customers')
    .upsert({ user_id: userId, customer_id: customerId }, { onConflict: 'user_id' })
  if (error) {
    console.error('stripe_customers upsert failed:', error)
  }
}

/**
 * Fetch latest subscription from Stripe and sync to:
 * - public.stripe_subscriptions (your Stripe mirror)
 * - app.user_subscriptions (your local plan gate)
 */
async function syncCustomerFromStripe(customerId: string) {
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method', 'data.items.data.price'],
    })

    if (!subs.data.length) {
      // No subscription; mark as canceled locally if we can resolve the user
      await writeStripeSubscriptionRow(customerId, null)
      await deactivateLocalUserSubscription(customerId)
      return
    }

    const sub = subs.data[0]
    const defaultPM =
      sub.default_payment_method && typeof sub.default_payment_method !== 'string'
        ? sub.default_payment_method
        : null

    // Mirror to public.stripe_subscriptions
    await writeStripeSubscriptionRow(customerId, {
      subscription_id: sub.id,
      price_id: sub.items.data[0]?.price?.id ?? null,
      current_period_start: sub.current_period_start ?? null,
      current_period_end: sub.current_period_end ?? null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      payment_method_brand: defaultPM?.card?.brand ?? null,
      payment_method_last4: defaultPM?.card?.last4 ?? null,
      status: sub.status,
    })

    // Update local gate: app.user_subscriptions
    const priceId = sub.items.data[0]?.price?.id ?? null
    await upsertLocalUserSubscriptionFromStripe(customerId, priceId, sub.status, sub.current_period_start, sub.current_period_end)
  } catch (err) {
    console.error('syncCustomerFromStripe failed:', err)
  }
}

async function writeStripeSubscriptionRow(
  customerId: string,
  sub:
    | null
    | {
        subscription_id: string | null
        price_id: string | null
        current_period_start: number | null
        current_period_end: number | null
        cancel_at_period_end: boolean
        payment_method_brand: string | null
        payment_method_last4: string | null
        status: Stripe.Subscription.Status
      },
) {
  // If sub is null, we set a canceled/empty row so UI can reflect no active sub
  const payload = sub
    ? {
        customer_id: customerId,
        subscription_id: sub.subscription_id,
        price_id: sub.price_id,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        payment_method_brand: sub.payment_method_brand,
        payment_method_last4: sub.payment_method_last4,
        status: sub.status,
      }
    : {
        customer_id: customerId,
        subscription_id: null,
        price_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        payment_method_brand: null,
        payment_method_last4: null,
        status: 'canceled' as const,
      }

  const { error } = await supabase
    .from('stripe_subscriptions') // public schema
    .upsert(payload, { onConflict: 'customer_id' })

  if (error) {
    console.error('stripe_subscriptions upsert failed:', error)
  }
}

/**
 * Update app.user_subscriptions using Stripe data.
 * - resolve user_id via public.stripe_customers
 * - map Stripe price_id → app.subscription_plans.id using app.subscription_plans.stripe_price_id
 * - write status + period in ISO
 */
async function upsertLocalUserSubscriptionFromStripe(
  customerId: string,
  stripePriceId: string | null,
  stripeStatus: Stripe.Subscription.Status,
  periodStart: number | null,
  periodEnd: number | null,
) {
  // Resolve user_id from public.stripe_customers
  const { data: customerRow, error: custErr } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()

  if (custErr) {
    console.error('lookup stripe_customers failed:', custErr)
    return
  }
  const userId = customerRow?.user_id
  if (!userId) {
    console.warn('No user_id found for customer; skip local user_subscriptions update')
    return
  }

  // Map Stripe price → local plan_id
  let planId: string | null = null
  if (stripePriceId) {
    const { data: planRow, error: planErr } = await supabase
      .schema('app')
      .from('subscription_plans')
      .select('id')
      .eq('stripe_price_id', stripePriceId)
      .maybeSingle()
    if (planErr) {
      console.error('subscription_plans lookup failed:', planErr)
    }
    planId = planRow?.id ?? null
  }

  // Normalize status for local table (keep raw or reduce to active/canceled/trialing)
  const localStatus =
    stripeStatus === 'active' || stripeStatus === 'trialing'
      ? stripeStatus
      : stripeStatus === 'past_due'
      ? 'past_due'
      : 'canceled' // treat everything else as non-usable

  const iso = (sec: number | null) => (sec ? new Date(sec * 1000).toISOString() : null)

  const payload = {
    user_id: userId,
    plan_id: planId,
    status: localStatus,
    current_period_start: iso(periodStart),
    current_period_end: iso(periodEnd),
  }

  const { error } = await supabase
    .schema('app')
    .from('user_subscriptions')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    console.error('app.user_subscriptions upsert failed:', error)
  }
}

/**
 * If customer has no subs, mark local user_subscriptions canceled (if mapping exists).
 */
async function deactivateLocalUserSubscription(customerId: string) {
  const { data: customerRow, error: custErr } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle()

  if (custErr) {
    console.error('lookup stripe_customers failed:', custErr)
    return
  }
  const userId = customerRow?.user_id
  if (!userId) return

  const { error } = await supabase
    .schema('app')
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: null,
        status: 'canceled',
        current_period_start: null,
        current_period_end: null,
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('deactivate user_subscriptions failed:', error)
  }
}
