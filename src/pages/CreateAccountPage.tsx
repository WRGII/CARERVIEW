// src/pages/CreateAccountPage.tsx
import React from "react";
import { CreditCard, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { STRIPE_PRODUCTS } from "../stripe-config";
import { useLocale } from "../i18n/LocaleContext";
import PageSEO from "../components/seo/PageSEO";
import { SITE_URL } from "../lib/siteConfig";

type PlanKey = 'free' | 'primary_qtr' | 'family_qtr';

const PENDING_KEY = "cv_pending_checkout";

const RETURN_URLS = {
  success: `${window.location.origin}/checkout/success`,
  cancel: `${window.location.origin}/create-account?canceled=1`,
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

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const tok = localStorage.getItem("cv_join_token");
      if (!tok) return;
      const { data: sess } = await supabase.auth.getSession();
      if (sess?.session) {
        localStorage.removeItem("cv_join_token");
        navigate(`/join?t=${encodeURIComponent(tok)}`, { replace: true });
      }
    })();

    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      const tok = localStorage.getItem("cv_join_token");
      if (tok && session) {
        localStorage.removeItem("cv_join_token");
        navigate(`/join?t=${encodeURIComponent(tok)}`, { replace: true });
      }
    });
    return () => sub.data.subscription.unsubscribe();
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
          navigate('/caregiver', { replace: true });
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
        window.location.assign(url);
      } catch (e: any) {
        localStorage.removeItem(PENDING_KEY);
        console.warn("Failed to resume pending checkout:", e);
        setError(e?.message || t('create_account.signup_failed'));
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError(t('create_account.email_required'));
      return;
    }

    if (password.length < 8) {
      setError(t('create_account.password_too_short'));
      return;
    }

    setBusy(true);
    try {
      const selectedProduct = STRIPE_PRODUCTS.find(p => p.planId === selectedPlanKey);
      if (!selectedProduct) {
        throw new Error("Invalid plan selected");
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
          if (subErr) console.warn('Failed to create free subscription record:', subErr);
          navigate('/caregiver', { replace: true });
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
        if (fnErr) throw fnErr;

        const url = (ck as any)?.url;
        if (!url) throw new Error("Failed to start checkout");
        window.location.assign(url);
        return;
      }

      localStorage.setItem(PENDING_KEY, JSON.stringify({ planKey: selectedPlanKey, promoCode, displayName: name || null }));
      setInfo(t('create_account.confirm_email_info'));
    } catch (err: any) {
      if (err?.message === "User already registered") {
        setError(t('create_account.email_taken'));
      } else {
        setError(err?.message || t('create_account.signup_failed'));
      }
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
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
                placeholder={t('create_account.password_placeholder')}
              />
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
        </section>
      </div>
    </div>
  );
}
