export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  shortName: string;
  tagline: string;
  price: number;
  currency: string;
  currencySymbol: string;
  billingPeriod: string;
  monthlyEquivalent: string;
  mode: 'subscription' | 'payment';
  features: string[];
  isPopular?: boolean;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TW2OREgJTTCsLC',
    priceId: 'price_1SZ0JMGiCMwtCdgydBnTnX4a',
    name: 'CarerView - Primary Caregiver Plan',
    shortName: 'Primary Caregiver',
    tagline: 'Perfect for solo caregivers',
    price: 12.50,
    currency: 'usd',
    currencySymbol: '$',
    billingPeriod: 'per 3 months',
    monthlyEquivalent: 'Less than $1/week',
    mode: 'subscription',
    features: [
      '30 observations per year',
      'Approximately 1 check-in per week',
      'Trend reports & PDF summaries',
      'Secure caregiver dashboard',
      'Billed quarterly',
    ],
  },
  {
    id: 'prod_TW2RHuPJHLfg1L',
    priceId: 'price_1ThwvbGiCMwtCdgyyRZr2FME',
    name: 'CarerView - Family Circle Plan',
    shortName: 'Family Circle',
    tagline: 'Best for coordinated family care',
    price: 25.50,
    currency: 'usd',
    currencySymbol: '$',
    billingPeriod: 'per 3 months',
    monthlyEquivalent: 'Under $9/month — save 33%',
    mode: 'subscription',
    isPopular: true,
    features: [
      'Up to 3 caregivers included',
      'Up to 100 shared observations per year',
      'Shared family timeline & notes',
      'Trend reports & PDF summaries',
      'Billed quarterly — 33% savings',
    ],
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find((p) => p.priceId === priceId);
}