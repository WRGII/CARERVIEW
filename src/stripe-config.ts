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
    name: 'Free Community Member',
    description: 'Access all 6 caregiver support rooms. Post, reply, and react with other caregivers. Post anonymously when you need privacy. No invite required — join instantly.',
    price: 0,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_TW2OREgJTTCsLC',
    priceId: 'price_1SZ0JMGiCMwtCdgydBnTnX4a',
    planId: 'primary_qtr',
    name: 'Primary Caregiver',
    description: 'One caregiver, one clear record. 30 Observations a year keep trends visible and care plans on track.',
    price: 12.50,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_TW2RHuPJHLfg1L',
    priceId: 'price_1SZ0MsGiCMwtCdgyT6uihjXf',
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