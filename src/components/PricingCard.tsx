import React, { useState } from 'react';
import { Check, Loader as Loader2 } from 'lucide-react';
import { StripeProduct, formatPrice } from '../stripe-config';

interface PricingCardProps {
  product: StripeProduct;
  onSelectPlan: (priceId: string, planId: string) => Promise<void>;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

export function PricingCard({ product, onSelectPlan, isPopular = false, isCurrentPlan = false }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    setIsLoading(true);
    try {
      await onSelectPlan(product.priceId, product.planId);
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = extractFeatures(product.description);

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
      isCurrentPlan ? 'border-green-500 scale-105' :
      isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {product.name.replace('CarerView - ', '')}
        </h3>
        <div className="text-3xl font-bold text-gray-900">
          {formatPrice(product.price, product.currency)}
          <span className="text-lg font-normal text-gray-600">/3 months</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelectPlan}
        disabled={isLoading || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isCurrentPlan
            ? 'bg-green-600 text-white cursor-default'
            : isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          'Choose Plan'
        )}
      </button>
    </div>
  );
}

function extractFeatures(description: string): string[] {
  const features: string[] = [];
  
  // Extract caregiver count
  const caregiverMatch = description.match(/(\d+|Up to \d+) caregiver/i);
  if (caregiverMatch) {
    features.push(`${caregiverMatch[1]} caregiver${caregiverMatch[1] !== '1' ? 's' : ''}`);
  }
  
  // Extract observations
  const observationsMatch = description.match(/(\d+)\s+(shared\s+)?observations per year/i);
  if (observationsMatch) {
    const shared = observationsMatch[2] ? 'shared ' : '';
    features.push(`${observationsMatch[1]} ${shared}observations per year`);
  }
  
  // Extract features
  if (description.includes('Trend reports')) {
    features.push('Trend reports & PDF summaries');
  }
  
  // Extract savings info
  const savingsMatch = description.match(/(\d+)% savings/i);
  if (savingsMatch) {
    features.push(`${savingsMatch[1]}% savings vs individual plans`);
  }
  
  return features;
}