import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchChoosePlanAssets } from "../../hooks/usePrefetchStatic";

interface AuthFormProps {
  initialMode?: "signin" | "signup";
  showToggle?: boolean;
}

export default function AuthForm({ initialMode = "signin", showToggle = true }: AuthFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const kickoffPrefetch = React.useCallback(() => {
    prefetchChoosePlanAssets(queryClient);
  }, [queryClient]);

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
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

  const routeByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/", { replace: true }); return; }

    const { data: prof } = await supabase
      .from("profiles")
      .select("role, disabled, email, display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!prof) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || "",
        role: "caregiver",
        disabled: false,
      });
      const { data: prof2 } = await supabase
        .from("profiles")
        .select("role, disabled")
        .eq("id", user.id)
        .single();
      if (prof2?.disabled) { await supabase.auth.signOut(); navigate("/", { replace: true }); return; }
      navigate(prof2?.role === "admin" ? "/admin" : "/caregiver", { replace: true });
      return;
    }

    if (prof.disabled) { await supabase.auth.signOut(); navigate("/", { replace: true }); return; }
    navigate(prof.role === "admin" ? "/admin" : "/caregiver", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
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
          await upsertProfileIfMissing(user.id, displayName ?? user.user_metadata?.display_name ?? "", user.email ?? "");
          navigate("/create-account", { replace: true });
        } else {
          setInfo("Check your inbox to confirm your email, then sign in to choose a plan.");
        }
      } else {
        const { data, error: siErr } = await supabase.auth.signInWithPassword({ email, password });
        if (siErr) throw siErr;
        if (!data?.user) throw new Error("Sign-in failed. Please try again.");
        await upsertProfileIfMissing(data.user.id, data.user.user_metadata?.display_name ?? "", data.user.email ?? "");
        await routeByRole();
      }
    } catch (err: any) {
      setError(
        err?.message === "Invalid login credentials"
          ? "Incorrect email or password. Please check your credentials or try resetting your password."
          : err?.message || "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) { setError("Enter your email above first."); return; }
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

  return (
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
        {showToggle && (
          <div className="flex justify-center mb-7">
            <div className="flex bg-slate-gray/[0.08] rounded-xl p-1 border border-slate-gray/10">
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(null); setInfo(null); kickoffPrefetch(); }}
                className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isSignUp ? "bg-warm-white text-slate-gray shadow-sm" : "text-slate-gray/60 hover:text-slate-gray"
                }`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(null); setInfo(null); kickoffPrefetch(); }}
                className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  !isSignUp ? "bg-warm-white text-slate-gray shadow-sm" : "text-slate-gray/60 hover:text-slate-gray"
                }`}
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <fieldset>
              <legend className="block text-sm font-semibold text-slate-gray mb-3">Your name</legend>
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
            <label className="block text-sm font-semibold text-slate-gray mb-1.5">Email address</label>
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
            <label className="block text-sm font-semibold text-slate-gray mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-4 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
              placeholder={isSignUp ? "Choose a secure password" : "Your password"}
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
            {loading ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Get Started" : "Welcome back")}
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
  );
}
