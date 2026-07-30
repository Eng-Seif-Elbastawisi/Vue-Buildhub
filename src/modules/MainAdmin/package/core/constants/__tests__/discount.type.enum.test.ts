import { describe, expect, it } from 'vitest';
import { DiscountType, getDiscountTypeNameKey } from '../discount.type.enum';

describe('admin package discount compatibility exports', () => {
  it('keeps existing admin imports mapped to the shared contract', () => {
    expect(getDiscountTypeNameKey(DiscountType.PERCENTAGE)).toBe('package.discount.percentage');
  });
});
