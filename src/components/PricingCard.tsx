import { useState } from 'react';
import { Check, Loader as Loader2 } from 'lucide-react';
import { StripeProduct, formatPrice } from '../stripe-config';
import { useLocale } from '../i18n/LocaleContext';

interface PricingCardProps {
  product: StripeProduct;
  onSelectPlan: (priceId: string, planId: string) => Promise<void>;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  isCheckoutLoading?: boolean;
}

export function PricingCard({ product, onSelectPlan, isPopular = false, isCurrentPlan = false, isCheckoutLoading = false }: PricingCardProps) {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    if (isCheckoutLoading) return;
    setIsLoading(true);
    try {
      await onSelectPlan(product.priceId, product.planId);
    } catch {
      // error is surfaced by the parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
      isCurrentPlan ? 'border-teal-500 md:scale-105' :
      isPopular ? 'border-cyan-primary md:scale-105' : 'border-slate-gray/20'
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
            {t('pricing.current_plan_btn')}
          </span>
        </div>
      )}
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-cyan-primary text-warm-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
            {t('pricing.most_popular')}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-gray mb-1">
          {product.shortName}
        </h2>
        {product.tagline && (
          <p className="text-sm text-slate-gray/60 mb-3">{product.tagline}</p>
        )}
        <div className="text-3xl font-bold text-slate-gray">
          {formatPrice(product.billingPrice, product.currency)}
          <span className="text-lg font-normal text-slate-gray/60">/{product.billingInterval}</span>
        </div>
        {product.billingNote && (
          <p className="mt-1 text-xs text-slate-gray/50">{product.billingNote}</p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-gray/80">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelectPlan}
        disabled={isLoading || isCurrentPlan || isCheckoutLoading}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
          isCurrentPlan
            ? 'bg-teal-600 text-white cursor-default'
            : isPopular
            ? 'bg-cyan-primary hover:bg-cyan-hover text-warm-white shadow-md'
            : 'bg-slate-gray hover:bg-slate-gray/90 text-warm-white'
        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {t('pricing.processing')}
          </>
        ) : isCurrentPlan ? (
          t('pricing.current_plan_btn')
        ) : (
          t('pricing.choose_plan_btn')
        )}
      </button>
    </div>
  );
}
