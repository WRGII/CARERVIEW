// src/pages/CreateAccountPage.tsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CreditCard, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Plan = {
  id: string;
  name: string;
  interval: string;      // e.g., "week"
  price_cents: number;   // e.g., 50 -> $0.50
};

function formatPrice(cents: number, interval: string) {
  const dollars = (cents ?? 0) / 100;
  return `US$${dollars}${interval ? ` / ${interval}` : ""}`;
}

export default function CreateAccountPage() {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Load plans (from public.subscription_plans)
  // ---------------------------------------------------------------------------
  const plansQ = useQuery({
    queryKey: ["subscription_plans"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("id,name,interval,price_cents")
        .order("price_cents", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  // Selected plan id (persist to localStorage so we can pick this up after confirm)
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(
    () => localStorage.getItem("cv_pref_plan") || null
  );
  React.useEffect(() => {
    if (selectedPlanId) {
      localStorage.setItem("cv_pref_plan", selectedPlanId);
    } else {
      localStorage.removeItem("cv_pref_plan");
    }
  }, [selectedPlanId]);

  // ---------------------------------------------------------------------------
  // Account form state
  // ---------------------------------------------------------------------------
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  // Helper: create/ensure profile
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

  // Submit: sign up right away (plan chosen first visually; we attach it later)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    if (!selectedPlanId) {
      setSubmitting(false);
      setError("Please choose a plan to continue.");
      return;
    }

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (signUpErr) throw signUpErr;

      const user = data.user;
      const session = data.session; // null if email confirmation is required

      // Remember plan preference for post-confirm flow (Guard/landing can read it)
      localStorage.setItem("cv_pref_plan", selectedPlanId);

      if (session && user?.id) {
        await upsertProfileIfMissing(
          user.id,
          name ?? user.user_metadata?.display_name ?? "",
          user.email ?? ""
        );
        // If you want to immediately send them to Stripe for checkout here,
        // replace the next line with your existing "start checkout" call
        // then route to /caregiver after success.
        navigate("/caregiver", { replace: true });
      } else {
        setInfo("Check your inbox to confirm your email, then sign in to finish setup.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  // Pick a default plan when plans load (if none selected yet)
  React.useEffect(() => {
    if (!plansQ.isLoading && !plansQ.error && plansQ.data && plansQ.data.length) {
      if (!selectedPlanId) setSelectedPlanId(plansQ.data[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plansQ.isLoading, plansQ.error, plansQ.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-gray">Create your CarerView account</h1>
          <p className="mt-2 text-slate-gray/75">
            Choose a plan, then create your caregiver account. You can cancel any time.
          </p>
        </header>

        {/* ONE PAGE: Plan selector + Create account form */}
        <div className="space-y-8">
          {/* Plan selection */}
          <section className="bg-white border border-slate-gray/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-cyan-primary" />
              </div>
              <h2 className="text-lg font-semibold text-slate-gray">Choose a plan</h2>
            </div>

            {plansQ.isLoading ? (
              <div className="text-slate-gray/70">Loading plans…</div>
            ) : plansQ.error ? (
              <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-4 text-slate-gray">
                {(plansQ.error as Error).message}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {plansQ.data!.map((p) => {
                  const selected = selectedPlanId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={[
                        "text-left rounded-xl border-2 px-4 py-4 transition-all",
                        selected
                          ? "border-cyan-primary bg-cyan-primary/5 shadow"
                          : "border-slate-gray/20 hover:bg-peach-blush/10",
                      ].join(" ")}
                      aria-pressed={selected}
                    >
                      <div className="font-semibold text-slate-gray">{p.name}</div>
                      <div className="text-slate-gray/70 mt-1">
                        {formatPrice(p.price_cents, p.interval)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Create account form */}
          <section className="bg-white border border-slate-gray/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-cyan-primary" />
                </div>
                <h2 className="text-lg font-semibold text-slate-gray">Create account</h2>
              </div>

              <div className="text-sm text-slate-gray/70">
                Selected plan:{" "}
                <strong className="text-slate-gray">
                  {plansQ.data?.find((p) => p.id === selectedPlanId)?.name || "—"}
                </strong>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
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
                  className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
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
                  className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                  placeholder="Choose a secure password"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-4">
                  <p className="text-slate-gray text-sm">{error}</p>
                </div>
              )}

              {info && (
                <div className="rounded-lg bg-mint-green/30 border border-mint-green p-4">
                  <p className="text-slate-gray text-sm">{info}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-3 rounded-lg bg-cyan-primary px-6 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
              >
                Create account
                {!submitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-4 text-sm text-slate-gray/70">
              Already have an account?{" "}
              <Link to="/#get-started" className="text-cyan-primary hover:underline">
                Sign in
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
