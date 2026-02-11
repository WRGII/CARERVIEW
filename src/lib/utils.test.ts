import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateTime } from './utils';

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('returns empty string with no inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('formatDate', () => {
  it('formats ISO string to readable date', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('accepts Date objects', () => {
    const result = formatDate(new Date('2024-06-01'));
    expect(result).toContain('2024');
  });
});

describe('formatDateTime', () => {
  it('includes time components', () => {
    const result = formatDateTime('2024-01-15T14:30:00.000Z');
    expect(result).toContain('2024');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('accepts Date objects', () => {
    const result = formatDateTime(new Date('2024-06-01T09:15:00Z'));
    expect(result).toContain('2024');
  });
});
