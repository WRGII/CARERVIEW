import { describe, it, expect } from 'vitest';
import { STRIPE_PRODUCTS, getProductByPriceId, formatPrice } from './stripe-config';

describe('STRIPE_PRODUCTS', () => {
  it('contains exactly 3 products', () => {
    expect(STRIPE_PRODUCTS).toHaveLength(3);
  });

  it('has free, primary_qtr, and family_qtr plan IDs', () => {
    const ids = STRIPE_PRODUCTS.map((p) => p.planId);
    expect(ids).toEqual(['free', 'primary_qtr', 'family_qtr']);
  });

  it('free plan has zero price and empty priceId', () => {
    const free = STRIPE_PRODUCTS.find((p) => p.planId === 'free')!;
    expect(free.price).toBe(0);
    expect(free.priceId).toBe('');
  });

  it('paid plans have non-empty priceIds', () => {
    const paid = STRIPE_PRODUCTS.filter((p) => p.planId !== 'free');
    for (const p of paid) {
      expect(p.priceId).toBeTruthy();
      expect(p.priceId).toMatch(/^price_/);
    }
  });
});

describe('getProductByPriceId', () => {
  it('returns the correct product for a known priceId', () => {
    const primary = STRIPE_PRODUCTS.find((p) => p.planId === 'primary_qtr')!;
    const result = getProductByPriceId(primary.priceId);
    expect(result).toEqual(primary);
  });

  it('returns undefined for an unknown priceId', () => {
    expect(getProductByPriceId('price_nonexistent')).toBeUndefined();
  });

  it('returns free product for empty string (free plan has empty priceId)', () => {
    const result = getProductByPriceId('');
    expect(result?.planId).toBe('free');
  });
});

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(12.5, 'usd')).toBe('$12.50');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0, 'usd')).toBe('$0.00');
  });

  it('handles case-insensitive currency code', () => {
    const lower = formatPrice(25.5, 'usd');
    const upper = formatPrice(25.5, 'USD');
    expect(lower).toBe(upper);
  });
});
