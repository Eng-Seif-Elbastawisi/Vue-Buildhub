import { describe, expect, it } from 'vitest';
import { DiscountType, getDiscountTypeNameKey } from '../discount.type.enum';

describe('shared package discount types', () => {
  it.each([
    [DiscountType.PERCENTAGE, 'package.discount.percentage'],
    [DiscountType.VALUE, 'package.discount.value'],
  ])('maps discount type %s to its label key', (discountType, expectedLabelKey) => {
    expect(getDiscountTypeNameKey(discountType)).toBe(expectedLabelKey);
  });
});
