// supabase/functions/stripe-checkout/index.ts
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const PRICE_PRIMARY = Deno.env.get("STRIPE_PRICE_PRIMARY_WEEKLY") || "";
const PRICE_OCCASIONAL = Deno.env.get("STRIPE_PRICE_OCCASIONAL_WEEKLY") || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan_id, /* price_id (ignored now) */ coupon, success_url, cancel_url } =
      await req.json();

    if (!plan_id) throw new Error("Missing plan_id");
    if (!success_url || !cancel_url) throw new Error("Missing return URLs");

    const expectedPrice =
      plan_id === "primary_weekly"
        ? PRICE_PRIMARY
        : plan_id === "occasional_weekly"
        ? PRICE_OCCASIONAL
        : "";

    if (!expectedPrice) {
      throw new Error(`Missing Stripe price id for plan: ${plan_id}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: expectedPrice, quantity: 1 }],
      discounts: coupon ? [{ coupon }] : undefined,
      success_url,
      cancel_url,
      // add metadata if you want:
      // metadata: { plan_id },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
