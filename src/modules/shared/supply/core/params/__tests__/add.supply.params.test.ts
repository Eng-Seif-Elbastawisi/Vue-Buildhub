import { describe, expect, it } from 'vitest';
import AddSupplyParams from '../add.supply.params';

describe('AddSupplyParams', () => {
  it('maps and validates supply create payload', () => {
    const translations = { title: { en: 'Cement', ar: 'Cement AR' } };
    const params = new AddSupplyParams({
      price: 12,
      brandId: 3,
      measurementId: 2,
      translations,
    });
    expect(params.toMap()).toEqual({
      price: 12,
      brand_id: 3,
      measurement_unit_id: 2,
      translations,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
