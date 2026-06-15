import { describe, expect, it } from 'vitest';
import { EquipmentTypeEnum } from '../../constant/equipment.type.enum';
import AddBrandParams from '../add.brand.params';
import DeleteBrandParams from '../delete.brand.params';
import EditBrandParams from '../edit.brand.params';
import IndexBrandParams from '../index.brand.params';
import ShowBrandParams from '../show.brand.params';

describe('brand params', () => {
  it('maps add and edit payloads', () => {
    expect(new AddBrandParams({ name: 'Acme', equipment: EquipmentTypeEnum.materials }).toMap())
      .toEqual({ name: 'Acme', equipment: EquipmentTypeEnum.materials });
    expect(new EditBrandParams({ brand_id: 5, equipment: EquipmentTypeEnum.services }).toMap())
      .toEqual({ brand_id: 5, equipment: EquipmentTypeEnum.services });
  });

  it('maps list filters and omits empty optional filters', () => {
    expect(new IndexBrandParams('acme', 2, 25, 1, '2026-06-15', EquipmentTypeEnum.equipment).toMap()).toEqual({
      word: 'acme', with_pagination: 1, page: 2, per_page: 25, date_remove: '2026-06-15', equipment_type: EquipmentTypeEnum.equipment,
    });
    expect(new IndexBrandParams().toMap()).toEqual({ with_pagination: 1, page: 1, per_page: 10 });
  });

  it('maps and validates identifiers', () => {
    expect(new ShowBrandParams({ brand_id: 9 }).toMap()).toEqual({ brand_id: 9 });
    expect(new DeleteBrandParams({ brand_id: 9 }).toMap()).toEqual({ brand_id: 9 });
    expect(new DeleteBrandParams({ brand_id: null as unknown as number }).validate().isValid).toBe(false);
  });
});
