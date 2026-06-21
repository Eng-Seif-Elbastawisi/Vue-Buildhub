import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../equipment.type.enum';

describe('EquipmentTypeEnum', () => {
  it('exposes stable equipment type identifiers', () => {
    expect(EquipmentTypeEnum).toEqual({ materials: 1, equipment: 2, services: 3 });
  });
});
