import { describe, expect, it } from 'vitest';
import measurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import MaterialsShowModel from '../materials.show.model';

describe('MaterialsShowModel', () => {
  it('normalizes translated material details for edit forms', () => {
    const brand = measurementModel.example;
    const model = MaterialsShowModel.fromJson({
      id: 2,
      brand,
      price: 90,
      unit: 1,
      title: [{ locale: 'en', title: 'Steel' }],
      status: 0,
    });

    expect(model.id).toBe(2);
    expect(model.brand).toMatchObject({ id: brand.id, title: brand.title });
    expect(model.translations.title).toEqual({ en: 'Steel' });
    expect(model.status).toBe(false);
  });
});
