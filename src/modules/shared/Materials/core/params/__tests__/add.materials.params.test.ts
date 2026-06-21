import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import AddMaterialsParams from '../add.materials.params';

describe('AddMaterialsParams', () => {
  it('maps and validates material create payload', () => {
    const translations = { title: { en: 'Cement', ar: 'Cement AR' } };
    const params = new AddMaterialsParams({
      price: 12,
      brandId: 3,
      unit: UnitTypeEnum.bag,
      translations,
    });
    expect(params.toMap()).toEqual({ price: 12, brandId: 3, unit: UnitTypeEnum.bag, translations });
    expect(params.validate().isValid).toBe(true);
  });
});
