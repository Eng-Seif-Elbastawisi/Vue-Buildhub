import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import EditMaterialParams from '../edit.materials.params';

describe('EditMaterialParams', () => {
  it('maps and validates material update payload', () => {
    const translations = { title: { en: 'Steel' } };
    const params = new EditMaterialParams({
      material_id: 9,
      price: 20,
      brandId: 4,
      unit: UnitTypeEnum.box,
      translations,
    });
    expect(params.toMap()).toEqual({
      material_id: 9,
      price: 20,
      brandId: 4,
      unit: UnitTypeEnum.box,
      translations,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
