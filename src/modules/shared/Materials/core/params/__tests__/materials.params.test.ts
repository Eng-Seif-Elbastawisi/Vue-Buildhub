import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import AddMaterialsParams from '../add.materials.params';
import DeleteMaterialParams from '../delete.materials.params';
import EditMaterialParams from '../edit.materials.params';
import IndexMaterialParams from '../index.materials.params';
import ShowMaterialParams from '../show.materials.params';

const translations = { title: { en: 'Cement', ar: 'Cement AR' } };

describe('material params', () => {
  it('maps add and edit payloads', () => {
    const add = new AddMaterialsParams({
      price: 125,
      brandId: 7,
      measurementId: UnitTypeEnum.bag,
      itemTypeId: 2,
      translations,
    });
    const edit = new EditMaterialParams({
      material_id: 3,
      price: 150,
      brandId: 7,
      measurementId: UnitTypeEnum.bag,
      translations,
    });

    expect(add.toMap()).toMatchObject({
      price: 125,
      brand_id: 7,
      measurement_unit_id: UnitTypeEnum.bag,
      translations,
      item_type_id: 2,
    });
    expect(edit.toMap()).toMatchObject({
      material_id: 3,
      price: 150,
      brand_id: 7,
      measurement_unit_id: UnitTypeEnum.bag,
      translations,
    });
    expect(add.validate().isValid).toBe(true);
    expect(edit.validate().isValid).toBe(true);
  });

  it('maps list filters and omits empty optional filters', () => {
    expect(
      new IndexMaterialParams('cement', 2, 20, 1, '2026-06-15', UnitTypeEnum.bag).toMap(),
    ).toEqual({
      word: 'cement',
      with_pagination: 1,
      page: 2,
      per_page: 20,
      date_remove: '2026-06-15',
      unit: UnitTypeEnum.bag,
    });
    expect(new IndexMaterialParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('maps and validates identifiers', () => {
    expect(new ShowMaterialParams({ material_id: 4 }).toMap()).toEqual({ material_id: 4 });
    expect(new DeleteMaterialParams({ material_id: 4 }).toMap()).toEqual({ material_id: 4 });
    expect(
      new ShowMaterialParams({ material_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
