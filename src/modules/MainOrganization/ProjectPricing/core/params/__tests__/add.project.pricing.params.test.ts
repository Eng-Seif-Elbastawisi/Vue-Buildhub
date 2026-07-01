import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../constant/project.pricing.discount.enum';
import AddProjectPricingParams from '../add.project.pricing.params';

const payload = {
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.FIXED,
  discount_value: 250,
};

describe('AddProjectPricingParams', () => {
  it('maps and validates add payloads', () => {
    const params = new AddProjectPricingParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });
});
