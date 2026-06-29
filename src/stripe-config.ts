export type StripeMode = 'subscription' | 'payment';

export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  shortName: string;
  tagline: string;
  billingPrice: number;
  pricePerUnit: number;
  currencySymbol: string;
  currency: string;
  mode: StripeMode;
  billingInterval: string;
  billingNote: string;
  features: string[];
  highlighted: boolean;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TW2OREgJTTCsLC',
    priceId: 'price_1SZ0JMGiCMwtCdgydBnTnX4a',
    name: 'CarerView - Primary Caregiver Plan',
    shortName: 'Primary Caregiver',
    tagline: 'For a single dedicated caregiver.',
    billingPrice: 12.50,
    pricePerUnit: 25.50,
    currencySymbol: '$',
    currency: 'usd',
    mode: 'subscription',
    billingInterval: 'quarter',
    billingNote: 'Less than $1/week, billed quarterly',
    features: [
      '30 observations per year',
      'Approx. 1 observation per week',
      'Trend reports & analytics',
      'PDF summary exports',
      '1 caregiver seat',
    ],
    highlighted: false,
  },
  {
    id: 'prod_TW2RHuPJHLfg1L',
    priceId: 'price_1ThwvbGiCMwtCdgyyRZr2FME',
    name: 'CarerView - Family Circle Plan',
    shortName: 'Family Circle',
    tagline: 'For families caring together.',
    billingPrice: 25.50,
    pricePerUnit: 45.50,
    currencySymbol: '$',
    currency: 'usd',
    mode: 'subscription',
    billingInterval: 'quarter',
    billingNote: 'Less than $9/month — save 33% vs. 3 Primary plans',
    features: [
      'Up to 3 caregiver seats',
      '100 shared observations per year',
      'Trend reports & analytics',
      'PDF summary exports',
      'Shared family dashboard',
    ],
    highlighted: true,
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find((p) => p.priceId === priceId);
}