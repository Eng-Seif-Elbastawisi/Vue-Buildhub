import { describe, expect, it } from 'vitest';
import DeleteProjectPricingParams from '../delete.project.pricing.params';

describe('DeleteProjectPricingParams', () => {
  it('maps and validates the project pricing id', () => {
    const params = new DeleteProjectPricingParams({ project_pricing_id: 4 });

    expect(params.toMap()).toEqual({ project_pricing_id: 4 });
    expect(params.validate().isValid).toBe(true);
    expect(
      new DeleteProjectPricingParams({
        project_pricing_id: undefined as unknown as number,
      }).validate().isValid,
    ).toBe(false);
  });
});
