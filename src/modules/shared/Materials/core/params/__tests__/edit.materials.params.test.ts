import { describe, expect, it } from 'vitest';
import EditMaterialParams from '../edit.materials.params';

describe('EditMaterialParams', () => {
  it('maps and validates material update payload', () => {
    const translations = { title: { en: 'Steel' } };
    const params = new EditMaterialParams({
      material_id: 9,
      price: 20,
      brandId: 4,
      measurementId: 3,
      translations,
    });
    expect(params.toMap()).toEqual({
      material_id: 9,
      price: 20,
      brand_id: 4,
      measurement_unit_id: 3,
      translations,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
