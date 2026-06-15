import { describe, expect, it } from 'vitest';
import MaterialsShowModel from '../materials.show.model';

describe('MaterialsShowModel', () => {
  it('normalizes translated material details for edit forms', () => {
    const model = MaterialsShowModel.fromJson({
      id: 2,
      brandId: 8,
      price: 90,
      unit: 1,
      translations: [{ locale: 'en', title: 'Steel' }],
    });

    expect(model.id).toBe(2);
    expect(model.brandId).toBe(8);
    expect(model.translations.title).toEqual({ en: 'Steel' });
  });
});
