import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../../constant/equipment.type.enum';
import AddBrandParams from '../add.brand.params';

describe('AddBrandParams', () => {
  it('maps brand create payload', () => {
    expect(
      new AddBrandParams({ name: 'Acme', equipment: EquipmentTypeEnum.equipment }).toMap(),
    ).toEqual({ name: 'Acme', equipment: EquipmentTypeEnum.equipment });
  });
});
