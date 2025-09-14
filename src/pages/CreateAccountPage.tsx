// src/pages/CreateAccountPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { CreditCard, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/** DB row for subscription_plans (public schema) */
type SubscriptionPlan = {
  id: string;
  name: string;
  interval: "week" | "month" | "year" | string;
  price_cents: number;
  price_id: string | null; // Stripe Price ID (null for free plans)
};

function formatPriceUSD(cents: number, interval: string) {
  const dollars = (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
  return `${dollars} / ${interval}`;
}

const PENDING_KEY = "cv_pending_checkout"; // { planId, promoCode }

async function startCheckout(params: {
  userId: string;
  email: string;
  priceId: string;
  coupon?: string | null;
}) {
  const res = await fetch("/.netlify/functions/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: params.userId,
      email: params.email,
      price_id: params.priceId,
      coupon_code: params.coupon ?? null,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const { url } = (await res.json()) as { url?: string };
  if (!url) throw new Error("No checkout URL returned");
  window.location.assign(url);
}

export default function CreateAccountPage() {
  const navigate = useNavigate();

  // ---- Load plans -----------------------------------------------------------
  const plansQ = useQuery({
    queryKey: ["plans"],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("id, name, interval, price_cents, price_id")
        .order("price_cents", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  // ---- Local UI state -------------------------------------------------------
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [promoCode, setPromoCode] = React.useState<string>("");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const selectedPlan = React.useMemo(
    () => plansQ.data?.find((p) => p.id === selectedPlanId) || null,
    [plansQ.data, selectedPlanId]
  );

  // Pick the cheapest as default when loaded
  React.useEffect(() => {
    if (!selectedPlanId && plansQ.data && plansQ.data.length > 0) {
      setSelectedPlanId(plansQ.data[0].id);
    }
  }, [plansQ.data, selectedPlanId]);

  // If the user returns signed-in and we have a pending checkout, resume it.
  React.useEffect(() => {
    (async () => {
      const pendingRaw = localStorage.getItem(PENDING_KEY);
      if (!pendingRaw) return;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      try {
        const pending = JSON.parse(pendingRaw) as {
          planId: string;
          promoCode?: string | null;
        };

        // Make sure plans are loaded to find the price_id
        if (!plansQ.data) return;

        const plan = plansQ.data.find((p) => p.id === pending.planId);
        if (!plan) return;

        // Free plan: no checkout needed → just go to caregiver
        if ((plan.price_cents ?? 0) <= 0) {
          localStorage.removeItem(PENDING_KEY);
          navigate("/caregiver", { replace: true });
          return;
        }

        if (!plan.price_id) {
          // Safety: paid plan must have a Stripe price_id
          console.warn("Paid plan missing price_id. Cannot start checkout.");
          return;
        }

        await startCheckout({
          userId: user.id,
          email: user.email || email,
          priceId: plan.price_id,
          coupon: pending.promoCode || undefined,
        });

        localStorage.removeItem(PENDING_KEY);
      } catch (e) {
        console.warn("Failed to resume pending checkout:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plansQ.data]); // run when plans load

  // ---- Handlers -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!selectedPlan) {
      setError("Please select a plan.");
      return;
    }
    if (!email || !password) {
      setError("Please enter your email and a password.");
      return;
    }

    setBusy(true);
    try {
      // 1) Create Auth user
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (signErr) throw signErr;

      const user = data.user;
      const session = data.session; // null if email confirmation required

      // 2) If we have a session, upsert profile now; otherwise wait until they confirm.
      if (session && user?.id) {
        const { error: upErr } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? email,
          display_name: name ?? user.user_metadata?.display_name ?? "",
          role: "caregiver",
          disabled: false,
        });
        if (upErr) throw upErr;

        // 3) Route: free plan -> caregiver; paid plan -> start checkout with promo
        if (selectedPlan.price_cents <= 0) {
          navigate("/caregiver", { replace: true });
          return;
        }

        if (!selectedPlan.price_id) {
          throw new Error(
            "Selected paid plan is missing a Stripe price. Please contact support."
          );
        }

        await startCheckout({
          userId: user.id,
          email: user.email || email,
          priceId: selectedPlan.price_id,
          coupon: promoCode || undefined,
        });
        return; // redirected to Stripe
      }

      // 4) No session → email confirmation is required in your project.
      // Save pending checkout to resume after they return signed-in.
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ planId: selectedPlan.id, promoCode })
      );
      setInfo(
        "Check your inbox to confirm your email. After you sign in, we’ll finish setting up your subscription and caregiver account."
      );
    } catch (err: any) {
      if (err?.message === "User already registered") {
        setError("That email is already registered. Try signing in instead.");
      } else {
        setError(err?.message || "Sign up failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  // ---- UI -------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-gray">
            Create your CarerView account
          </h1>
          <p className="mt-3 text-slate-gray/75">
            Choose a plan, then create your caregiver account. You can cancel any time.
          </p>
        </header>

        {/* Choose a plan */}
        <section className="mb-8 rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-gray/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-cyan-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-gray">Choose a plan</h2>
          </div>

          <div className="p-6">
            {plansQ.isLoading ? (
              <div className="text-slate-gray/70">Loading plans…</div>
            ) : plansQ.error ? (
              <div className="rounded-lg bg-peach-blush/20 border border-peach-blush p-4 text-slate-gray">
                Could not load plans. Please try again shortly.
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {plansQ.data!.map((p) => {
                    const selected = selectedPlanId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanId(p.id)}
                        className={[
                          "text-left rounded-xl border px-4 py-4 transition-all",
                          selected
                            ? "border-cyan-primary ring-2 ring-cyan-primary/30 bg-cyan-primary/5"
                            : "border-slate-gray/20 hover:bg-peach-blush/10",
                        ].join(" ")}
                        aria-pressed={selected}
                      >
                        <div className="font-semibold text-slate-gray">{p.name}</div>
                        <div className="text-slate-gray/70 mt-1">
                          {p.price_cents <= 0
                            ? `US$0 / ${p.interval}`
                            : formatPriceUSD(p.price_cents, p.interval)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Promo code */}
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-gray mb-1">
                    Have a promo code? <span className="text-slate-gray/50">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.trim())}
                    placeholder="Enter code (e.g., CarerViewFriend2025)"
                    className="w-full max-w-sm rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Create account */}
        <section className="rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-gray/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-cyan-primary" />
              </div>
              <h2 className="text-lg font-semibold text-slate-gray">Create account</h2>
            </div>

            <div className="text-sm text-slate-gray/60">
              Selected plan:{" "}
              <span className="font-medium text-slate-gray">
                {selectedPlan?.name ?? "—"}
              </span>
              {promoCode && (
                <span className="ml-3 inline-flex items-center rounded-full border border-slate-gray/20 px-2 py-0.5 text-xs text-slate-gray">
                  promo: {promoCode}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                placeholder="How should we address you?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                placeholder="Choose a secure password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-slate-gray">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-lg bg-mint-green/30 border border-mint-green p-3 text-slate-gray">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || plansQ.isLoading || !selectedPlan}
              aria-busy={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
            >
              {busy ? "Creating…" : "Create my account"}
              {!busy && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-xs text-slate-gray/60">
              By continuing you agree to the Terms. You can cancel a paid plan any time.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
