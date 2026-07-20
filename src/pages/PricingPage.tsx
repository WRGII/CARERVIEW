import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { PricingCard } from '../components/PricingCard';
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { supabase } from '../lib/supabaseClient';
import { getProductByPriceId } from '../stripe-config';
import Breadcrumbs from '../components/common/Breadcrumbs';

export function PricingPage() {
  const { user } = useAuth();
  const { data: userPlan, isLoading } = useUserPlan();
  const { t } = useLocale();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeSubscription = hasActivePlan(userPlan);
  const activeProduct = userPlan?.price_id ? getProductByPriceId(userPlan.price_id) : null;

  const handleSelectPlan = async (priceId: string, planId: string) => {
    if (!user) {
      setError('Please sign in to choose a plan.');
      return;
    }
    if (checkoutLoading) return;

    setCheckoutLoading(planId);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          plan_id: planId,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/pricing`,
        },
      });

      if (fnErr) throw new Error(fnErr.message || 'Failed to create checkout session');
      if (!data?.url) throw new Error('No checkout URL received');

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Unable to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  };

  return (
    <main className="min-h-screen pt-16">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Breadcrumbs items={[{ label: t('nav.pricing') }]} />
        <div className="mb-14 text-center animate-fade-in">
          <span className="inline-block rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-700 ring-1 ring-teal-200">
            Plans &amp; Pricing
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Care together. Save together.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
            Choose the plan that fits your family's needs. All plans include trend reports and PDF summaries — cancel any time.
          </p>

          {!isLoading && user && activeSubscription && activeProduct && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-5 py-2 text-sm font-medium text-teal-800 ring-1 ring-teal-200">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              You're on the <strong>{activeProduct.shortName}</strong> plan
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto animate-slide-up">
          {STRIPE_PRODUCTS.map((product) => (
            <PricingCard
              key={product.id}
              product={product}
              onSelectPlan={handleSelectPlan}
              isPopular={product.highlighted}
              isCurrentPlan={userPlan?.plan_id === product.planId}
              isCheckoutLoading={!!checkoutLoading}
            />
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-slate-400">
          Prices in USD. Billed every three months. Cancel anytime — no long-term commitment.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
          <Link to="/why" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.why_carerview')}</Link>
          <span aria-hidden="true">·</span>
          <Link to="/memory-book" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.memory_book')}</Link>
          <span aria-hidden="true">·</span>
          <Link to="/resources" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_resources')}</Link>
          <span aria-hidden="true">·</span>
          <Link to="/new-carer" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.new_carer')}</Link>
          <span aria-hidden="true">·</span>
          <Link to="/community" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_forum')}</Link>
        </div>
      </section>
    </main>
  );
}
