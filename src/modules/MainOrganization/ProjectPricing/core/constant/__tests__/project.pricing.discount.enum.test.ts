import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../project.pricing.discount.enum';

describe('ProjectPricingDiscountEnum', () => {
  it('exposes stable project pricing discount type ids', () => {
    expect(ProjectPricingDiscountEnum).toEqual({
      FIXED: 1,
      PERCENTAGE: 2,
    });
  });
});
