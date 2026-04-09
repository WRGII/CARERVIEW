import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * ENV (Supabase → Project Settings → Functions → Secrets)
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PUBLIC_SITE_URL (optional; fallback for origin)
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || ''

const ALLOWED_ORIGIN = PUBLIC_SITE_URL || '*'

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
}

function resp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function ensureSessionIdToken(url: string): string {
  // Guarantee we include {CHECKOUT_SESSION_ID}
  if (url.includes('{CHECKOUT_SESSION_ID}')) return url
  try {
    const u = new URL(url)
    // append/overwrite session_id
    u.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')
    return u.toString()
  } catch {
    // Not a full URL? Just append best-effort
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}session_id={CHECKOUT_SESSION_ID}`
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== 'POST') return resp({ error: 'Method not allowed' }, 405)

  // Rate limiting check (20 requests per minute for checkout)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const supabaseForRate = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: rateLimitCheck } = await supabaseForRate.rpc('check_rate_limit', {
    p_identifier: clientIp,
    p_endpoint: 'stripe-checkout',
    p_max_requests: 20,
    p_window_minutes: 1
  })

  if (rateLimitCheck && !rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retry_after: Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          ...JSON_HEADERS,
          'Retry-After': String(Math.ceil((new Date(rateLimitCheck.reset_at).getTime() - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimitCheck.limit),
          'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
          'X-RateLimit-Reset': rateLimitCheck.reset_at
        }
      }
    )
  }

  try {
    // End-user auth context (bearer comes from the frontend)
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: userData, error: userErr } = await authClient.auth.getUser()
    if (userErr) throw userErr
    const user = userData.user
    if (!user) return resp({ error: 'Not authenticated' }, 401)

    // Privileged DB client (for customer mapping)
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json().catch(() => ({}))
    const priceId: string | null = body?.price_id ?? null
    const planId: string | null = body?.plan_id ?? null

    // Optional: client can pass success/cancel; otherwise we build defaults
    const origin = PUBLIC_SITE_URL || new URL(req.url).origin
    const defaultSuccess = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const defaultCancel = `${origin}/choose-plan?canceled=1`

    const rawSuccess: string = body?.success_url || defaultSuccess
    const rawCancel: string = body?.cancel_url || defaultCancel

    const success_url = ensureSessionIdToken(rawSuccess)
    const cancel_url = rawCancel

    if (!priceId) return resp({ error: 'Missing price_id' }, 400)
    if (!planId) return resp({ error: 'Missing plan_id' }, 400)

    // Validate plan_id exists and matches price_id
    const { data: planData, error: planErr } = await db
      .from('subscription_plans')
      .select('id, stripe_price_id')
      .eq('id', planId)
      .maybeSingle()

    if (planErr) throw planErr
    if (!planData) return resp({ error: `Invalid plan_id: ${planId}` }, 400)
    if (planData.stripe_price_id !== priceId) {
      return resp({ error: `Price ID ${priceId} does not match plan ${planId}` }, 400)
    }

    // 0) Ensure a profile row exists for this user — required for user_subscriptions FK
    const { data: profileRow } = await db
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profileRow) {
      const { error: profileCreateErr } = await db.from('profiles').upsert(
        {
          id: user.id,
          email: user.email ?? null,
          display_name: user.user_metadata?.display_name ?? '',
          role: 'caregiver',
          disabled: false,
        },
        { onConflict: 'id' }
      )
      if (profileCreateErr) {
        console.warn('[stripe-checkout] profile auto-create failed (non-fatal):', profileCreateErr.message)
      }
    }

    // 1) Ensure Stripe customer mapping for this user
    const { data: existing, error: mapErr } = await db
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (mapErr) throw mapErr

    const rawCustomerId = existing?.customer_id as string | undefined
    const isValidCustomerId = (id: string | undefined): id is string =>
      typeof id === 'string' && /^cus_[A-Za-z0-9_]+$/.test(id)

    let customerId: string
    if (isValidCustomerId(rawCustomerId)) {
      customerId = rawCustomerId
    } else {
      if (rawCustomerId) {
        console.warn('[stripe-checkout] Invalid customer_id format detected for user:', user.id, '– creating fresh customer')
      }
      let newCustomer: Stripe.Customer
      try {
        newCustomer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { user_id: user.id },
        })
      } catch (stripeErr: any) {
        console.error('[stripe-checkout] Stripe customer creation failed:', stripeErr?.message || stripeErr)
        return resp({ error: 'Failed to create Stripe customer. Please try again.' }, 500)
      }
      customerId = newCustomer.id

      const { error: upErr } = await db
        .from('stripe_customers')
        .upsert(
          { user_id: user.id, customer_id: customerId },
          { onConflict: 'user_id', ignoreDuplicates: false }
        )
      if (upErr) {
        console.error('[stripe-checkout] stripe_customers upsert failed (non-fatal):', upErr.message)
      }
    }

    // 2) Create Checkout Session (force metadata to include user_id + plan_id)
    // Idempotency key scoped to user+plan so rapid double-clicks reuse the same session
    const idempotencyKey = `checkout:${user.id}:${planId}`
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url,
        cancel_url,
        client_reference_id: user.id,
        subscription_data: {
          metadata: { user_id: user.id, plan_id: planId },
        },
        metadata: { user_id: user.id, plan_id: planId },
      },
      { idempotencyKey },
    )

    return resp({ url: session.url, id: session.id })
  } catch (err: any) {
    console.error('[stripe-checkout] error:', err?.message || err)
    return resp({ error: err?.message || 'Failed to create checkout session' }, 500)
  }
})
