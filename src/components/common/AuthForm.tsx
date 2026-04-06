import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Loader as Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchChoosePlanAssets } from "../../hooks/usePrefetchStatic";
import { useLocale } from '../../i18n/LocaleContext';
import { SITE_URL } from '../../lib/siteConfig';

interface AuthFormProps {
  initialMode?: "signin" | "signup";
  showToggle?: boolean;
}

export default function AuthForm({ initialMode = "signin", showToggle = true }: AuthFormProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const kickoffPrefetch = React.useCallback(() => {
    prefetchChoosePlanAssets(queryClient);
  }, [queryClient]);

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError(null);
    setInfo(null);
    kickoffPrefetch();
  };

  const upsertProfile = async (uid: string, displayName: string, emailAddr: string) => {
    const { data: prof, error: selErr } = await supabase
      .from("profiles")
      .select("id, disabled, role")
      .eq("id", uid)
      .maybeSingle();
    if (selErr) throw selErr;

    if (prof?.disabled) {
      await supabase.auth.signOut();
      throw new Error(t('common.account_disabled'));
    }

    if (!prof) {
      const { error: upErr } = await supabase.from("profiles").upsert({
        id: uid,
        email: emailAddr,
        display_name: displayName,
        role: "caregiver",
        disabled: false,
      });
      if (upErr) throw upErr;
      return { role: "caregiver" as const };
    }

    return prof;
  };

  const handleSignIn = async () => {
    const { data, error: siErr } = await supabase.auth.signInWithPassword({ email, password });
    if (siErr) {
      throw new Error(t('auth.invalid_credentials'));
    }
    if (!data?.user) throw new Error(t('auth.invalid_credentials'));

    const prof = await upsertProfile(
      data.user.id,
      data.user.user_metadata?.display_name ?? "",
      data.user.email ?? ""
    );

    if (prof.role === "admin") {
      await supabase.auth.signOut();
      throw new Error("Admin accounts must sign in via the admin portal.");
    }
    navigate("/caregiver", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (isSignUp) {
      navigate("/create-account");
      return;
    }

    if (password.length < 8) {
      setError(t('auth.password_too_short'));
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      await handleSignIn();
    } catch (err: any) {
      setError(err?.message || t('auth.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError(t('auth.email_first'));
      return;
    }
    setSendingReset(true);
    setError(null);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${SITE_URL}/auth/callback?type=recovery`,
      });
      setInfo(t('auth.reset_sent'));
    } catch {
      setInfo(t('auth.reset_sent'));
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="bg-warm-white rounded-3xl shadow-2xl border border-slate-gray/10 overflow-hidden">
      {/* Card header */}
      <div className="bg-gradient-to-r from-cyan-primary/10 to-mint-green/15 px-8 pt-8 pb-6 flex items-center gap-5 border-b border-slate-gray/10">
        <img
          src="/CareView_logo_1_colored_highres.png"
          alt={t('nav.logo_aria')}
          className="w-24 h-24 md:w-28 md:h-28 object-contain flex-shrink-0 drop-shadow-md"
        />
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{t('auth.welcome_to')}</p>
          <p className="text-2xl font-bold text-slate-gray leading-tight">{t('common.app_name')}</p>
          <p className="text-sm text-slate-gray/65 mt-1">{t('auth.tagline')}</p>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">
        {/* Toggle */}
        {showToggle && (
          <div className="flex justify-center mb-7">
            <div className="flex bg-slate-gray/[0.08] rounded-xl p-1 border border-slate-gray/10">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isSignUp ? "bg-warm-white text-slate-gray shadow-sm" : "text-slate-gray/60 hover:text-slate-gray"
                }`}
              >
                {t('auth.create_account_tab')}
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  !isSignUp ? "bg-warm-white text-slate-gray shadow-sm" : "text-slate-gray/60 hover:text-slate-gray"
                }`}
              >
                {t('auth.sign_in_tab')}
              </button>
            </div>
          </div>
        )}

        {isSignUp ? (
          <div className="space-y-5">
            <p className="text-slate-gray/75 text-sm leading-relaxed">
              {t('auth.signup_body')}
            </p>
            <Link
              to="/create-account"
              onMouseEnter={kickoffPrefetch}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-cyan-primary px-6 py-3.5 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200"
            >
              {t('auth.get_started')} <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-xs text-slate-gray/55">
              {t('auth.free_note')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-gray mb-1.5">
                {t('auth.email_label')}
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={kickoffPrefetch}
                className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-4 py-2.5 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                placeholder={t('auth.email_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-gray mb-1.5">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-gray/25 bg-warm-white text-slate-gray px-4 py-2.5 pr-11 text-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary"
                  placeholder={t('auth.password_placeholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-gray/50 hover:text-slate-gray transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-peach-blush/30 border border-peach-blush/60 px-4 py-3">
                <p className="text-slate-gray text-sm">{error}</p>
              </div>
            )}

            {info && (
              <div role="status" className="rounded-xl bg-mint-green/30 border border-mint-green/60 px-4 py-3">
                <p className="text-slate-gray text-sm">{info}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={kickoffPrefetch}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-cyan-primary px-6 py-3.5 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all duration-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth.signing_in')}
                </>
              ) : (
                <>
                  {t('nav.sign_in')} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="text-sm text-cyan-primary hover:underline disabled:opacity-60"
              >
                {sendingReset ? t('auth.sending_reset') : t('auth.forgot_password')}
              </button>
              <Link
                to="/create-account"
                onMouseEnter={kickoffPrefetch}
                className="text-sm text-cyan-primary hover:underline"
              >
                {t('auth.create_account_link')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
