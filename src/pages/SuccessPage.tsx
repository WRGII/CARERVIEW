import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck as CheckCircle, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function SuccessPage() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription(user);
  const [attempts, setAttempts] = useState(0);

  // Poll briefly for subscription to propagate via webhook
  useEffect(() => {
    if (!subscription && attempts < 5) {
      const t = setTimeout(() => setAttempts((n) => n + 1), 1500);
      return () => clearTimeout(t);
    }
  }, [subscription, attempts]);

  const product = subscription?.price_id
    ? getProductByPriceId(subscription.price_id)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-teal-600" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">You're all set!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your subscription is now active. Welcome to CarerView — we're glad you're here.
        </p>

        {loading || (!subscription && attempts < 5) ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex items-center justify-center gap-3 text-gray-500 text-sm">
            <LoadingSpinner size="sm" />
            Activating your plan…
          </div>
        ) : product ? (
          <div className="bg-white rounded-2xl border border-teal-200 p-6 mb-8 text-left">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Active plan</p>
            <p className="text-lg font-semibold text-gray-900">{product.shortName}</p>
            <p className="text-sm text-gray-500 mt-1">
              {product.currencySymbol}{product.price.toFixed(2)} {product.billingPeriod}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to dashboard
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Back to home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}