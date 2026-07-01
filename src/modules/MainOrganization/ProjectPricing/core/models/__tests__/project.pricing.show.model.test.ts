import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../constant/project.pricing.discount.enum';
import ProjectPricingShowModel from '../project.pricing.show.model';

const pricingJson = {
  id: 7,
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.PERCENTAGE,
  discount_value: 10,
};

describe('ProjectPricingShowModel', () => {
  it('maps project pricing show JSON and freezes the instance', () => {
    const model = ProjectPricingShowModel.fromJson(pricingJson);

    expect(model).toMatchObject(pricingJson);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() =>
      ProjectPricingShowModel.fromJson(undefined as unknown as Record<string, unknown>),
    ).toThrow('Invalid ProjectPricingShowModel');
    expect(ProjectPricingShowModel.example).toBeInstanceOf(ProjectPricingShowModel);
  });
});
