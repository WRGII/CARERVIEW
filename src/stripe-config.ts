export interface StripeProduct {
  id: string;
  priceId: string;
  planId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'free',
    priceId: '',
    planId: 'free',
    name: 'Free Observer',
    description: 'Make a note when you visit. Stay connected—free forever.',
    price: 0,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_T8danfAgDGYrLJ',
    priceId: 'price_1SCMJYGiqZeZmBYJo31EKRFG',
    planId: 'primary_qtr',
    name: 'Primary Caregiver',
    description: 'One caregiver, one clear record. 30 Observations a year keep trends visible and care plans on track.',
    price: 12.50,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_T8dapkbvd0XobR',
    priceId: 'price_1SCMJVGiqZeZmBYJkoSNcopS',
    planId: 'family_qtr',
    name: 'Family Circle',
    description: 'Everyone\'s notes, one shared story. Up to 3 caregivers collaborate without friction.',
    price: 25.50,
    currency: 'usd',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};