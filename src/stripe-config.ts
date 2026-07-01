export type StripeMode = 'subscription' | 'payment';

export interface StripeProduct {
  id: string;
  priceId: string;
  planId: string;
  name: string;
  shortName: string;
  tagline: string;
  /** Quarterly billing price (what the customer pays per cycle) */
  billingPrice: number;
  /** Alias for billingPrice — used by legacy PricingCard */
  price: number;
  pricePerUnit: number;
  currencySymbol: string;
  currency: string;
  mode: StripeMode;
  billingInterval: string;
  billingNote: string;
  features: string[];
  /** Legacy description string for backwards-compat */
  description: string;
  highlighted: boolean;
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'free',
    priceId: '',
    planId: 'free',
    name: 'CarerView - Community Member',
    shortName: 'Community Member',
    tagline: 'Get started at no cost.',
    billingPrice: 0,
    price: 0,
    pricePerUnit: 0,
    currencySymbol: '$',
    currency: 'usd',
    mode: 'subscription',
    billingInterval: 'year',
    billingNote: 'Free forever',
    description: 'Community member plan with basic access.',
    features: [
      'Community access',
      'Basic observations',
    ],
    highlighted: false,
  },
  {
    id: 'prod_TW2OREgJTTCsLC',
    priceId: 'price_1SZ0JMGiCMwtCdgydBnTnX4a',
    planId: 'primary_qtr',
    name: 'CarerView - Primary Caregiver Plan',
    shortName: 'Primary Caregiver',
    tagline: 'For a single dedicated caregiver.',
    billingPrice: 12.50,
    price: 12.50,
    pricePerUnit: 25.50,
    currencySymbol: '$',
    currency: 'usd',
    mode: 'subscription',
    billingInterval: 'quarter',
    billingNote: 'Less than $1/week, billed quarterly',
    description: '1 caregiver. 30 shared Observations a year. Trend reports & PDF summaries to keep a clear record.',
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
    planId: 'family_qtr',
    name: 'CarerView - Family Circle Plan',
    shortName: 'Family Circle',
    tagline: 'For families caring together.',
    billingPrice: 25.50,
    price: 25.50,
    pricePerUnit: 45.50,
    currencySymbol: '$',
    currency: 'usd',
    mode: 'subscription',
    billingInterval: 'quarter',
    billingNote: 'Less than $9/month — save 33% vs. 3 Primary plans',
    description: 'Up to 3 caregivers. 100 shared Observations a year. Trend reports & PDF summaries. Shared dashboard. Save 33% vs three Primary plans.',
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