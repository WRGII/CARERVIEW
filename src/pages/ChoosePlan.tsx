import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { useFormatDate } from '../hooks/useFormatDate';
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan';
import { PricingCard } from '../components/PricingCard';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { CircleCheck as CheckCircle, Circle as XCircle, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import DeleteAccount from '../components/caregiver/DeleteAccount';
import { useActivateFreePlan } from '../hooks/useFreePlan';

export default function ChoosePlan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const { data: userPlan, isLoading: planLoading, refetch: refetchPlan } = useUserPlan();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const activateFreePlanMutation = useActivateFreePlan();

  const { formatDate } = useFormatDate();
  const isManageMode = searchParams.get('manage') === 'true';
  const activeSubscription = hasActivePlan(userPlan);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setStatusMessage({
        type: 'success',
        message: t('caregiver.payment_success')
      });
    } else if (status === 'cancel') {
      setStatusMessage({
        type: 'error',
        message: t('choose_plan.cancelled')
      });
    }
  }, [searchParams]);

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', { body: {} });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error('No portal URL returned');
      window.location.assign(url);
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      setStatusMessage({
        type: 'error',
        message: t('billing.portal_failed')
      });
      setManagingBilling(false);
    }
  };

  const handleSelectPlan = async (priceId: string, planId: string) => {
    if (!user) {
      setStatusMessage({ type: 'error', message: t('choose_plan.auth_required') });
      return;
    }
    if (checkoutLoading) return;

    setCheckoutLoading(planId);
    setStatusMessage(null);

    // Handle free plan separately
    if (planId === 'free') {
      try {
        await activateFreePlanMutation.mutateAsync();

        if (typeof (window as any).plausible === 'function') {
          (window as any).plausible('Plan Selected', { props: { plan: 'free' } });
        }
        setStatusMessage({ type: 'success', message: t('choose_plan.free_activated') });

        await refetchPlan();
        setTimeout(() => navigate('/caregiver'), 1000);
      } catch (error: any) {
        console.error('Error activating free plan:', error);
        setStatusMessage({
          type: 'error',
          message: error.message || t('choose_plan.activate_failed')
        });
      } finally {
        setCheckoutLoading(null);
      }
      return;
    }

    // Handle paid plans via Stripe
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          plan_id: planId,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/choose-plan?status=cancel`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      if (typeof (window as any).plausible === 'function') {
        (window as any).plausible('Plan Selected', { props: { plan: planId } });
      }
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setStatusMessage({
        type: 'error',
        message: t('choose_plan.checkout_failed')
      });
      setCheckoutLoading(null);
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-gray/70">{t('choose_plan.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-gray mb-4">
            {isManageMode ? t('choose_plan.manage_title') : t('choose_plan.title')}
          </h1>
          <p className="text-xl text-slate-gray/70 max-w-3xl mx-auto">
            {t('choose_plan.subtitle')}
          </p>
        </div>

        {statusMessage && (
          <div className={`max-w-md mx-auto mb-8 p-4 rounded-xl flex items-center space-x-3 ${
            statusMessage.type === 'success'
              ? 'bg-mint-green/20 text-slate-gray border border-mint-green'
              : 'bg-peach-blush/30 text-slate-gray border border-peach-blush'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
            <span>{statusMessage.message}</span>
          </div>
        )}

        {activeSubscription && userPlan && (
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-2xl border border-slate-gray/20 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-slate-gray">{t('choose_plan.current_sub')}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-gray/60">{t('choose_plan.plan_label')}</span>
                    <span className="font-medium text-slate-gray">
                      {userPlan.plan_id === 'free' ? t('pricing.plan_free_name') :
                       userPlan.plan_id === 'primary_qtr' ? t('pricing.plan_primary_name') :
                       userPlan.plan_id === 'family_qtr' ? t('pricing.plan_family_name') :
                       userPlan.plan_id || 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-teal-700">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      {userPlan.status === 'active' ? t('common.active') : userPlan.status}
                    </span>
                  </div>
                  {userPlan.current_period_end && (
                    <div className="text-slate-gray/60">
                      {t('choose_plan.renews_on')} {formatDate(userPlan.current_period_end)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="ml-4 px-4 py-2 bg-slate-gray text-warm-white rounded-xl hover:bg-slate-gray/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {managingBilling ? t('common.opening') : t('billing.manage_btn')}
              </button>
            </div>
          </div>
        )}

        {!activeSubscription && userPlan && (
          <div className="max-w-2xl mx-auto mb-8 bg-peach-blush/20 rounded-2xl border border-peach-blush p-6">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-gray mb-1">{t('choose_plan.no_sub_title')}</h3>
                <p className="text-sm text-slate-gray/70">
                  {userPlan.status === 'canceled'
                    ? t('choose_plan.sub_cancelled')
                    : userPlan.status === 'past_due'
                    ? t('choose_plan.sub_past_due')
                    : t('choose_plan.sub_default')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {STRIPE_PRODUCTS.map((product) => {
            const isCurrentPlan = userPlan?.plan_id === product.planId;
            const isRecommended = product.planId === 'primary_qtr';
            return (
              <PricingCard
                key={product.id}
                product={product}
                onSelectPlan={handleSelectPlan}
                isPopular={isRecommended}
                isCurrentPlan={isCurrentPlan}
                isCheckoutLoading={!!checkoutLoading}
              />
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-gray/60 mb-4">
            {t('choose_plan.need_help')}
          </p>
          <button
            onClick={() => navigate('/caregiver')}
            className="text-cyan-primary hover:text-cyan-hover font-medium transition-colors"
          >
            {t('common.back_dashboard')}
          </button>
        </div>

        {isManageMode && <DeleteAccount />}
      </div>
    </div>
  );
}