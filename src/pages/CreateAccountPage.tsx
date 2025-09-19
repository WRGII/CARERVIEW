// src/pages/CreateAccountPage.tsx
import React from "react";
import { CreditCard, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { PLANS, RETURN_URLS, type PlanKey } from "../config/stripe";

const PENDING_KEY = "cv_pending_checkout"; // { planKey, promoCode }

export default function CreateAccountPage() {
  const navigate = useNavigate();

  // ---- Local UI state -------------------------------------------------------
  const [selectedPlanKey, setSelectedPlanKey] = React.useState<PlanKey>('occasional_weekly');
  const [promoCode, setPromoCode] = React.useState<string>("");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

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
          planKey: PlanKey;
          promoCode?: string | null;
        };

        const plan = PLANS[pending.planKey];
        if (!plan) return;

        if (!plan.priceId) {
          console.warn("Plan missing priceId. Cannot start checkout.");
          return;
        }

        // Start Supabase Edge Function checkout
        const { data, error } = await supabase.functions.invoke("stripe-checkout", {
          body: {
            price_id: plan.priceId,
            promotionCode: pending.promoCode || null,
            success_url: RETURN_URLS.success,
            cancel_url: `${window.location.origin}/create-account?canceled=1`,
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
  }, []); // run once on mount

  // ---- Handlers -------------------------------------------------------------
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
      const selectedPlan = PLANS[selectedPlanKey];

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

        if (!selectedPlan.priceId) {
          throw new Error("Selected plan is missing a Stripe price. Please contact support.");
        }

        const { data: ck, error: fnErr } = await supabase.functions.invoke("stripe-checkout", {
          body: {
            price_id: selectedPlan.priceId,
            promotionCode: promoCode || null,
            success_url: RETURN_URLS.success,
            cancel_url: `${window.location.origin}/create-account?canceled=1`,
          },
        });
        if (fnErr) throw fnErr;

        const url = (ck as any)?.url;
        if (!url) throw new Error("Failed to start checkout");
        window.location.assign(url);
        return;
      }

      // 3) No session → email confirmation required. Save pending checkout.
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ planKey: selectedPlanKey, promoCode })
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
          <p className="mt-2 text-slate-gray/70">
            Already have an account?{" "}
            <Link to="/#get-started" className="text-cyan-primary underline">
              Sign in
            </Link>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(PLANS).map(([key, plan]) => {
                    const selected = selectedPlanKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedPlanKey(key as PlanKey)}
                        className={[
                          "text-left rounded-xl border px-4 py-4 transition-all",
                          selected
                            ? "border-cyan-primary ring-2 ring-cyan-primary/30 bg-cyan-primary/5"
                            : "border-slate-gray/20 hover:bg-peach-blush/10",
                        ].join(" ")}
                        aria-pressed={selected}
                      >
                        <div className="font-semibold text-slate-gray">{plan.label}</div>
                        <div className="text-slate-gray/70 mt-1">
                          ${(plan.price / 100).toFixed(2)} / week
                        </div>
                        <div className="text-xs text-slate-gray/60 mt-2">
                          {plan.blurb}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Promo code */}
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
                {PLANS[selectedPlanKey]?.label ?? "—"}
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
              disabled={busy}
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
