import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLocale } from "../i18n/LocaleContext";
import { validatePassword } from "../lib/passwordValidation";
import PasswordStrengthBar from "../components/ui/PasswordStrengthBar";
import { Eye, EyeOff, Users, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react";

type Stage = "loading" | "form" | "joining" | "done" | "error";
type Mode = "signup" | "signin";
type ErrorKind = "expired" | "generic";

type PeekResult = {
  invalid?: boolean;
  email?: string;
  expires_at?: string;
  consumed?: boolean;
  expired?: boolean;
  team_id?: string;
};

export default function InviteSetupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const [token, setToken] = useState("");
  const [stage, setStage] = useState<Stage>("loading");
  const [mode, setMode] = useState<Mode>("signup");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("generic");
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

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

    (async () => {
      const { data: sessData } = await supabase.auth.getSession();
      if (sessData.session) {
        navigate(`/join?t=${encodeURIComponent(resolved)}`, { replace: true });
        return;
      }

      const { data: peek, error: peekErr } = await supabase.rpc("cv_peek_invite", { p_token: resolved });
      if (peekErr) {
        setStage("form");
        return;
      }

      const result = peek as PeekResult | null;
      if (!result || result.invalid) {
        setStage("error");
        setErrorMsg(t("accept_invite.invalid_token"));
        return;
      }
      if (result.consumed) {
        setStage("error");
        setErrorMsg(t("accept_invite.error_consumed_body") || "This invite has already been used.");
        return;
      }
      if (result.expired) {
        setStage("error");
        setErrorMsg(t("accept_invite.error_expired_body") || "This invite has expired.");
        return;
      }
      if (result.email) {
        setInvitedEmail(result.email);
        setEmail(result.email);

        // Determine which form to show based on whether an account already exists.
        // Falls back to signup if the check itself fails (e.g. network error).
        try {
          const { data: exists } = await supabase.rpc("cv_email_registered", { p_email: result.email });
          setMode(exists === true ? "signin" : "signup");
        } catch {
          setMode("signup");
        }
      }

      setStage("form");
    })();
  }, [params, navigate, t]);

  async function finalizeJoin(): Promise<void> {
    const { data: teamId, error: acceptErr } = await supabase.rpc("cv_accept_invite", { p_token: token });
    if (acceptErr) throw acceptErr;
    if (teamId) {
      await supabase.rpc("cv_set_active_team", { p_team: teamId });
    }
    localStorage.removeItem("cv_join_token");
    setStage("done");
    setTimeout(() => navigate("/caregiver", { replace: true }), 1200);
  }

  async function handleSignup(e: React.FormEvent) {
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
      const signupEmail = email.trim();
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: signupEmail,
        password,
        options: { data: { display_name: name.trim() || signupEmail.split("@")[0] } },
      });

      if (signUpErr) throw signUpErr;

      const user = signUpData.user;
      const session = signUpData.session;

      if (!user) throw new Error(t("create_account.signup_failed") || "Sign-up failed");

      // Supabase returns session:null + identities:[] when the email already
      // exists (security-by-design — no explicit error is thrown). Switch the
      // user to the sign-in tab instead of showing a confusing "check inbox" message.
      if (!session && Array.isArray((user as any).identities) && (user as any).identities.length === 0) {
        setStage("form");
        setMode("signin");
        setPassword("");
        setConfirm("");
        setErrorMsg("It looks like you already have a CarerView account. Please sign in instead.");
        return;
      }

      if (session && user.id) {
        await finalizeJoin();
      } else {
        setStage("error");
        setErrorMsg(t("create_account.email_confirm_required") || "Check your inbox to confirm your email. You'll be brought back here to finish joining the Family Circle.");
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const kind: ErrorKind = msg.toLowerCase().includes("expir") ? "expired" : "generic";
      setErrorKind(kind);
      setStage("error");
      setErrorMsg(msg || t("accept_invite.failed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrorMsg("");

    setBusy(true);
    setStage("joining");

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) throw signInErr;

      await finalizeJoin();
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const kind: ErrorKind = msg.toLowerCase().includes("expir") ? "expired" : "generic";
      setErrorKind(kind);
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

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Checking your invitation&hellip;</p>
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
    const lower = errorMsg?.toLowerCase() || "";
    const isExpired = errorKind === "expired" || lower.includes("expir");
    const isTokenError = !token || isExpired || lower.includes("invalid") || lower.includes("used");

    const errorTitle = isExpired
      ? "Invite link has expired"
      : t("accept_invite.error_title");
    const errorBody = isExpired
      ? "This invite link is no longer valid. Please ask the team owner to send you a fresh invitation."
      : (errorMsg || t("accept_invite.failed"));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{errorTitle}</h2>
          <p className="text-slate-500 text-sm mb-6">{errorBody}</p>
          <div className="flex items-center justify-center gap-3">
            {!isTokenError && (
              <button
                onClick={() => { setStage("form"); setErrorMsg(""); setErrorKind("generic"); }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
              >
                Try again
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {t("common.go_home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-600 text-white mb-5 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Join your care team</h1>
          <p className="text-slate-500 text-sm mt-2">
            {isSignup
              ? "Create your CarerView account to accept the invitation and start collaborating."
              : "Sign in to accept the invitation and join the Family Circle."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className={`flex items-center gap-3 mb-6 px-3 py-2.5 rounded-xl text-sm ${isSignup ? "bg-emerald-50 border border-emerald-200" : "bg-cyan-50 border border-cyan-200"}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSignup ? "bg-emerald-500" : "bg-cyan-500"}`} />
            <p className={`font-medium ${isSignup ? "text-emerald-800" : "text-cyan-800"}`}>
              {isSignup
                ? "No existing account found — create a new one below."
                : "An existing CarerView account was found for this email."}
            </p>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleSignin} className="space-y-5" noValidate>

            {isSignup && (
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
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("create_account.email_label") || "Email address"}
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                readOnly={!!invitedEmail}
                onChange={(e) => !invitedEmail && setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition ${
                  invitedEmail ? "border-slate-200 bg-slate-50 text-slate-600 cursor-default" : "border-slate-300"
                }`}
              />
              {invitedEmail && (
                <p className="mt-1.5 text-xs text-slate-500">
                  This invite is addressed to <span className="font-medium text-slate-700">{invitedEmail}</span>.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("create_account.password_label") || "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? (t("create_account.password_placeholder") || "Min. 8 characters") : "Your password"}
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
              {isSignup && <PasswordStrengthBar password={password} tFn={t} />}
            </div>

            {isSignup && (
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
            )}

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !email.trim() || !password}
              className="w-full py-3 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {busy
                ? (isSignup ? "Creating account\u2026" : "Signing in\u2026")
                : (isSignup ? "Create account and join" : "Log in and join")}
            </button>

            {!isSignup && (
              <p className="text-center text-xs text-slate-500">
                Not your account?{" "}
                <a href="mailto:support@carerview.com" className="underline hover:text-slate-700">
                  Contact support
                </a>
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          By continuing you agree to our{" "}
          <Link to="/privacy-policy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
