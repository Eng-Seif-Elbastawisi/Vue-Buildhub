import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../../constant/equipment.type.enum';
import IndexBrandParams from '../index.brand.params';

describe('IndexBrandParams', () => {
  it('maps pagination and optional filters', () => {
    expect(
      new IndexBrandParams('acme', 2, 25, 1, '2026-06-17', EquipmentTypeEnum.materials).toMap(),
    ).toEqual({
      word: 'acme',
      with_pagination: 1,
      page: 2,
      per_page: 25,
      date_remove: '2026-06-17',
      equipment_type: EquipmentTypeEnum.materials,
    });
  });
});
