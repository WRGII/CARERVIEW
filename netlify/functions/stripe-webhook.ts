// netlify/functions/stripe-webhook.ts
import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sig = event.headers['stripe-signature']
  if (!sig) return { statusCode: 400, body: 'Missing stripe-signature' }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body as string,
      sig,
      endpointSecret
    )

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        const priceId =
          (session?.lines?.data?.[0]?.price?.id as string) ||
          (session?.metadata?.price_id as string) ||
          null
        const userId = (session.metadata && (session.metadata as any).user_id) || null

        if (userId && subId) {
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            subscription_id: subId,
            price_id: priceId,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object as Stripe.Subscription
        const priceId =
          typeof sub.items?.data?.[0]?.price?.id === 'string'
            ? (sub.items.data[0].price.id as string)
            : null

        // Resolve user_id from customer metadata if present
        let userId: string | null = null
        if (typeof sub.customer === 'string') {
          const cust = await stripe.customers.retrieve(sub.customer)
          if (!cust.deleted) {
            userId = ((cust as Stripe.Customer).metadata as any)?.user_id ?? null
            // If not present in metadata, you can also look up via stripe_customers table
            if (!userId) {
              const { data: row } = await supabase
                .from('stripe_customers')
                .select('user_id')
                .eq('customer_id', sub.customer)
                .maybeSingle()
              userId = row?.user_id ?? null
            }
          }
        }

        if (userId) {
          const status = sub.status // 'active' | 'past_due' | 'canceled' | etc.
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            subscription_id: sub.id,
            price_id: priceId,
            status,
            updated_at: new Date().toISOString(),
          })
        }
        break
      }

      default:
        // no-op
        break
    }

    return { statusCode: 200, body: 'ok' }
  } catch (err: any) {
    console.error('stripe-webhook error:', err)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }
}
