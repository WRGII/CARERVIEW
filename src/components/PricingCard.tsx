import { Check, Loader as Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { UserSubscription } from '../types';

interface PricingCardProps {
  product: StripeProduct;
  subscription: UserSubscription | null;
  onSelect: (product: StripeProduct) => void;
  loading: boolean;
  selectedPriceId: string | null;
}

const ACTIVE_STATUSES = ['active', 'trialing'];

export function PricingCard({
  product,
  subscription,
  onSelect,
  loading,
  selectedPriceId,
}: PricingCardProps) {
  const isCurrentPlan =
    subscription?.price_id === product.priceId &&
    ACTIVE_STATUSES.includes(subscription?.subscription_status ?? '');

  const isThisLoading = loading && selectedPriceId === product.priceId;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-8 transition-all duration-200 ${
        product.isPopular
          ? 'border-teal-500 bg-white shadow-xl shadow-teal-100 scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {product.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold tracking-wide uppercase">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm font-medium text-teal-600 mb-1">{product.shortName}</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.tagline}</h3>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-4xl font-bold text-gray-900">
            {product.currencySymbol}{product.price.toFixed(2)}
          </span>
          <span className="text-gray-500 text-sm">{product.billingPeriod}</span>
        </div>
        <p className="text-sm text-teal-600 font-medium mt-1">{product.monthlyEquivalent}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {product.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-teal-600" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div className="w-full py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium text-center">
          ✓ Your current plan
        </div>
      ) : (
        <button
          onClick={() => onSelect(product)}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
            product.isPopular
              ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60'
              : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60'
          }`}
        >
          {isThisLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            'Subscribe now'
          )}
        </button>
      )}
    </div>
  );
}