// src/pages/CreateAccountPage.tsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { ArrowRight, CheckCircle, CreditCard } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price_cents?: number | null;
  interval?: "month" | "year" | string | null;
  stripe_price_id?: string | null;
  stripe_price?: string | null; // in case your table uses this name
  sort_order?: number | null;
};

const PENDING_PLAN_KEY = "cv_pending_plan";

function formatPrice(cents?: number | null, interval?: string | null) {
  if (!cents && cents !== 0) return "—";
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}/${interval ?? "month"}`;
}

/** Try app.subscription_plans first; fallback to public.subscription_plans */
async function fetchPlans(): Promise<Plan[]> {
  // 1) app.subscription_plans (if you created plans here)
  try {
    const { data, error } = await supabase
      .schema("app")
      .from("subscription_plans")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) return data as Plan[];
  } catch {
    // ignore and fallback
  }

  // 2) public.subscription_plans (if you placed plans in public)
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Plan[];
}

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);

  // Sign-up fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  // Load plans
  const plansQ = useQuery({
    queryKey: ["create-account", "plans"],
    queryFn: fetchPlans,
    staleTime: 60_000,
  });

  // If user somehow landed here after choosing a plan earlier, preselect it
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_PLAN_KEY);
      if (raw && plansQ.data && plansQ.data.length > 0) {
        const pending = JSON.parse(raw) as Partial<Plan>;
        const match =
          plansQ.data.find(
            (p) =>
              p.id === pending.id ||
              p.stripe_price_id === pending.stripe_price_id ||
              p.stripe_price === pending.stripe_price
          ) || null;
        if (match) {
          setSelectedPlan(match);
          setStep(2); // jump to step 2 if plan already chosen
        }
      }
    } catch {
      // ignore
    }
  }, [plansQ.data]);

  const canContinueStep1 = !!selectedPlan && !plansQ.isLoading && !plansQ.error;

  const handleContinueToStep2 = () => {
    if (!selectedPlan) return;
    // Save chosen plan so CaregiverGuard can auto-checkout after confirmation
    localStorage.setItem(
      PENDING_PLAN_KEY,
      JSON.stringify({
        id: selectedPlan.id,
        stripe_price_id: selectedPlan.stripe_price_id,
        stripe_price: selectedPlan.stripe_price,
        name: selectedPlan.name,
      })
    );
    setStep(2);
    // Optional: scroll to top for the next step
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const upsertProfileIfMissing = async (uid: string, displayName: string, emailAddr: string) => {
    const { data: prof, error: selErr } = await supabase
      .from("profiles")
      .select("id, disabled, role")
      .eq("id", uid)
      .maybeSingle();
    if (selErr) throw selErr;

    if (!prof) {
      const { error: upErr } = await supabase.from("profiles").upsert({
        id: uid,
        email: emailAddr ?? "",
        display_name: displayName ?? "",
        role: "caregiver",
        disabled: false,
      });
      if (upErr) throw upErr;
    } else if (prof.disabled) {
      await supabase.auth.signOut();
      throw new Error("Account disabled. Please contact support.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError("Please choose a plan first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      // Ensure the pending plan is in localStorage (safety)
      localStorage.setItem(
        PENDING_PLAN_KEY,
        JSON.stringify({
          id: selectedPlan.id,
          stripe_price_id: selectedPlan.stripe_price_id,
          stripe_price: selectedPlan.stripe_price,
          name: selectedPlan.name,
        })
      );

      // 1) Create the auth user (email confirmation likely ON)
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (signUpErr) throw signUpErr;

      const user = data.user;
      const session = data.session; // If email confirmation is OFF, session is present

      if (user?.id) {
        await upsertProfileIfMissing(
          user.id,
          name ?? user.user_metadata?.display_name ?? "",
          user.email ?? ""
        );
      }

      if (session) {
        // Email confirmation OFF: user is already signed in → go to caregiver
        // CaregiverGuard will detect missing sub and use the pending plan to start checkout
        navigate("/caregiver", { replace: true });
      } else {
        // Email confirmation ON
        setInfo(
          "Check your email to confirm your address. After confirming and signing in, we’ll start your plan checkout automatically."
        );
      }
    } catch (err: any) {
      setError(err?.message || "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-gray mb-2">Create your CarerView account</h1>
          <p className="text-slate-gray/75">
            Choose a plan, then create your caregiver account. You can cancel any time.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`h-2 rounded-full transition-all ${step === 1 ? "bg-cyan-primary w-24" : "bg-cyan-primary/30 w-16"}`} />
          <div className={`h-2 rounded-full transition-all ${step === 2 ? "bg-cyan-primary w-24" : "bg-cyan-primary/30 w-16"}`} />
        </div>

        {/* STEP 1: Choose plan */}
        {step === 1 && (
          <section aria-label="Choose plan" className="space-y-6">
            <div className="bg-warm-white p-6 rounded-2xl shadow-xl border border-slate-gray/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-cyan-primary/15 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-cyan-primary" />
                </div>
                <h2 className="text-xl font-semibold text-slate-gray">Choose a plan</h2>
              </div>

              {plansQ.isLoading && <div className="text-slate-gray/70">Loading plans…</div>}
              {plansQ.error && (
                <div className="text-red-700">
                  {(plansQ.error as Error).message || "Failed to load plans"}
                </div>
              )}

              {!plansQ.isLoading && !plansQ.error && (
                <ul className="grid md:grid-cols-2 gap-4">
                  {plansQ.data?.map((plan) => {
                    const price =
                      formatPrice(plan.price_cents, plan.interval) ||
                      (plan.name?.toLowerCase().includes("free") ? "Free" : "—");
                    const selected = selectedPlan?.id === plan.id;
                    return (
                      <li key={plan.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedPlan(plan)}
                          className={`w-full text-left rounded-2xl border px-5 py-4 transition shadow-sm ${
                            selected
                              ? "border-cyan-primary bg-cyan-primary/10"
                              : "border-slate-gray/20 bg-white hover:bg-peach-blush/10"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-lg font-semibold text-slate-gray">{plan.name}</div>
                              {plan.description && (
                                <div className="text-sm text-slate-gray/70 mt-1">{plan.description}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-slate-gray">{price}</div>
                              {selected && (
                                <div className="mt-1 inline-flex items-center gap-1 text-cyan-primary text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  Selected
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Link
                  to="/"
                  className="text-sm text-slate-gray/70 hover:text-slate-gray underline"
                >
                  Back to home
                </Link>

                <button
                  type="button"
                  onClick={handleContinueToStep2}
                  disabled={!canContinueStep1}
                  className="inline-flex items-center gap-3 rounded-lg bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: Create account */}
        {step === 2 && (
          <section aria-label="Create account" className="space-y-6">
            <div className="bg-warm-white p-6 rounded-2xl shadow-xl border border-slate-gray/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-cyan-primary/15 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-cyan-primary" />
                </div>
                <h2 className="text-xl font-semibold text-slate-gray">Create account</h2>
              </div>

              {selectedPlan && (
                <div className="mb-4 text-sm text-slate-gray/70">
                  Selected plan: <span className="font-medium text-slate-gray">{selectedPlan.name}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Your name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="How should we address you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="Choose a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-sm text-slate-gray">
                    {error}
                  </div>
                )}
                {info && (
                  <div className="rounded-lg bg-mint-green/30 border border-mint-green p-3 text-sm text-slate-gray">
                    {info}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-slate-gray/70 hover:text-slate-gray underline"
                  >
                    Back to choose plan
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    aria-busy={submitting}
                    className="inline-flex items-center justify-center gap-3 rounded-lg bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition"
                  >
                    Create account
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-sm text-slate-gray/70">
                  Already have an account?{" "}
                  <Link to="/#get-started" className="text-cyan-primary underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
