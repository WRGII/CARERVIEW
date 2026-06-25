import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, CreditCard, Calendar, CircleAlert as AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId, STRIPE_PRODUCTS } from '../stripe-config';
import { LoadingSpinner } from '../components/LoadingSpinner';

const ACTIVE_STATUSES = ['active', 'trialing'];

function formatDate(unix: number | null) {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const product = subscription?.price_id
    ? getProductByPriceId(subscription.price_id)
    : null;

  const isActive = ACTIVE_STATUSES.includes(subscription?.subscription_status ?? '');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Subscription card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Subscription</h2>
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          {isActive && product ? (
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-teal-600" fill="currentColor" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.shortName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{product.tagline}</p>
                  <p className="text-sm font-medium text-teal-600 mt-1">
                    {product.currencySymbol}{product.price.toFixed(2)} {product.billingPeriod}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Current period</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {formatDate(subscription?.current_period_start ?? null)}
                    </p>
                    <p className="text-xs text-gray-400">→ {formatDate(subscription?.current_period_end ?? null)}</p>
                  </div>
                </div>

                {subscription?.payment_method_brand && (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Payment method</p>
                      <p className="text-sm font-medium text-gray-700 mt-0.5 capitalize">
                        {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {subscription?.cancel_at_period_end && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Your subscription will cancel at the end of the current period.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-5">You don't have an active subscription yet.</p>
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                View plans
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Upgrade / other plans */}
        {isActive && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Other plans</h2>
            <div className="space-y-3">
              {STRIPE_PRODUCTS.filter((p) => p.priceId !== subscription?.price_id).map((p) => (
                <div
                  key={p.priceId}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.shortName}</p>
                    <p className="text-xs text-gray-400">{p.currencySymbol}{p.price.toFixed(2)} {p.billingPeriod}</p>
                  </div>
                  <Link
                    to="/#pricing"
                    className="text-xs font-medium text-teal-600 hover:underline"
                  >
                    Switch plan
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}