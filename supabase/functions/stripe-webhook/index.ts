// supabase/functions/stripe-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@17.7.0"
import { createClient } from "npm:@supabase/supabase-js@2.49.1"

/**
 * Required Edge Function secrets (Supabase → Edge Functions → Secrets)
 * - STRIPE_SECRET_KEY                (sk_live_...)
 * - STRIPE_WEBHOOK_SECRET            (single whsec_...  — optional)
 * - STRIPE_WEBHOOK_SECRETS           (JSON array or CSV of whsec_... — preferred)
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  // Version here doesn't affect signature verification; safe to pin to latest account version.
  apiVersion: "2025-06-30.basil",
  httpClient: Stripe.createFetchHttpClient(), // Edge/Deno
  appInfo: { name: "CarerView", version: "1.0.0" },
})

function parseSecrets(): string[] {
  const multi = Deno.env.get("STRIPE_WEBHOOK_SECRETS")?.trim()
  const single = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim()
  if (multi) {
    try {
      const arr = JSON.parse(multi)
      if (Array.isArray(arr)) return arr.filter(Boolean).map((s: string) => s.trim())
    } catch {
      return multi.split(",").map(s => s.trim()).filter(Boolean)
    }
  }
  return single ? [single] : []
}

const WEBHOOK_SECRETS = parseSecrets()
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Stripe-Signature",
}

const resp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

async function getUserIdByCustomer(db: ReturnType<typeof createClient>, customerId: string) {
  const { data, error } = await db
    .from("stripe_customers")
    .select("user_id")
    .eq("customer_id", customerId)
    .maybeSingle()
  if (error) throw error
  return (data?.user_id as string | undefined) ?? undefined
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS })
  if (req.method !== "POST") return resp({ error: "Method not allowed" }, 405)

  const rawBody = await req.text()
  const sig = req.headers.get("stripe-signature") ?? req.headers.get("Stripe-Signature") ?? ""

  console.info("[stripe-webhook] debug", {
    hasSigHeader: Boolean(sig),
    bodyLen: rawBody.length,
    secretCount: WEBHOOK_SECRETS.length,
  })

  if (!WEBHOOK_SECRETS.length) {
    console.error("[stripe-webhook] no webhook secrets configured")
    return resp({ error: "Webhook secret not configured" }, 500)
  }
  if (!sig) {
    // Supabase "Test" panel does not send Stripe-Signature; this is expected there.
    return resp({ error: "Missing Stripe-Signature header" }, 400)
  }

  // Verify signature (Edge requires the ASYNC API)
  let event: Stripe.Event | undefined
  let lastErr: unknown
  for (let i = 0; i < WEBHOOK_SECRETS.length; i++) {
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, WEBHOOK_SECRETS[i])
      console.log(`[stripe-webhook] signature verified with secret #${i + 1}: ${event.type}`)
      break
    } catch (e) {
      lastErr = e
    }
  }
  if (!event) {
    console.error("[stripe-webhook] invalid signature for all secrets", { lastErr: String(lastErr) })
    return resp({ error: "Invalid signature" }, 400)
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    switch (event.type) {
      /**
       * Ensure we store the mapping customer ↔ user_id as soon as checkout completes.
       * Your checkout code should set session.metadata.user_id.
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = (session.customer as string | null) ?? null
        const userId = (session.metadata?.user_id as string | undefined) ?? undefined

        console.log("[stripe-webhook] checkout.session.completed", {
          customerId, userId, mode: session.mode,
        })

        if (customerId && userId) {
          // upsert by user_id keeps a single mapping per user
          const { error } = await db
            .from("stripe_customers")
            .upsert({ user_id: userId, customer_id: customerId }, { onConflict: "user_id" })
          if (error) console.warn("[stripe-webhook] upsert stripe_customers failed", error)
        }
        return resp({ received: true })
      }

      /**
       * Primary source of truth for gating access.
       * Write to public.user_subscriptions (the 4 columns your table has).
       */
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription

        // Find user_id from metadata, else via stripe_customers mapping
        const userId =
          (sub.metadata?.user_id as string | undefined) ||
          (await getUserIdByCustomer(db, sub.customer as string))

        if (!userId) {
          console.warn("[stripe-webhook] subscription event with no user_id", {
            subId: sub.id, customer: sub.customer,
          })
          return resp({ ok: true }) // don't 500; nothing to do
        }

        const priceId = sub.items?.data?.[0]?.price?.id ?? null
        const status = sub.status // 'active' | 'trialing' | 'canceled' | 'incomplete' | ...

        console.log("[stripe-webhook] upserting user_subscriptions", {
          userId, subId: sub.id, priceId, status,
        })

        // Your table has only: user_id, subscription_id, status, price_id
        // Do a manual upsert without relying on unique constraints.
        const { data: existing, error: selErr } = await db
          .from("user_subscriptions")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle()
        if (selErr) throw selErr

        if (existing) {
          const { error: updErr } = await db
            .from("user_subscriptions")
            .update({
              subscription_id: sub.id,
              status,
              price_id: priceId ?? undefined,
            })
            .eq("user_id", userId)
          if (updErr) throw updErr
        } else {
          const { error: insErr } = await db
            .from("user_subscriptions")
            .insert({
              user_id: userId,
              subscription_id: sub.id,
              status,
              price_id: priceId ?? undefined,
            })
          if (insErr) throw insErr
        }

        return resp({ received: true })
      }

      // (Optional) You can also listen to invoice.paid to reinforce status.
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("[stripe-webhook] invoice.paid", {
          invoice: invoice.id,
          customer: invoice.customer,
          total: invoice.total,
        })
        return resp({ received: true })
      }

      default: {
        // Ignore everything else
        console.log("[stripe-webhook] ignoring event", event.type)
        return resp({ received: true })
      }
    }
  } catch (err: any) {
    console.error("[stripe-webhook] handler error:", err?.message ?? err)
    return resp({ error: "Webhook handling failed" }, 500)
  }
})
