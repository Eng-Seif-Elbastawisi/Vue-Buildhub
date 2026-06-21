import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../../constant/equipment.type.enum';
import BrandShowModel from '../brand.show.model';

describe('BrandShowModel', () => {
  it('maps brand show JSON and freezes the instance', () => {
    const model = BrandShowModel.fromJson({
      id: 2,
      title: 'Acme',
      equipment: EquipmentTypeEnum.services,
    });

    expect(model).toMatchObject({ id: 2, title: 'Acme', equipment: EquipmentTypeEnum.services });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => BrandShowModel.fromJson(null)).toThrow('Invalid BrandShowModel data');
    expect(BrandShowModel.example).toBeInstanceOf(BrandShowModel);
  });
});
