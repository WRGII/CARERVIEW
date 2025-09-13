// src/pages/WhyCarerView.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { prefetchChoosePlanAssets } from "../hooks/usePrefetchStatic";
import Footer from "../components/common/Footer";

export default function WhyCarerView() {
  // --- personas (Auntie persona removed) ------------------------------------
  const personas = [
    {
      title: "Long-distance family coordination",
      quote:
        "“I’m out of town. I hated feeling out of the loop. CarerView lets me check the latest observations before I call.”",
      bullets: [
        "See updates in one place—no more hunting for info.",
        "Review trends to prep for phone calls and visits.",
        "Share only what each person needs to see.",
      ],
    },
    {
      title: "Sandwich-generation caregiver",
      quote:
        "“Between my kids and Mum’s appointments, I forget details. CarerView captures patterns so I bring clear notes to the doctor.”",
      bullets: [
        "Capture incidents and routines as they happen.",
        "Create clinic-ready summaries from real-life notes.",
        "Make calmer decisions with shared context.",
      ],
    },
    {
      title: "Rotating helpers / paid caregivers",
      quote:
        "“We needed smooth hand-offs. With CarerView, every shift sees what changed and what works.”",
      bullets: [
        "Keep a living playbook of triggers and what helps.",
        "Track who did what for clear accountability.",
        "Reduce repeat questions and missed details.",
      ],
    },
    {
      title: "Hospital-to-home transitions",
      quote:
        "“Discharge instructions felt overwhelming. CarerView helped us monitor the first weeks and escalate with evidence.”",
      bullets: [
        "Log observations aligned to the care plan.",
        "Highlight concerning trends early.",
        "Share concise updates with clinicians.",
      ],
    },
  ];

  // --- auth form state/logic (exactly mirrored from LandingPage) ------------
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const kickoffPrefetch = React.useCallback(() => {
    prefetchChoosePlanAssets(queryClient);
  }, [queryClient]);

  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const upsertProfileIfMissing = async (
    uid: string,
    displayName: string,
    emailAddr: string
  ) => {
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

  const routeByRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("role, disabled, email, display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!prof) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        display_name: (user.user_metadata && user.user_metadata.display_name) || "",
        role: "caregiver",
        disabled: false,
      });
      const { data: prof2 } = await supabase
        .from("profiles")
        .select("role, disabled")
        .eq("id", user.id)
        .single();

      if (prof2?.disabled) {
        await supabase.auth.signOut();
        navigate("/", { replace: true });
        return;
      }
      navigate(prof2?.role === "admin" ? "/admin" : "/caregiver", { replace: true });
      return;
    }

    if (prof.disabled) {
      await supabase.auth.signOut();
      navigate("/", { replace: true });
      return;
    }
    navigate(prof.role === "admin" ? "/admin" : "/caregiver", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    kickoffPrefetch();

    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (signUpErr) throw signUpErr;

        const user = data.user;
        const session = data.session;

        if (session && user?.id) {
          await upsertProfileIfMissing(
            user.id,
            name ?? user.user_metadata?.display_name ?? "",
            user.email ?? ""
          );
          navigate("/choose-plan", { replace: true });
        } else {
          setInfo("Check your inbox to confirm your email, then sign in to choose a plan.");
        }
      } else {
        const { data, error: siErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (siErr) throw siErr;

        const user = data.user;
        if (user?.id) {
          await upsertProfileIfMissing(
            user.id,
            user.user_metadata?.display_name ?? "",
            user.email ?? ""
          );
        }
        await routeByRole();
      }
    } catch (err: any) {
      if (err?.message === "Invalid login credentials") {
        setError(
          "Incorrect email or password. Please check your credentials or try resetting your password."
        );
      } else {
        setError(err?.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    setSendingReset(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo("If that email exists, a reset link has been sent.");
    } catch (e: any) {
      setError(e.message || "Failed to send password reset email");
    } finally {
      setSendingReset(false);
    }
  };

  // --- UI --------------------------------------------------------------------
  return (
    <div className="bg-warm-white">
      {/* Header/Outlet are provided by MainLayout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">We feel your struggle...</h1>
          <p className="mt-3 text-slate-gray/75">
            Our family are caregivers, too. So we developed CarerView to give families and care teams a shared way to notice changes, align
            decisions, and keep everyone on the same page—in a simple format.
          </p>
        </div>
      </section>

      {/* Persona cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-6 sm:grid-cols-2 items-stretch">
          {personas.map((p) => (
            <article
              key={p.title}
              className="h-full rounded-2xl border border-slate-gray/20 bg-white shadow-sm hover:shadow-md transition-shadow"
              aria-label={p.title}
            >
              <div className="p-6 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-slate-gray">{p.title}</h2>
                <p className="mt-3 text-slate-gray/80 italic">{p.quote}</p>
                <ul className="mt-4 space-y-2 text-slate-gray/80 flex-1">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-peach-blush/70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Auth section (identical experience to LandingPage) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">Bring calm to the conversation</h3>
            <p className="text-xl text-slate-gray/80">
              Start noticing together, decide together, and care together—with CarerView as your shared
              compass.
            </p>
          </div>

          <div className="bg-warm-white p-8 rounded-2xl shadow-xl border border-slate-gray/20">
            {/* Logo in top left corner */}
            <div className="flex justify-start mb-6">
              <img
                src="/CareView_logo_1_colored_highres.png"
                alt="CarerView Logo"
                className="w-12 h-12 object-contain"
              />
            </div>

            <div className="flex justify-center mb-6">
              <div className="flex bg-slate-gray/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                    setInfo(null);
                    kickoffPrefetch();
                  }}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                    isSignUp
                      ? "bg-warm-white text-slate-gray shadow-sm"
                      : "text-slate-gray/70 hover:text-slate-gray"
                  }`}
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                    setInfo(null);
                    kickoffPrefetch();
                  }}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                    !isSignUp
                      ? "bg-warm-white text-slate-gray shadow-sm"
                      : "text-slate-gray/70 hover:text-slate-gray"
                  }`}
                >
                  Sign in
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-2">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="How should we address you?"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-2">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                  placeholder="your.email@example.com"
                  onFocus={kickoffPrefetch}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-2">Password</label>
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
                disabled={loading}
                onMouseEnter={kickoffPrefetch}
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-cyan-primary px-6 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all duration-200"
              >
                {isSignUp ? "Get Started" : "Welcome back"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="text-sm text-cyan-primary hover:underline disabled:opacity-60"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
