// src/pages/CreateAccountPage.tsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { ArrowRight, CheckCircle, CreditCard, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Types
type Plan = {
  id: string;
  name: string;
  interval: "week" | "month" | "year";
  price_cents: number;
};

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);

  // --- Step 1: load plans (from app schema) -------------------------------
  const plansQ = useQuery({
    queryKey: ["ca", "plans"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .schema("app") // 👈 IMPORTANT: your plans live in the app schema
        .from("subscription_plans")
        .select("id, name, interval, price_cents")
        .order("price_cents", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  // --- Step 2: sign up (public.auth + public.profiles upsert) -------------
  const signUpM = useMutation({
    mutationFn: async (payload: {
      planId: string;
      name: string;
      email: string;
      password: string;
    }) => {
      // 1) Auth sign-up
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: { data: { display_name: payload.name } },
      });
      if (error) throw error;

      const user = data.user;

      // Email confirmation ON → no session yet
      if (!data.session || !user?.id) {
        return { needsEmailConfirm: true as const };
      }

      // 2) Upsert profile in public.profiles (role caregiver, enabled)
      const { error: upErr } = await supabase.from("profiles").upsert({
        id: user.id,
        email: payload.email,
        display_name: payload.name,
        role: "caregiver",
        disabled: false,
      });
      if (upErr) throw upErr;

      // 3) (optional) start checkout now if your flow allows immediate session
      // For email-confirm projects we’ll do checkout after confirmation on first login.
      return { needsEmailConfirm: false as const };
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">
            Create your CarerView account
          </h1>
          <p className="mt-2 text-slate-gray/70">
            Choose a plan, then create your caregiver account. You can cancel
            any time.
          </p>
        </header>

        <ol className="flex items-center gap-6 mb-8">
          <li className={`flex-1 h-1 rounded ${step >= 1 ? "bg-cyan-primary" : "bg-slate-200"}`} />
          <li className={`flex-1 h-1 rounded ${step >= 2 ? "bg-cyan-primary" : "bg-slate-200"}`} />
        </ol>

        {step === 1 && (
          <section className="rounded-2xl bg-white border border-slate-gray/20 shadow-sm">
            <div className="p-6 border-b border-slate-gray/10">
              <h2 className="text-lg font-semibold text-slate-gray flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Choose a plan
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {plansQ.isLoading && (
                <div className="text-slate-gray/70">Loading plans…</div>
              )}
              {plansQ.error && (
                <div className="text-red-600">
                  {(plansQ.error as Error).message}
                </div>
              )}
              {plansQ.data?.length === 0 && !plansQ.isLoading && (
                <div className="text-slate-gray/70">
                  No plans are configured yet.{" "}
                  <Link to="/" className="underline text-cyan-primary">
                    Back to home
                  </Link>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {plansQ.data?.map((plan) => {
                  const checked = selectedPlan?.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      className={`text-left rounded-xl border p-4 transition ${
                        checked
                          ? "border-cyan-primary bg-cyan-primary/10"
                          : "border-slate-gray/20 hover:bg-peach-blush/10"
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-gray">
                          {plan.name}
                        </h3>
                        {checked && (
                          <CheckCircle className="w-5 h-5 text-cyan-primary" />
                        )}
                      </div>
                      <p className="mt-2 text-slate-gray/80">
                        {(plan.price_cents / 100).toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                        })}{" "}
                        / {plan.interval}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={!selectedPlan}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 font-semibold text-warm-white hover:bg-cyan-hover disabled:opacity-60"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <AccountForm
            selectedPlan={selectedPlan}
            onBack={() => setStep(1)}
            onSubmit={async (values) => {
              if (!selectedPlan) return;
              const resp = await signUpM.mutateAsync({
                planId: selectedPlan.id,
                ...values,
              });
              if (resp.needsEmailConfirm) {
                navigate("/?signup=check-email", { replace: true });
                return;
              }
              // If session exists immediately (rare w/ email confirm on), go to caregiver
              navigate("/caregiver", { replace: true });
            }}
            busy={signUpM.isPending}
            error={signUpM.error as Error | null}
          />
        )}
      </div>
    </div>
  );
}

function AccountForm({
  selectedPlan,
  onBack,
  onSubmit,
  busy,
  error,
}: {
  selectedPlan: Plan | null;
  onBack: () => void;
  onSubmit: (v: { name: string; email: string; password: string }) => void;
  busy: boolean;
  error: Error | null;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <section className="rounded-2xl bg-white border border-slate-gray/20 shadow-sm">
      <div className="p-6 border-b border-slate-gray/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-gray flex items-center gap-2">
          <User className="w-5 h-5" />
          Create account
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border-2 border-slate-gray/30 px-3 py-1.5 text-sm text-slate-gray hover:bg-peach-blush/20"
        >
          Back
        </button>
      </div>

      <div className="p-6">
        {selectedPlan && (
          <div className="mb-4 text-slate-gray/80 text-sm">
            Selected plan: <strong>{selectedPlan.name}</strong>{" "}
            {(selectedPlan.price_cents / 100).toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            })}{" "}
            / {selectedPlan.interval}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name, email, password });
          }}
          className="space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-sm font-medium text-slate-gray mb-1">
              Your name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
              placeholder="How should we address you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-gray mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-gray mb-1">
              Password
            </label>
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
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 font-semibold text-warm-white hover:bg-cyan-hover disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create account"}
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-3 text-xs text-slate-gray/60">
            We’ll ask you to confirm your email before activating your
            subscription.
          </p>
        </form>
      </div>
    </section>
  );
}
