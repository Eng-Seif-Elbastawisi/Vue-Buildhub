import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../constant/project.pricing.discount.enum';
import EditProjectPricingParams from '../edit.project.pricing.params';

const payload = {
  project_pricing_id: 12,
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.PERCENTAGE,
  discount_value: 10,
};

describe('EditProjectPricingParams', () => {
  it('maps and validates edit payloads', () => {
    const params = new EditProjectPricingParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });

  it('requires discount type selection', () => {
    const params = new EditProjectPricingParams({
      project_pricing_id: 12,
      total_tax: 14,
      discount_value: 10,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'discount_type' }],
    });
  });

  it('rejects percentage discounts above 100', () => {
    const params = new EditProjectPricingParams({
      project_pricing_id: 12,
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
