import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats crore, lac and small amounts as before', () => {
    expect(formatPrice(25000000)).toBe('PKR 2.50 Crore');
    expect(formatPrice(150000)).toBe('PKR 1.50 Lac');
    expect(formatPrice(5000)).toBe('PKR 5,000');
  });

  it('appends a suffix after a space', () => {
    expect(formatPrice(150000, '/ month')).toBe('PKR 1.50 Lac / month');
    expect(formatPrice(5000, '/ month')).toBe('PKR 5,000 / month');
  });

  it('ignores an empty or missing suffix', () => {
    expect(formatPrice(150000, '')).toBe('PKR 1.50 Lac');
    expect(formatPrice(150000, undefined)).toBe('PKR 1.50 Lac');
  });
});
