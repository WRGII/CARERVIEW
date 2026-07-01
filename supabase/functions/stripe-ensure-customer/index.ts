import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
  appInfo: { name: 'CarerView', version: '1.0.0' },
})

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || ''

function getAllowedOrigin(req: Request): string {
  const incoming = req.headers.get('origin') || ''
  if (incoming === PUBLIC_SITE_URL) return incoming
  const host = incoming.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const siteHost = PUBLIC_SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const bare = siteHost.replace(/^www\./, '')
  if (host === bare || host === `www.${bare}`) return incoming
  return PUBLIC_SITE_URL
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function resp(body: unknown, status = 200, req: Request) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) })
  if (req.method !== 'POST') return resp({ error: 'Method not allowed' }, 405, req)

  try {
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: userData, error: userErr } = await authClient.auth.getUser()
    if (userErr) throw userErr
    const user = userData.user
    if (!user) return resp({ error: 'Not authenticated' }, 401, req)

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: existing, error: mapErr } = await db
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (mapErr) throw mapErr

    if (existing?.customer_id) {
      return resp({ customer_id: existing.customer_id, created: false }, 200, req)
    }

    let newCustomer: Stripe.Customer
    try {
      newCustomer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      })
    } catch (stripeErr: any) {
      console.error('[stripe-ensure-customer] Stripe customer creation failed:', stripeErr?.message || stripeErr)
      return resp({ error: 'Failed to create Stripe customer. Please try again.' }, 500, req)
    }

    const { error: upErr } = await db
      .from('stripe_customers')
      .upsert({ user_id: user.id, customer_id: newCustomer.id }, { onConflict: 'user_id' })
    if (upErr) {
      console.error('[stripe-ensure-customer] stripe_customers upsert failed:', upErr.message)
      return resp({ error: 'Customer created in Stripe but could not be saved. Please contact support.' }, 500, req)
    }

    return resp({ customer_id: newCustomer.id, created: true }, 200, req)
  } catch (err: any) {
    console.error('[stripe-ensure-customer] error:', err?.message || err)
    return resp({ error: err?.message || 'Unexpected error' }, 500, req)
  }
})
