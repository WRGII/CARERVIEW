import React, { useState } from 'react';
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
      // error is surfaced by the parent via setStatusMessage
    } finally {
      setIsLoading(false);
    }
  };

  const features = extractFeatures(product.description);

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
        <h3 className="text-xl font-bold text-slate-gray mb-2">
          {product.name}
        </h3>
        <div className="text-3xl font-bold text-slate-gray">
          {product.planId === 'free' ? (
            <span>{t('pricing.plan_free_price')}</span>
          ) : (
            <>
              {formatPrice(product.price, product.currency)}
              <span className="text-lg font-normal text-slate-gray/60">{t('pricing.per_quarter')}</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
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

function extractFeatures(description: string): string[] {
  const features: string[] = [];

  if (description.includes('3 Observations per year')) {
    features.push('3 Observations per year');
  }
  if (description.includes('Join by invite')) {
    features.push('Join by invite from a caregiver');
  }
  if (description.includes('Read updates')) {
    features.push('Read updates in the family timeline');
  }

  const caregiverMatch = description.match(/(\d+|Up to \d+) caregiver/i);
  if (caregiverMatch) {
    features.push(`${caregiverMatch[1]} caregiver${caregiverMatch[1] !== '1' ? 's' : ''}`);
  }

  const observationsMatch = description.match(/(\d+)\s+(shared\s+)?[Oo]bservations( a year| per year)/i);
  if (observationsMatch) {
    const shared = observationsMatch[2] ? 'shared ' : '';
    features.push(`${observationsMatch[1]} ${shared}Observations per year`);
  }

  if (description.includes('clear record')) {
    features.push('Trend reports & PDF summaries');
  }

  if (description.includes('collaborate')) {
    features.push('Shared weekly digest & reminders');
  }

  if (description.includes('33%')) {
    features.push('33% savings vs three Primary plans');
  }

  return features;
}
