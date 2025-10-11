export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_T8danfAgDGYrLJ',
    priceId: 'price_1SCMJYGiqZeZmBYJo31EKRFG',
    name: 'CarerView - Primary Caregiver Plan',
    description: '1 caregiver Features: 30 observations per year (~1 per week) Trend reports & PDF summaries. Billed: USD$12.50 every 3 months ( Less than $1/week), billed every. Seats:',
    price: 12.50,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_T8dapkbvd0XobR',
    priceId: 'price_1SCMJVGiqZeZmBYJkoSNcopS',
    name: 'CarerView - Family Circle Plan',
    description: 'Seats: Up to 3 caregivers Features:100 shared observations per year. BIlled: USD$25.50 every three months (< $9/month) - a 33% savings compared to three Primary plans',
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