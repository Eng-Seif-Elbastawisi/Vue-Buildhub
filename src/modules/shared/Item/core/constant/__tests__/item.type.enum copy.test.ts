import { describe, expect, it } from 'vitest';
import { ItemTypeEnum } from '../item.type.enum copy';

describe('ItemTypeEnum', () => {
  it('exposes stable item type ids', () => {
    expect(ItemTypeEnum).toEqual({
      MANUFACTURING: 1,
      MATERIAL: 2,
      MATERIAL_MANUFACTURING: 3,
      SUPPLY_INSTALLATION: 4,
    });
  });
});
