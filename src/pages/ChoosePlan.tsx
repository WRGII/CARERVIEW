import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan';
import { PricingCard } from '../components/PricingCard';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { CircleCheck as CheckCircle, Circle as XCircle, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import DeleteAccount from '../components/caregiver/DeleteAccount';

export default function ChoosePlan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);

  const isManageMode = searchParams.get('manage') === 'true';
  const activeSubscription = hasActivePlan(userPlan);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setStatusMessage({
        type: 'success',
        message: 'Payment successful! Your subscription is now active.'
      });
    } else if (status === 'cancel') {
      setStatusMessage({
        type: 'error',
        message: 'Payment was cancelled. You can try again anytime.'
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
        message: 'Failed to open billing portal. Please try again.'
      });
      setManagingBilling(false);
    }
  };

  const handleSelectPlan = async (priceId: string, planId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          plan_id: planId,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/choose-plan?status=cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to start checkout process. Please try again.'
      });
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isManageMode ? 'Manage Your Subscription' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the plan that best fits your caregiving needs. All plans include comprehensive observation tracking and detailed reports.
          </p>
        </div>

        {statusMessage && (
          <div className={`max-w-md mx-auto mb-8 p-4 rounded-lg flex items-center space-x-3 ${
            statusMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{statusMessage.message}</span>
          </div>
        )}

        {activeSubscription && userPlan && (
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-gray-900">
                      {userPlan.plan_id === 'free' ? 'Free Observer' :
                       userPlan.plan_id === 'primary_qtr' ? 'Primary Caregiver' :
                       userPlan.plan_id === 'family_qtr' ? 'Family Circle' :
                       userPlan.plan_id || 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {userPlan.status === 'active' ? 'Active' : userPlan.status}
                    </span>
                  </div>
                  {userPlan.current_period_end && (
                    <div className="text-gray-600">
                      Renews on: {new Date(userPlan.current_period_end).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="ml-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {managingBilling ? 'Opening...' : 'Manage Billing'}
              </button>
            </div>
          </div>
        )}

        {!activeSubscription && userPlan && (
          <div className="max-w-2xl mx-auto mb-8 bg-amber-50 rounded-lg border border-amber-200 p-6">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">No Active Subscription</h3>
                <p className="text-sm text-amber-800">
                  {userPlan.status === 'canceled'
                    ? 'Your subscription has been canceled. Select a plan below to reactivate.'
                    : userPlan.status === 'past_due'
                    ? 'Your subscription payment is past due. Please update your billing information.'
                    : 'Select a plan below to get started with CareView.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {STRIPE_PRODUCTS.map((product, index) => {
            const isCurrentPlan = userPlan?.plan_id === product.planId;
            const isRecommended = product.planId === 'primary_qtr';
            return (
              <PricingCard
                key={product.id}
                product={product}
                onSelectPlan={handleSelectPlan}
                isPopular={isRecommended}
                isCurrentPlan={isCurrentPlan}
              />
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing? Contact our support team.
          </p>
          <button
            onClick={() => navigate('/caregiver')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {isManageMode && <DeleteAccount />}
      </div>
    </div>
  );
}