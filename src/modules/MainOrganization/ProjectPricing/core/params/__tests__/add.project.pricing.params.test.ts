import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../constant/project.pricing.discount.enum';
import AddProjectPricingParams from '../add.project.pricing.params';

const payload = {
  project_id: 4,
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

  it('requires discount type selection', () => {
    const params = new AddProjectPricingParams({
      project_id: 4,
      total_tax: 14,
      discount_value: 250,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'discount_type' }],
    });
  });

  it('rejects percentage discounts above 100', () => {
    const params = new AddProjectPricingParams({
      project_id: 4,
      total_tax: 14,
      discount_type: ProjectPricingDiscountEnum.PERCENTAGE,
      discount_value: 200,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'discount_value' }],
    });
  });
});
