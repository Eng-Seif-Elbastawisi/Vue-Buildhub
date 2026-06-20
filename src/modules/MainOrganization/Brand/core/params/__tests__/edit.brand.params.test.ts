import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../../constant/equipment.type.enum';
import EditBrandParams from '../edit.brand.params';

describe('EditBrandParams', () => {
  it('maps and validates brand update payload', () => {
    expect(
      new EditBrandParams({ brand_id: 4, equipment: EquipmentTypeEnum.services }).toMap(),
    ).toEqual({ brand_id: 4, equipment: EquipmentTypeEnum.services });
    expect(new EditBrandParams({ brand_id: undefined }).validate().isValid).toBe(false);
  });
});
