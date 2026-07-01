import { describe, expect, it } from 'vitest';
import ShowProjectPricingParams from '../show.project.pricing.params';

describe('ShowProjectPricingParams', () => {
  it('maps and validates the project pricing id', () => {
    const params = new ShowProjectPricingParams({ project_pricing_id: 4, allLocales: true });

    expect(params.toMap()).toEqual({ project_pricing_id: 4 });
    expect(params.allLocales).toBe(true);
    expect(params.validate().isValid).toBe(true);
    expect(
      new ShowProjectPricingParams({ project_pricing_id: null as unknown as number }).validate()
        .isValid,
    ).toBe(false);
  });
});
