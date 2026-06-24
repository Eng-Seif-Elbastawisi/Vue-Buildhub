import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import AddSupplyParams from '../add.supply.params';
import DeleteSupplyParams from '../delete.supply.params';
import EditSupplyParams from '../edit.supply.params';
import IndexSupplyParams from '../index.supply.params';
import ShowSupplyParams from '../show.supply.params';

const translations = { title: { en: 'Cement', ar: 'Cement AR' } };

describe('supply params', () => {
  it('maps add and edit payloads', () => {
    const add = new AddSupplyParams({
      price: 125,
      brandId: 7,
      measurementId: 2,
      translations,
    });
    const edit = new EditSupplyParams({
      supply_id: 3,
      price: 150,
      brandId: 7,
      measurementId: 2,
      translations,
    });
    expect(add.toMap()).toEqual({
      price: 125,
      brand_id: 7,
      measurement_unit_id: 2,
      translations,
    });
    expect(edit.toMap()).toEqual({
      material_id: 3,
      price: 150,
      brand_id: 7,
      measurement_unit_id: 2,
      translations,
    });
    expect(add.validate().isValid).toBe(true);
    expect(edit.validate().isValid).toBe(true);
  });

  it('maps list filters and omits empty optional filters', () => {
    expect(
      new IndexSupplyParams('cement', 2, 20, 1, '2026-06-15', UnitTypeEnum.bag).toMap(),
    ).toEqual({
      word: 'cement',
      with_pagination: 1,
      page: 2,
      per_page: 20,
      date_remove: '2026-06-15',
      unit: UnitTypeEnum.bag,
    });
    expect(new IndexSupplyParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('maps and validates identifiers', () => {
    expect(new ShowSupplyParams({ supply_id: 4 }).toMap()).toEqual({ material_id: 4 });
    expect(new DeleteSupplyParams({ supply_id: 4 }).toMap()).toEqual({ material_id: 4 });
    expect(new ShowSupplyParams({ supply_id: null as unknown as number }).validate().isValid).toBe(
      false,
    );
  });
});
