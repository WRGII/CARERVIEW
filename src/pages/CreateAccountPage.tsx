// src/pages/CreateAccountPage.tsx
import React from "react";
import { CreditCard, UserPlus, ArrowRight, Eye, EyeOff, CircleCheck as CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { STRIPE_PRODUCTS } from "../stripe-config";
import { trackGoogleAdsConversion, trackGoogleAdsEvent } from "../lib/analytics";
import { useLocale } from "../i18n/LocaleContext";
import PageSEO from "../components/seo/PageSEO";
import { SITE_URL } from "../lib/siteConfig";
import { validatePassword } from "../lib/passwordValidation";
import PasswordStrengthBar from "../components/ui/PasswordStrengthBar";
import type { User } from "@supabase/supabase-js";

type PlanKey = 'free' | 'primary_qtr' | 'family_qtr';

const PENDING_KEY = "cv_pending_checkout";

const RETURN_URLS = {
  success: `${SITE_URL}/checkout/success`,
  cancel: `${SITE_URL}/create-account?canceled=1`,
};

function upsertFreeSubscription(userId: string) {
  const now = new Date();
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(now.getFullYear() + 1);
  return supabase.from('user_subscriptions').upsert({
    user_id: userId,
    subscription_id: `free_${userId}`,
    plan_id: 'free',
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: oneYearFromNow.toISOString(),
    cancel_at_period_end: false,
  }, { onConflict: 'user_id,subscription_id' });
}

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  const [selectedPlanKey, setSelectedPlanKey] = React.useState<PlanKey>("primary_qtr");

  const isCommunitySource = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('source') === 'community';
  }, []);

  const isIncompletePath = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('incomplete') === '1';
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam === 'free') setSelectedPlanKey('free');
    else if (planParam === 'primary') setSelectedPlanKey('primary_qtr');
    else if (planParam === 'family') setSelectedPlanKey('family_qtr');
    else if (params.get('source') === 'community') setSelectedPlanKey('free');
  }, []);
  const [promoCode, setPromoCode] = React.useState<string>("");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [pendingPlanName, setPendingPlanName] = React.useState<string | null>(null);

  const [authedUser, setAuthedUser] = React.useState<User | null>(null);
  const [authedUserLoading, setAuthedUserLoading] = React.useState(true);

  React.useEffect(() => {
    // Handle initial session — populate form fields and check for pending join token.
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setAuthedUser(u);
      if (u) {
        setName(u.user_metadata?.display_name ?? "");
        setEmail(u.email ?? "");
        const tok = localStorage.getItem("cv_join_token");
        if (tok) {
          localStorage.removeItem("cv_join_token");
          navigate(`/join?t=${encodeURIComponent(tok)}`, { replace: true });
        }
      }
      setAuthedUserLoading(false);
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setAuthedUser(u);
      if (u) {
        setName((prev) => prev || u.user_metadata?.display_name || "");
        setEmail((prev) => prev || u.email || "");
        const tok = localStorage.getItem("cv_join_token");
        if (tok) {
          localStorage.removeItem("cv_join_token");
          navigate(`/join?t=${encodeURIComponent(tok)}`, { replace: true });
        }
      }
      setAuthedUserLoading(false);
    });
    return () => authSub.subscription.unsubscribe();
  }, [navigate]);

  React.useEffect(() => {
    (async () => {
      const pendingRaw = localStorage.getItem(PENDING_KEY);
      if (!pendingRaw) return;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      let pending: { planKey: PlanKey; promoCode?: string | null; displayName?: string | null } | null = null;
      try {
        pending = JSON.parse(pendingRaw);
      } catch {
        localStorage.removeItem(PENDING_KEY);
        return;
      }
      if (!pending) return;

      const product = STRIPE_PRODUCTS.find(p => p.planId === pending!.planKey);
      if (!product) {
        localStorage.removeItem(PENDING_KEY);
        return;
      }

      setPendingPlanName(product.name);

      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? null,
          display_name: pending.displayName ?? user.user_metadata?.display_name ?? "",
          role: "caregiver",
          disabled: false,
        }, { onConflict: 'id' });

        if (pending.planKey === 'free') {
          const { error: subErr } = await upsertFreeSubscription(user.id);
          if (subErr) throw subErr;
          localStorage.removeItem(PENDING_KEY);
          const joinToken = localStorage.getItem("cv_join_token");
          if (joinToken) {
            localStorage.removeItem("cv_join_token");
            navigate(`/join?t=${encodeURIComponent(joinToken)}`, { replace: true });
          } else {
            navigate('/caregiver', { replace: true });
          }
          return;
        }

        if (!product.priceId) {
          localStorage.removeItem(PENDING_KEY);
          setError(t('create_account.plan_missing_price'));
          return;
        }

        const { data, error } = await supabase.functions.invoke("stripe-checkout", {
          body: {
            price_id: product.priceId,
            plan_id: pending.planKey,
            promotionCode: pending.promoCode || null,
            success_url: RETURN_URLS.success,
            cancel_url: RETURN_URLS.cancel,
          },
        });
        if (error) throw error;
        const url = (data as any)?.url;
        if (!url) throw new Error("No checkout URL returned");
        localStorage.removeItem(PENDING_KEY);
        setPendingPlanName(null);
        window.location.assign(url);
      } catch (e: any) {
        const msg: string = e?.message ?? '';
        const isPermanent = msg.includes('Invalid plan') || msg.includes('plan_missing_price') || msg.includes('Missing price');
        if (isPermanent) {
          localStorage.removeItem(PENDING_KEY);
          setPendingPlanName(null);
        }
        setError(msg || t('create_account.signup_failed'));
      }
    })();
  }, []);

  const handleAuthedCheckout = async () => {
    if (!authedUser) return;
    setError(null);
    setBusy(true);
    try {
      const selectedProduct = STRIPE_PRODUCTS.find(p => p.planId === selectedPlanKey);
      if (!selectedProduct) throw new Error("Invalid plan selected");

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session) {
        setError("Your session has expired. Please sign in again.");
        setBusy(false);
        return;
      }

      await supabase.from("profiles").upsert({
        id: authedUser.id,
        email: authedUser.email ?? null,
        display_name: authedUser.user_metadata?.display_name ?? "",
        role: "caregiver",
        disabled: false,
      }, { onConflict: 'id' });

      if (selectedPlanKey === 'free') {
        const { error: subErr } = await upsertFreeSubscription(authedUser.id);
        if (subErr) throw subErr;
        const joinToken = localStorage.getItem("cv_join_token");
        if (joinToken) {
          localStorage.removeItem("cv_join_token");
          navigate(`/join?t=${encodeURIComponent(joinToken)}`, { replace: true });
        } else {
          navigate('/caregiver', { replace: true });
        }
        return;
      }

      if (!selectedProduct.priceId) {
        throw new Error("Selected plan is missing a Stripe price. Please contact support.");
      }

      const { data: ck, error: fnErr } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          price_id: selectedProduct.priceId,
          plan_id: selectedPlanKey,
          promotionCode: promoCode || null,
          success_url: RETURN_URLS.success,
          cancel_url: RETURN_URLS.cancel,
        },
      });

      if (fnErr) {
        if (fnErr.name === 'FunctionsHttpError' && fnErr.context) {
          try {
            const body = await fnErr.context.json();
            const msg = body?.error ?? fnErr.message;
            throw new Error(msg);
          } catch (jsonErr: any) {
            if (jsonErr?.message && jsonErr.message !== fnErr.message) throw jsonErr;
          }
        }
        throw fnErr;
      }

      const url = (ck as any)?.url;
      if (!url) throw new Error("Failed to start checkout");
      window.location.assign(url);
    } catch (err: any) {
      setError(err?.message || t('create_account.signup_failed'));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (authedUser) {
      await handleAuthedCheckout();
      return;
    }

    if (!email || !password) {
      setError(t('create_account.email_required'));
      return;
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      setError(t('create_account.password_too_short'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('create_account.passwords_mismatch'));
      return;
    }

    setBusy(true);
    try {
      const selectedProduct = STRIPE_PRODUCTS.find(p => p.planId === selectedPlanKey);
      if (!selectedProduct) {
        throw new Error("Invalid plan selected");
      }

      // Check if this email already has an account before attempting signUp.
      // cv_email_registered is callable by the anon role via security definer.
      try {
        const { data: alreadyRegistered } = await supabase.rpc('cv_email_registered', { p_email: email });
        if (alreadyRegistered === true) {
          setError(null);
          setInfo(t('create_account.already_registered_info') || 'It looks like you already have a CarerView account. Please sign in instead.');
          setBusy(false);
          return;
        }
      } catch {
        // RPC failure is non-fatal — proceed and let signUp handle it
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (signErr) throw signErr;

      const user = data.user;
      const session = data.session;

      if (session && user?.id) {
        if (typeof (window as any).plausible === 'function') {
          (window as any).plausible('Signup', { props: { plan: selectedPlanKey } });
        }
        trackGoogleAdsConversion('signup');
        trackGoogleAdsEvent('sign_up', { plan: selectedPlanKey });
        const { error: upErr } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? email,
          display_name: name ?? user.user_metadata?.display_name ?? "",
          role: "caregiver",
          disabled: false,
        });
        if (upErr) throw upErr;

        if (selectedPlanKey === 'free') {
          const { error: subErr } = await upsertFreeSubscription(user.id);
          if (subErr) throw subErr;
          const joinToken = localStorage.getItem("cv_join_token");
          if (joinToken) {
            localStorage.removeItem("cv_join_token");
            navigate(`/join?t=${encodeURIComponent(joinToken)}`, { replace: true });
          } else {
            navigate('/caregiver', { replace: true });
          }
          return;
        }

        if (!selectedProduct.priceId) {
          throw new Error("Selected plan is missing a Stripe price. Please contact support.");
        }

        const { data: ck, error: fnErr } = await supabase.functions.invoke("stripe-checkout", {
          body: {
            price_id: selectedProduct.priceId,
            plan_id: selectedPlanKey,
            promotionCode: promoCode || null,
            success_url: RETURN_URLS.success,
            cancel_url: RETURN_URLS.cancel,
          },
        });
        if (fnErr) {
          if (fnErr.name === 'FunctionsHttpError' && fnErr.context) {
            try {
              const body = await fnErr.context.json();
              const msg = body?.error ?? fnErr.message;
              throw new Error(msg);
            } catch (jsonErr: any) {
              if (jsonErr?.message && jsonErr.message !== fnErr.message) throw jsonErr;
            }
          }
          throw fnErr;
        }

        const url = (ck as any)?.url;
        if (!url) throw new Error("Failed to start checkout");
        window.location.assign(url);
        return;
      }

      localStorage.setItem(PENDING_KEY, JSON.stringify({ planKey: selectedPlanKey, promoCode, displayName: name || null }));
      setInfo(t('create_account.confirm_email_info'));
    } catch (err: any) {
      setError((err as any)?.message || t('create_account.signup_failed'));
    } finally {
      setBusy(false);
    }
  };

  const selectedProduct = STRIPE_PRODUCTS.find(p => p.planId === selectedPlanKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="Create Account - CarerView"
        description="Sign up for CarerView to start tracking daily care observations, monitor changes over time, and coordinate with your family care team."
        canonical={`${SITE_URL}/create-account`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pendingPlanName && (
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
            <svg className="animate-spin w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div>
              <p className="text-blue-800 text-sm font-medium">Resuming your {pendingPlanName} checkout&hellip;</p>
              <p className="text-blue-700 text-xs mt-0.5">You will be redirected to the payment page in a moment.</p>
            </div>
          </div>
        )}
        {isIncompletePath && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
            {t('create_account.incomplete_setup_notice')}
          </div>
        )}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-gray">{t('create_account.title')}</h1>
          <p className="mt-3 text-slate-gray/75">{t('create_account.subtitle')}</p>
          <p className="mt-2 text-slate-gray/70">
            {t('create_account.already_have')}{" "}
            <Link to="/#get-started" className="text-cyan-primary underline">
              {t('nav.sign_in')}
            </Link>
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-gray/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-cyan-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-gray">{t('create_account.choose_plan')}</h2>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {STRIPE_PRODUCTS.map((product) => {
                const selected = selectedPlanKey === product.planId;
                const isCommunityHighlighted = isCommunitySource && product.planId === 'free';
                const isDefaultRecommended = !isCommunitySource && product.planId === 'primary_qtr';
                return (
                  <button
                    key={product.planId}
                    type="button"
                    onClick={() => setSelectedPlanKey(product.planId as PlanKey)}
                    className={[
                      "relative text-left rounded-xl border px-4 py-4 transition-all",
                      selected && isCommunityHighlighted
                        ? "border-teal-500 ring-2 ring-teal-400/40 bg-teal-50/60"
                        : selected
                        ? "border-cyan-primary ring-2 ring-cyan-primary/30 bg-cyan-primary/5"
                        : isCommunityHighlighted
                        ? "border-teal-300 bg-teal-50/30 hover:bg-teal-50/60"
                        : "border-slate-gray/20 hover:bg-peach-blush/10",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    {isCommunityHighlighted && (
                      <span className="absolute -top-2.5 left-3 inline-flex items-center rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                        {t('pricing.recommended')}
                      </span>
                    )}
                    <div className="font-semibold text-slate-gray">
                      {product.name}
                      {isDefaultRecommended && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-cyan-600 px-2 py-0.5 text-xs font-semibold text-white">{t('pricing.recommended')}</span>
                      )}
                    </div>
                    <div className="text-slate-gray/70 mt-1">
                      {product.planId === 'free' ? t('create_account.always_free') : `$${product.price.toFixed(2)} ${t('create_account.per_quarter')}`}
                    </div>
                    <div className="text-xs text-slate-gray/60 mt-2">
                      {product.planId === 'free' ? t('create_account.obs_free') :
                       product.planId === 'primary_qtr' ? t('create_account.obs_primary') :
                       t('create_account.obs_family')}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPlanKey !== 'free' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-gray mb-1">
                  {t('create_account.promo_label')} <span className="text-slate-gray/50">{t('common.optional')}</span>
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.trim())}
                  placeholder={t('create_account.promo_placeholder')}
                  className="w-full max-w-sm rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-gray/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-cyan-primary" />
              </div>
              <h2 className="text-lg font-semibold text-slate-gray">{t('create_account.section_title')}</h2>
            </div>

            <div className="text-sm text-slate-gray/60">
              {t('create_account.selected_plan')}{" "}
              <span className="font-medium text-slate-gray">
                {selectedProduct?.name ?? "—"}
              </span>
              {promoCode && selectedPlanKey !== 'free' && (
                <span className="ml-3 inline-flex items-center rounded-full border border-slate-gray/20 px-2 py-0.5 text-xs text-slate-gray">
                  {t('create_account.promo_prefix')} {promoCode}
                </span>
              )}
            </div>
          </div>

          {authedUserLoading ? (
            <div className="p-6 flex items-center gap-3 text-slate-gray/50">
              <svg className="animate-spin w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading account details&hellip;</span>
            </div>
          ) : authedUser ? (
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-cyan-primary/5 border border-cyan-primary/20 p-4">
                <CheckCircle className="w-5 h-5 text-cyan-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-gray">
                    Signed in as{" "}
                    <span className="font-semibold">
                      {authedUser.user_metadata?.display_name
                        ? `${authedUser.user_metadata.display_name} (${authedUser.email})`
                        : authedUser.email}
                    </span>
                  </p>
                  <p className="text-xs text-slate-gray/60 mt-1">
                    Your account is ready. Choose a plan above and continue to complete your setup.
                  </p>
                </div>
              </div>

              {selectedPlanKey !== 'free' && (
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">
                    {t('create_account.promo_label')} <span className="text-slate-gray/50">{t('common.optional')}</span>
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.trim())}
                    placeholder={t('create_account.promo_placeholder')}
                    className="w-full max-w-sm rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-slate-gray">{error}</div>
              )}

              <button
                type="button"
                disabled={busy}
                aria-busy={busy}
                onClick={handleAuthedCheckout}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
              >
                {busy ? "Processing\u2026" : selectedPlanKey === 'free' ? "Get Started Free" : "Continue to Checkout"}
                {!busy && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">{t('create_account.name_label')}</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                  placeholder={t('create_account.name_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">{t('auth.email_label')}</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                  placeholder={t('auth.email_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">{t('auth.password_label')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary px-4 py-2 pr-11 text-base bg-warm-white text-slate-gray"
                    placeholder={t('create_account.password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-gray/50 hover:text-slate-gray transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthBar password={password} tFn={t} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">{t('create_account.confirm_password_label')}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary px-4 py-2 pr-11 text-base bg-warm-white text-slate-gray"
                    placeholder={t('create_account.confirm_password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-gray/50 hover:text-slate-gray transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{t('create_account.passwords_mismatch')}</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-slate-gray">{error}</div>
              )}
              {info && (
                <div className="rounded-lg bg-mint-green/30 border border-mint-green p-3 text-slate-gray">{info}</div>
              )}

              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
              >
                {busy ? t('common.creating') : t('create_account.submit_btn')}
                {!busy && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-xs text-slate-gray/60">
                {t('create_account.agree_prefix')}{" "}
                <Link to="/privacy-policy" className="text-cyan-primary hover:text-cyan-hover underline">
                  {t('footer.privacy_policy')}
                </Link>{" "}
                {t('common.and')}{" "}
                <Link to="/data-policy" className="text-cyan-primary hover:text-cyan-hover underline">
                  {t('footer.data_policy')}
                </Link>{t('create_account.cancel_note')}
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
