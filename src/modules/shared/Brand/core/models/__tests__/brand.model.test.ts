import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../../constant/equipment.type.enum';
import BrandModel from '../brand.model';

describe('BrandModel', () => {
  it('maps brand list JSON and freezes the instance', () => {
    const model = BrandModel.fromJson({
      id: 1,
      title: 'Acme',
      equipment: EquipmentTypeEnum.materials,
    });

    expect(model).toMatchObject({ id: 1, title: 'Acme', equipment: EquipmentTypeEnum.materials });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => BrandModel.fromJson(null)).toThrow('Cannot create SuppliersModel');
    expect(BrandModel.example).toBeInstanceOf(BrandModel);
  });
});
