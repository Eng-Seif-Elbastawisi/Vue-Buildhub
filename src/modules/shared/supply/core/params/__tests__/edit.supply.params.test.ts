import { describe, expect, it } from 'vitest';
import EditSupplyParams from '../edit.supply.params';

describe('EditSupplyParams', () => {
  it('maps and validates supply update payload', () => {
    const translations = { title: { en: 'Steel' } };
    const params = new EditSupplyParams({
      supply_id: 9,
      price: 20,
      brandId: 4,
      measurementId: 3,
      translations,
    });
    expect(params.toMap()).toEqual({
      supply_id: 9,
      price: 20,
      brand_id: 4,
      measurement_unit_id: 3,
      translations,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
