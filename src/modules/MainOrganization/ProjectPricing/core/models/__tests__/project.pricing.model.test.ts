import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../constant/project.pricing.discount.enum';
import ProjectPricingModel from '../project.pricing.model';

const pricingJson = {
  id: 7,
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.FIXED,
  discount_value: 250,
};

describe('ProjectPricingModel', () => {
  it('maps project pricing JSON and freezes the instance', () => {
    const model = ProjectPricingModel.fromJson(pricingJson);

    expect(model).toMatchObject(pricingJson);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('rejects empty JSON and exposes an example', () => {
    expect(() => ProjectPricingModel.fromJson(null as unknown as Record<string, unknown>)).toThrow(
      'Cannot create ProjectPricingModel',
    );
    expect(ProjectPricingModel.example).toBeInstanceOf(ProjectPricingModel);
  });
});
