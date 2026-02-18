// src/pages/WhyCarerView.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Shield, Users, FileText, ArrowRight, CircleCheck as CheckCircle, Clock, Lock } from "lucide-react";
import ObservationPreview from "../components/ObservationPreview";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { prefetchChoosePlanAssets } from "../hooks/usePrefetchStatic";
import { Card, CardContent } from "../components/ui/Card";

export default function WhyCarerView() {
  // --- Personas --------------------------------------------------------------
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

  // --- Auth logic (same behavior you used elsewhere) ------------------------
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const kickoffPrefetch = React.useCallback(() => {
    prefetchChoosePlanAssets(queryClient);
  }, [queryClient]);

  const [isSignUp, setIsSignUp] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [suffix, setSuffix] = useState("");
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
        display_name:
          (user.user_metadata && user.user_metadata.display_name) || "",
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
      navigate(prof2?.role === "admin" ? "/admin" : "/caregiver", {
        replace: true,
      });
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
        const displayName = [prefix, firstName, familyName, suffix].filter(Boolean).join(" ");
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (signUpErr) throw signUpErr;

        const user = data.user;
        const session = data.session;

        if (session && user?.id) {
          await upsertProfileIfMissing(
            user.id,
            displayName ?? user.user_metadata?.display_name ?? "",
            user.email ?? ""
          );
          navigate("/create-account", { replace: true });
        } else {
          setInfo(
            "Check your inbox to confirm your email, then sign in to choose a plan."
          );
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
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="pt-8 pb-10 text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-gray">
              Your Observations are Vital!

            </h1>
          </div>

          <p className="text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            Changes in a loved one's abilities aren't always steady or predictable—what happens today may look different tomorrow. CarerView helps you observe these ups and downs over time, revealing the real trends that matter. With that clarity, your care team can adjust care plans more effectively and with greater confidence.
          </p>
        </div>

        {/* HOW CARERVIEW HELPS */}
        {/* WHAT YOU'LL TRACK - MOVED TO POSITION 1 */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">
              What you'll Observe
            </h3>
            <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">
              Simple living categories that reflect real daily life
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-gray mb-6 text-center">
                  Activities of Daily Living
                </h4>
                <BulletList
                  bullets={[
                    "Bathing & personal hygiene",
                    "Dressing & grooming",
                    "Eating & drinking",
                    "Toileting & continence",
                    "Mobility & transfers",
                    "Safety awareness",
                  ]}
                  dot="cyan"
                />
                <ObservationPreview
                  questionText="Bathing & personal hygiene"
                  selectedScore={4}
                  accentColor="cyan"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-gray mb-6 text-center">
                  Instrumental Activities
                </h4>
                <BulletList
                  bullets={[
                    "Medication management",
                    "Meals & groceries",
                    "Housekeeping & laundry",
                    "Finances & paperwork",
                    "Communication & memory",
                    "Transportation & errands",
                  ]}
                  dot="mint"
                />
                <ObservationPreview
                  questionText="Medication management"
                  selectedScore={4}
                  accentColor="mint"
                />
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-slate-gray/60 mt-8 italic">
            Observations are custom so CarerView fits your family's reality.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-account"
              className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
            >
              Begin Observation Now <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to={{ pathname: "/", hash: "#get-started" }}
              className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
              aria-label="Sign In"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* PERSONAS - MOVED TO POSITION 2 */}
        <section className="pb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-slate-gray">
              Built for real caregiving situations
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 items-stretch">
            {personas.map((p) => (
              <article
                key={p.title}
                className="h-full rounded-2xl border border-slate-gray/20 bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label={p.title}
              >
                <div className="p-6 h-full flex flex-col">
                  <h4 className="text-lg font-semibold text-slate-gray">{p.title}</h4>
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

        {/* HOW CARERVIEW HELPS - MOVED TO POSITION 3 */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">
              A shared language for care
            </h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">
                  Simple Observations
                </h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Spend just a few minutes noting how things went across core Activities of
                  Daily Living. Create quick check-ins or complete Observations anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-mint-green/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">
                  Easy 1–5 scale
                </h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Clear wording—no medical jargon—grounded in occupational therapy
                  best practices that families can understand.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">
                  Trends you can trust
                </h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  See changes over days - weeks - months, not just how today felt. Observed trends
                  highlight when to adjust routines or supports.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">
                  Bring everyone together
                </h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Share private Observations with family and clinicians so discussions start
                  from the same definitions and data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* GET STARTED FORM */}
        <section className="pb-24">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-bold text-slate-gray mb-4">
                Bring trend data to the conversation
              </h3>
              <p className="text-lg text-slate-gray/75 leading-relaxed">
                Start noticing together, decide together, and care together — CarerView is your shared compass.
              </p>
            </div>

            <div className="bg-warm-white rounded-3xl shadow-2xl border border-slate-gray/10 overflow-hidden">
              {/* Card header with logo */}
              <div className="bg-gradient-to-r from-cyan-primary/10 to-mint-green/15 px-8 pt-8 pb-6 flex items-center gap-5 border-b border-slate-gray/10">
                <img
                  src="/CareView_logo_1_colored_highres.png"
                  alt="CarerView Logo"
                  className="w-24 h-24 md:w-28 md:h-28 object-contain flex-shrink-0 drop-shadow-md"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Welcome to</p>
                  <p className="text-2xl font-bold text-slate-gray leading-tight">CarerView</p>
                  <p className="text-sm text-slate-gray/65 mt-1">Caring made clearer, together.</p>
                </div>
              </div>

              <div className="px-8 pb-8 pt-6">
                {/* Toggle */}
                <div className="flex justify-center mb-7">
                  <div className="flex bg-slate-gray/8 rounded-xl p-1 border border-slate-gray/10">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setError(null); setInfo(null); kickoffPrefetch(); }}
                      className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isSignUp
                          ? "bg-warm-white text-slate-gray shadow-sm"
                          : "text-slate-gray/60 hover:text-slate-gray"
                      }`}
                    >
                      Create account
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setError(null); setInfo(null); kickoffPrefetch(); }}
                      className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        !isSignUp
                          ? "bg-warm-white text-slate-gray shadow-sm"
                          : "text-slate-gray/60 hover:text-slate-gray"
                      }`}
                    >
                      Sign in
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && (
                    <fieldset>
                      <legend className="block text-sm font-semibold text-slate-gray mb-3">Your name</legend>
                      {/* Row 1: Prefix + First name */}
                      <div className="flex gap-3 mb-3">
                        <div className="w-28 flex-shrink-0">
                          <label className="block text-xs text-slate-gray/60 mb-1.5">Prefix</label>
                          <select
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-3 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                          >
                            <option value="">—</option>
                            <option>Mr.</option>
                            <option>Ms.</option>
                            <option>Mrs.</option>
                            <option>Dr.</option>
                            <option>Prof.</option>
                            <option>Mx.</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-slate-gray/60 mb-1.5">First name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-3 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                            placeholder="Given name"
                          />
                        </div>
                      </div>
                      {/* Row 2: Family name + Suffix */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-slate-gray/60 mb-1.5">Family name</label>
                          <input
                            type="text"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-3 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                            placeholder="Surname"
                          />
                        </div>
                        <div className="w-28 flex-shrink-0">
                          <label className="block text-xs text-slate-gray/60 mb-1.5">Suffix</label>
                          <select
                            value={suffix}
                            onChange={(e) => setSuffix(e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-3 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                          >
                            <option value="">—</option>
                            <option>Jr.</option>
                            <option>Sr.</option>
                            <option>II</option>
                            <option>III</option>
                            <option>MD</option>
                            <option>PhD</option>
                            <option>RN</option>
                            <option>Esq.</option>
                          </select>
                        </div>
                      </div>
                    </fieldset>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-gray mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-4 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                      placeholder="your.email@example.com"
                      onFocus={kickoffPrefetch}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-gray mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-4 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                      placeholder="Choose a secure password"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-peach-blush/30 border border-peach-blush/60 px-4 py-3">
                      <p className="text-slate-gray text-sm">{error}</p>
                    </div>
                  )}

                  {info && (
                    <div className="rounded-xl bg-mint-green/30 border border-mint-green/60 px-4 py-3">
                      <p className="text-slate-gray text-sm">{info}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    onMouseEnter={kickoffPrefetch}
                    className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-cyan-primary px-6 py-3.5 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all duration-200 mt-2"
                  >
                    {isSignUp ? "Get Started" : "Welcome back"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-5 text-center">
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
          </div>
        </section>

      </div>
    </div>
  );
}

/* ----- tiny presentational helpers to keep JSX tidy ----- */

function FeatureLine({
  tone,
  title,
  blurb,
}: {
  tone: "cyan" | "mint" | "peach" | "cyanSolid";
  title: string;
  blurb: string;
}) {
  const bg =
    tone === "cyan"
      ? "bg-cyan-primary"
      : tone === "mint"
      ? "bg-mint-green"
      : tone === "peach"
      ? "bg-peach-blush"
      : "bg-cyan-primary";
  const icon =
    tone === "cyanSolid" ? (
      <CheckCircle className="w-5 h-5 text-warm-white" />
    ) : (
      <CheckCircle className="w-5 h-5 text-slate-gray" />
    );
  const circleTone =
    tone === "cyanSolid"
      ? "bg-cyan-primary"
      : tone === "mint"
      ? "bg-mint-green"
      : tone === "peach"
      ? "bg-peach-blush"
      : "bg-cyan-primary";

  return (
    <div className="flex items-start space-x-4">
      <div
        className={`w-8 h-8 ${circleTone} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-semibold text-slate-gray mb-2">{title}</h4>
        <p className="text-slate-gray/80">{blurb}</p>
      </div>
    </div>
  );
}

function BulletList({
  bullets,
  dot,
}: {
  bullets: string[];
  dot: "cyan" | "mint";
}) {
  const dotClass = dot === "mint" ? "bg-mint-green" : "bg-cyan-primary";
  return (
    <div className="space-y-3">
      {bullets.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-3">
          <div className={`w-2 h-2 ${dotClass} rounded-full`} />
          <span className="text-slate-gray">{item}</span>
        </div>
      ))}
    </div>
  );
}

function MiniBlock({
  icon,
  title,
  blurb,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  tone?: "peach" | "mint" | "cyan";
}) {
  const bg =
    tone === "mint"
      ? "bg-mint-green/60"
      : tone === "peach"
      ? "bg-peach-blush/60"
      : "bg-cyan-primary/20";
  const iconWrap = `w-16 h-16 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`;
  return (
    <div>
      <div className={iconWrap}>{icon}</div>
      <h4 className="text-lg font-semibold text-slate-gray mb-2">{title}</h4>
      <p className="text-slate-gray/80">{blurb}</p>
    </div>
  );
}

function TrustBlock({
  icon,
  title,
  blurb,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  tone?: "peach" | "mint" | "cyan";
}) {
  const bg =
    tone === "mint"
      ? "bg-mint-green/60"
      : tone === "peach"
      ? "bg-peach-blush/60"
      : "bg-cyan-primary/20";
  return (
    <div>
      <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-slate-gray mb-2">{title}</h4>
      <p className="text-slate-gray/80">{blurb}</p>
    </div>
  );
}
