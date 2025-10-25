// supabase/functions/stripe-portal/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

/**
 * Secrets needed (Functions → Secrets):
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PUBLIC_SITE_URL (e.g. https://your-site.com)
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUBLIC_SITE  = Deno.env.get('PUBLIC_SITE_URL') || ''

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
  if (req.method !== 'POST')    return resp({ error: 'Method not allowed' }, 405)

  // Rate limiting check (20 requests per minute for portal)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const supabaseForRate = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: rateLimitCheck } = await supabaseForRate.rpc('check_rate_limit', {
    p_identifier: clientIp,
    p_endpoint: 'stripe-portal',
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
    // End-user context (bearer from frontend invoke)
    const auth = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error: userErr } = await auth.auth.getUser()
    if (userErr) throw userErr
    if (!user) return resp({ error: 'Not authenticated' }, 401)

    // Privileged DB client to read mapping
    const db = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: map, error: mapErr } = await db
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (mapErr) throw mapErr
    const customerId = map?.customer_id
    if (!customerId) return resp({ error: 'Stripe customer not found' }, 404)

    const returnUrl = `${PUBLIC_SITE || new URL(req.url).origin}/caregiver`

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      flow_data: {
        type: 'payment_method_update', // users can still navigate to other actions
      },
    })

    return resp({ url: session.url })
  } catch (e: any) {
    console.error('[stripe-portal] error:', e?.message || e)
    return resp({ error: 'Failed to create portal session' }, 500)
  }
})
