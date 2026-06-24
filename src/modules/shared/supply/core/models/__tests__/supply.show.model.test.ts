import { describe, expect, it } from 'vitest';
import SupplyShowModel from '../supply.show.model';

const brand = { id: 8, title: 'Acme' };
const measurementUnit = { id: 4, title: 'Bag' };

describe('SupplyShowModel', () => {
  it('normalizes translated supply details for edit forms', () => {
    const model = SupplyShowModel.fromJson({
      id: 2,
      brand,
      measurement_unit: measurementUnit,
      price: 90,
      unit: 1,
      title: [{ locale: 'en', title: 'Steel' }],
    });

    expect(model.id).toBe(2);
    expect(model.brandId).toEqual(brand);
    expect(model.measurementId).toEqual(measurementUnit);
    expect(model.translations.title).toEqual({ en: 'Steel' });
  });
});
