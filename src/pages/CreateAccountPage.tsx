// src/pages/CreateAccountPage.tsx
import React from "react";
import { CreditCard, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { STRIPE_PRODUCTS } from "../stripe-config";
import { usePlans } from "../hooks/usePlans";
import type { PlanRow } from "../types/plans";

type PlanKey = 'free' | 'primary_qtr' | 'family_qtr';

const PENDING_KEY = "cv_pending_checkout";

const RETURN_URLS = {
  success: `${window.location.origin}/checkout/success`,
  cancel: `${window.location.origin}/create-account?canceled=1`,
};

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const { data: dbPlans, isLoading: plansLoading } = usePlans();

  const [selectedPlanKey, setSelectedPlanKey] = React.useState<PlanKey>("primary_qtr");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam === 'free') setSelectedPlanKey('free');
    else if (planParam === 'primary') setSelectedPlanKey('primary_qtr');
    else if (planParam === 'family') setSelectedPlanKey('family_qtr');
  }, []);
  const [promoCode, setPromoCode] = React.useState<string>("");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const tok = localStorage.getItem("cv_join_token");
      if (!tok) return;
      const { data: sess } = await supabase.auth.getSession();
      if (sess?.session) {
        localStorage.removeItem("cv_join_token");
        navigate(`/join?t=${encodeURIComponent(tok)}`, { replace: true });
      }
    })();

    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      const tok = localStorage.getItem("cv_join_token");
      if (tok && session) {
        localStorage.removeItem("cv_join_token");
        navigate(`/join?t=${encodeURIComponent(tok)}`, { replace: true });
      }
    });
    return () => sub.data.subscription.unsubscribe();
  }, [navigate]);

  React.useEffect(() => {
    (async () => {
      const pendingRaw = localStorage.getItem(PENDING_KEY);
      if (!pendingRaw) return;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      try {
        const pending = JSON.parse(pendingRaw) as {
          planKey: PlanKey;
          promoCode?: string | null;
        };

        const product = STRIPE_PRODUCTS.find(p => p.planId === pending.planKey);
        if (!product) return;

        if (pending.planKey === 'free') {
          // Create free plan subscription before navigating
          try {
            const now = new Date();
            const oneYearFromNow = new Date(now);
            oneYearFromNow.setFullYear(now.getFullYear() + 1);

            await supabase
              .from('user_subscriptions')
              .insert({
                user_id: user.id,
                subscription_id: `free_${user.id}_${Date.now()}`,
                plan_id: 'free',
                status: 'active',
                current_period_start: now.toISOString(),
                current_period_end: oneYearFromNow.toISOString(),
                cancel_at_period_end: false,
              });
          } catch (freeErr) {
            console.error('Failed to create free subscription:', freeErr);
            // Continue anyway - user can activate later
          }
          localStorage.removeItem(PENDING_KEY);
          navigate('/caregiver', { replace: true });
          return;
        }

        if (!product.priceId) {
          console.warn("Plan missing priceId. Cannot start checkout.");
          return;
        }

        const { data, error } = await supabase.functions.invoke("stripe-checkout", {
          body: {
            price_id: product.priceId,
            plan_id: pending.planKey,
            promotionCode: pending.promoCode || null,
            success_url: RETURN_URLS.success,
            cancel_url: RETURN_URLS.cancel,
          },
        });
        if (error) throw error;
        const url = (data as any)?.url;
        if (!url) throw new Error("No checkout URL returned");
        localStorage.removeItem(PENDING_KEY);
        window.location.assign(url);
      } catch (e) {
        console.warn("Failed to resume pending checkout:", e);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Please enter your email and a password.");
      return;
    }

    setBusy(true);
    try {
      const selectedProduct = STRIPE_PRODUCTS.find(p => p.planId === selectedPlanKey);
      if (!selectedProduct) {
        throw new Error("Invalid plan selected");
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (signErr) throw signErr;

      const user = data.user;
      const session = data.session;

      if (session && user?.id) {
        const { error: upErr } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? email,
          display_name: name ?? user.user_metadata?.display_name ?? "",
          role: "caregiver",
          disabled: false,
        });
        if (upErr) throw upErr;

        if (selectedPlanKey === 'free') {
          const { error: subErr } = await supabase.from('user_subscriptions').upsert({
            user_id: user.id,
            subscription_id: `free_${user.id}`,
            plan_id: 'free',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
          }, { onConflict: 'user_id,subscription_id' });
          if (subErr) console.warn('Failed to create free subscription record:', subErr);
          navigate('/caregiver', { replace: true });
          return;
        }

        if (!selectedProduct.priceId) {
          throw new Error("Selected plan is missing a Stripe price. Please contact support.");
        }

        const { data: ck, error: fnErr } = await supabase.functions.invoke("stripe-checkout", {
          body: {
            price_id: selectedProduct.priceId,
            plan_id: selectedPlanKey,
            promotionCode: promoCode || null,
            success_url: RETURN_URLS.success,
            cancel_url: RETURN_URLS.cancel,
          },
        });
        if (fnErr) throw fnErr;

        const url = (ck as any)?.url;
        if (!url) throw new Error("Failed to start checkout");
        window.location.assign(url);
        return;
      }

      localStorage.setItem(PENDING_KEY, JSON.stringify({ planKey: selectedPlanKey, promoCode }));
      setInfo(
        "Check your inbox to confirm your email. After you sign in, we'll finish setting up your subscription and caregiver account."
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

  const selectedProduct = STRIPE_PRODUCTS.find(p => p.planId === selectedPlanKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-gray">Create your CarerView account</h1>
          <p className="mt-3 text-slate-gray/75">Choose a plan, then create your caregiver account. You can cancel any time.</p>
          <p className="mt-2 text-slate-gray/70">
            Already have an account?{" "}
            <Link to="/#get-started" className="text-cyan-primary underline">
              Sign in
            </Link>
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-gray/10 flex items-center gap-3">
            <div className="W-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-cyan-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-gray">Choose a plan</h2>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {STRIPE_PRODUCTS.map((product) => {
                const selected = selectedPlanKey === product.planId;
                return (
                  <button
                    key={product.planId}
                    type="button"
                    onClick={() => setSelectedPlanKey(product.planId as PlanKey)}
                    className={[
                      "text-left rounded-xl border px-4 py-4 transition-all",
                      selected
                        ? "border-cyan-primary ring-2 ring-cyan-primary/30 bg-cyan-primary/5"
                        : "border-slate-gray/20 hover:bg-peach-blush/10",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    <div className="font-semibold text-slate-gray">
                      {product.name}
                      {product.planId === 'primary_qtr' && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-cyan-600 px-2 py-0.5 text-xs font-semibold text-white">Recommended</span>
                      )}
                    </div>
                    <div className="text-slate-gray/70 mt-1">
                      {product.planId === 'free' ? 'Always free' : `$${product.price.toFixed(2)} per quarter`}
                    </div>
                    <div className="text-xs text-slate-gray/60 mt-2">
                      {product.planId === 'free' ? '3 observations per year' :
                       product.planId === 'primary_qtr' ? '30 observations per year' :
                       'Up to 3 caregivers, 100 observations per year'}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPlanKey !== 'free' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-gray mb-1">
                  Have a promo code? <span className="text-slate-gray/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.trim())}
                  placeholder="Enter code"
                  className="w-full max-w-sm rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                />
              </div>
            )}
          </div>
        </section>

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
                {selectedProduct?.name ?? "—"}
              </span>
              {promoCode && selectedPlanKey !== 'free' && (
                <span className="ml-3 inline-flex items-center rounded-full border border-slate-gray/20 px-2 py-0.5 text-xs text-slate-gray">
                  promo: {promoCode}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                placeholder="How should we address you?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">Email address</label>
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
              <label className="block text-sm font-medium text-slate-gray mb-1">Password</label>
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
              <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-slate-gray">{error}</div>
            )}
            {info && (
              <div className="rounded-lg bg-mint-green/30 border border-mint-green p-3 text-slate-gray">{info}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
            >
              {busy ? "Creating…" : "Create my account"}
              {!busy && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-xs text-slate-gray/60">
              By continuing you agree to our{" "}
              <Link to="/privacy-policy" className="text-cyan-primary hover:text-cyan-hover underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/data-policy" className="text-cyan-primary hover:text-cyan-hover underline">
                Data Policy
              </Link>. You can cancel a paid plan any time.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
