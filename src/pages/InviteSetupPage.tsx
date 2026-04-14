import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLocale } from "../i18n/LocaleContext";
import { validatePassword } from "../lib/passwordValidation";
import PasswordStrengthBar from "../components/ui/PasswordStrengthBar";
import { Eye, EyeOff, Users, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react";

type Stage = "form" | "joining" | "done" | "error";

export default function InviteSetupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const [token, setToken] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const urlToken = params.get("t");
    const stored = localStorage.getItem("cv_join_token");
    const resolved = urlToken || stored || "";

    if (!resolved) {
      setStage("error");
      setErrorMsg(t("accept_invite.invalid_token"));
      return;
    }

    if (urlToken) {
      localStorage.setItem("cv_join_token", urlToken);
    }
    setToken(resolved);

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate(`/join?t=${encodeURIComponent(resolved)}`, { replace: true });
      }
    });
  }, [params, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrorMsg("");

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setErrorMsg(t("create_account.password_too_short"));
      return;
    }
    if (password !== confirm) {
      setErrorMsg(t("create_account.passwords_mismatch"));
      return;
    }

    setBusy(true);
    setStage("joining");

    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() || email.split("@")[0] } },
      });

      if (signUpErr) throw signUpErr;

      const user = signUpData.user;
      const session = signUpData.session;

      if (!user) throw new Error(t("create_account.signup_failed") || "Sign-up failed");

      if (session && user.id) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? email.trim(),
          display_name: name.trim() || email.split("@")[0],
          role: "caregiver",
          disabled: false,
        }, { onConflict: "id", ignoreDuplicates: true });

        const { data: teamId, error: acceptErr } = await supabase.rpc("cv_accept_invite", { p_token: token });
        if (acceptErr) throw acceptErr;

        await supabase.rpc("cv_set_active_team", { p_team: teamId });
        localStorage.removeItem("cv_join_token");
        setStage("done");
        setTimeout(() => navigate("/caregiver", { replace: true }), 1500);
      } else {
        localStorage.removeItem("cv_join_token");
        setStage("error");
        setErrorMsg(t("create_account.email_confirm_required") || "Please confirm your email then sign in.");
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      localStorage.removeItem("cv_join_token");
      setStage("error");
      setErrorMsg(msg || t("accept_invite.failed"));
    } finally {
      setBusy(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">You're in!</h2>
          <p className="text-slate-500 text-sm">Taking you to your dashboard&hellip;</p>
        </div>
      </div>
    );
  }

  if (stage === "joining") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Joining your care team&hellip;</p>
        </div>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("accept_invite.error_title")}</h2>
          <p className="text-slate-500 text-sm mb-6">{errorMsg || t("accept_invite.failed")}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {t("common.go_home")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-600 text-white mb-5 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Join your care team</h1>
          <p className="text-slate-500 text-sm mt-2">
            Create your CarerView account to accept the invitation and start collaborating.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("create_account.name_label") || "Your name"}
              </label>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("create_account.name_placeholder") || "Full name"}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("create_account.email_label") || "Email address"}
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("create_account.password_label") || "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("create_account.password_placeholder") || "Min. 8 characters"}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={password} tFn={t} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("create_account.confirm_password_label") || "Confirm password"}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("create_account.confirm_password_placeholder") || "Re-enter password"}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !email.trim() || !password}
              className="w-full py-3 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {busy ? "Creating account\u2026" : "Create account and join"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to={token ? `/join?t=${encodeURIComponent(token)}` : "/"}
              className="text-cyan-600 hover:underline font-medium"
            >
              Sign in instead
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400">
          By creating an account you agree to our{" "}
          <Link to="/privacy-policy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
