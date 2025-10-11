import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PricingCard } from '../components/PricingCard';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';

export function ChoosePlan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
  }, [user, navigate, searchParams]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {STRIPE_PRODUCTS.map((product, index) => (
            <PricingCard
              key={product.id}
              product={product}
              onSelectPlan={handleSelectPlan}
              isPopular={index === 1} // Family Circle Plan is popular
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing? Contact our support team.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}